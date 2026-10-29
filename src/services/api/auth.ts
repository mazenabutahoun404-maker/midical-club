import type { AuthService, AuthSnapshot } from "../../types/auth";
import type { StudentProfile } from "../../types/student";
import type { ApiClient } from "./client";
import { ApiError } from "./client";
import { initials, localized } from "./mapping";
import type { Operations } from "./schema.generated";
import { isTokenPair } from "./session";

type Account = Operations["get_api_v1_auth_me"]["response"];
type Pending = {
  challengeId: string;
  email: string;
  purpose: "registration" | "reset";
};
const pendingKey = "medclub.api.challenge.v1";
export function createHttpAuth(
  api: ApiClient,
  storage: Storage | null = null,
): AuthService {
  let account: Account | null = null;
  let pending: Pending | null = null;
  let profileRequest: Promise<Account> | null = null;
  let resetToken: string | null = null;
  const listeners = new Set<() => void>();
  try {
    const saved = JSON.parse(
      storage?.getItem(pendingKey) || "null",
    ) as Pending | null;
    if (
      saved &&
      typeof saved.challengeId === "string" &&
      typeof saved.email === "string" &&
      ["registration", "reset"].includes(saved.purpose)
    )
      pending = saved;
  } catch {
    /* Challenge persistence is optional. */
  }
  const setPending = (next: Pending | null) => {
    pending = next;
    try {
      if (next) storage?.setItem(pendingKey, JSON.stringify(next));
      else storage?.removeItem(pendingKey);
    } catch {
      /* Keep in memory. */
    }
    listeners.forEach((listener) => listener());
  };
  let sessionId = api.session.get()?.sessionId;
  api.session.subscribe(() => {
    const nextId = api.session.get()?.sessionId;
    if (nextId !== sessionId) {
      account = null;
      profileRequest = null;
      resetToken = null;
      sessionId = nextId;
    }
    listeners.forEach((listener) => listener());
  });
  const load = async () => {
    if (!api.session.get())
      throw new ApiError("Sign in to continue.", 401, "UNAUTHORIZED");
    if (!profileRequest) {
      const owner = api.session.get()!.sessionId;
      profileRequest = api
        .call("get_api_v1_auth_me")
        .then((next) => {
          if (api.session.get()?.sessionId !== owner)
            throw new ApiError("The session changed.", 401, "SESSION_CHANGED");
          if (
            !next ||
            typeof next.id !== "string" ||
            typeof next.fullName !== "string" ||
            typeof next.profileVersion !== "string"
          )
            throw new ApiError(
              "The account response is incomplete.",
              502,
              "INVALID_RESPONSE",
            );
          account = next;
          return next;
        })
        .finally(() => {
          if (api.session.get()?.sessionId === owner) profileRequest = null;
        });
    }
    return profileRequest;
  };
  const profile = async (me: Account): Promise<StudentProfile> => {
    const batchId = me.academicProfile?.batchId;
    let batch = localized(batchId || "", batchId || "");
    if (batchId) {
      try {
        const b = await api.call("get_api_v1_academics_batches_by_batchId", {
          path: { batchId },
        });
        batch = localized(b.nameEn, b.nameAr);
      } catch (error) {
        if (!(error instanceof ApiError) || ![403, 404].includes(error.status))
          throw error;
      }
    }
    return {
      id: me.id,
      universityNumber: me.studentNumber || undefined,
      name: localized(me.fullName, me.fullName),
      initials: localized(initials(me.fullName), initials(me.fullName)),
      program: localized("Medicine", "الطب"),
      batch,
      batchId: batchId || undefined,
      year: me.academicProfile?.studyYear || 0,
      courseIds: [],
      focusMinutes: me.focusMinutes,
      bio: localized(me.bio, me.bio),
      profileVersion: me.profileVersion,
    };
  };
  const snapshot = async (): Promise<AuthSnapshot> => {
    const owner = api.session.get()?.sessionId;
    if (!api.session.get())
      return pending?.purpose === "registration"
        ? {
            status: "verification-required",
            user: null,
            pendingEmail: pending.email,
          }
        : { status: "anonymous", user: null };
    let me: Account;
    try {
      me = account || (await load());
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401 &&
        error.code !== "SESSION_CHANGED"
      ) {
        api.session.clear();
        return { status: "anonymous", user: null };
      }
      throw error;
    }
    const status =
      me.accountStatus === "PendingEmailVerification"
        ? "verification-required"
        : "authenticated";
    if (me.accountStatus === "Disabled" || me.accountStatus === "Deleted") {
      api.session.clear();
      throw new ApiError(
        "This account is unavailable.",
        403,
        "ACCOUNT_UNAVAILABLE",
      );
    }
    const student = await profile(me);
    if (api.session.get()?.sessionId !== owner)
      throw new ApiError("The session changed.", 401, "SESSION_CHANGED");
    return {
      status,
      user: {
        id: me.id,
        email: me.email || "",
        emailVerified: me.accountStatus === "Active",
        createdAt: "",
        profile: student,
      },
      pendingEmail:
        status === "verification-required" ? me.email || undefined : undefined,
    };
  };
  const service: AuthService = {
    mode: "api",
    reauthenticate: async (password) => {
      const current = await snapshot();
      if (current.status !== "authenticated" || !current.user?.email)
        throw new ApiError("Sign in to continue.", 401, "UNAUTHORIZED");
      const next = await service.signIn({
        email: current.user.email,
        password,
      });
      if (next.user?.id !== current.user.id) {
        api.session.clear();
        throw new ApiError(
          "The account changed during confirmation.",
          401,
          "SESSION_CHANGED",
        );
      }
      return next;
    },
    getSnapshot: snapshot,
    getProfile: async () => {
      const next = await snapshot();
      if (!next.user)
        throw new ApiError("Sign in to continue.", 401, "UNAUTHORIZED");
      return next.user.profile;
    },
    signIn: async (input) => {
      const revision = api.session.revision();
      const pair = await api.call("post_api_v1_auth_login", {
        body: {
          identifier: input.email.trim(),
          password: input.password,
          device: "medClub web",
        },
      });
      if (!isTokenPair(pair))
        throw new ApiError(
          "The login response is incomplete.",
          502,
          "INVALID_RESPONSE",
        );
      if (api.session.revision() !== revision)
        throw new ApiError("The session changed.", 401, "SESSION_CHANGED");
      account = null;
      api.session.set(pair);
      setPending(null);
      return snapshot();
    },
    register: async (input) => {
      const revision = api.session.revision();
      if (!input.batch)
        throw new ApiError("Select an available batch.", 422, "BATCH_REQUIRED");
      if (input.password.length < 15 || input.password.length > 128)
        throw new ApiError(
          "Use 15–128 characters for your password.",
          422,
          "PASSWORD_RULES",
        );
      const result = await api.call("post_api_v1_auth_register", {
        body: {
          fullName: input.fullName.trim(),
          email: input.email.trim(),
          password: input.password,
          studentNumber: input.universityNumber,
          batchId: input.batch,
          studyYear: input.year,
          ...(input.gender ? { gender: input.gender } : {}),
        },
      });
      if (api.session.revision() !== revision)
        throw new ApiError("The session changed.", 401, "SESSION_CHANGED");
      api.session.clear();
      account = null;
      resetToken = null;
      setPending({
        challengeId: result.challengeId,
        email: input.email.trim(),
        purpose: "registration",
      });
      return snapshot();
    },
    verifyEmail: async (code) => {
      if (!pending || pending.purpose !== "registration")
        throw new ApiError(
          "Request a new verification code.",
          422,
          "VERIFICATION_MISSING",
        );
      const result = await api.call("post_api_v1_auth_email_verify", {
        body: { challengeId: pending.challengeId, code },
      });
      if (!("activated" in result) || !result.activated)
        throw new ApiError(
          "The verification response did not activate the account.",
          422,
          "INVALID_VERIFICATION_RESULT",
        );
      setPending(null);
      account = null;
      // Verification does not return tokens. The student signs in after activation.
      return snapshot();
    },
    resendVerification: async (email) => {
      resetToken = null;
      const result = await api.call("post_api_v1_auth_email_send", {
        body: { identifier: email.trim() },
      });
      setPending({
        challengeId: result.challengeId,
        email: email.trim(),
        purpose: "registration",
      });
    },
    requestPasswordReset: async (email) => {
      const result = await api.call("post_api_v1_auth_forgot_password", {
        body: { identifier: email.trim() },
      });
      resetToken = null;
      setPending({
        challengeId: result.challengeId,
        email: email.trim(),
        purpose: "reset",
      });
      return { accepted: true, email: email.trim() };
    },
    verifyPasswordReset: async (code) => {
      if (!pending || pending.purpose !== "reset")
        throw new ApiError(
          "Request a new password reset code.",
          422,
          "VERIFICATION_MISSING",
        );
      const result = await api.call("post_api_v1_auth_email_verify", {
        body: { challengeId: pending.challengeId, code },
      });
      if (!("resetToken" in result) || !result.resetToken)
        throw new ApiError(
          "The verification response did not contain a reset token.",
          422,
          "INVALID_VERIFICATION_RESULT",
        );
      resetToken = result.resetToken;
    },
    resetPassword: async (newPassword) => {
      if (!resetToken)
        throw new ApiError(
          "Verify the reset code first.",
          422,
          "VERIFICATION_MISSING",
        );
      if (newPassword.length < 15 || newPassword.length > 128)
        throw new ApiError(
          "Use 15–128 characters for your password.",
          422,
          "PASSWORD_RULES",
        );
      await api.call("post_api_v1_auth_reset_password", {
        body: { resetToken, newPassword },
      });
      resetToken = null;
      setPending(null);
      api.session.clear();
      account = null;
    },
    updateProfile: async (input) => {
      const me = account || (await load());
      await api.call("patch_api_v1_me_profile", {
        body: {
          expectedVersion: me.profileVersion,
          fullName: input.fullName.trim(),
          bio: input.bio,
          focusMinutes: input.focusMinutes,
        },
      });
      account = null;
      await load();
      listeners.forEach((listener) => listener());
      return snapshot();
    },
    restoreProfile: async (before, expected) => {
      const me = await load();
      if (me.id !== before.id || me.profileVersion !== expected.profileVersion)
        throw new ApiError("The profile changed.", 409, "PROFILE_CHANGED");
      await api.call("patch_api_v1_me_profile", {
        body: {
          expectedVersion: me.profileVersion,
          fullName: before.name.en,
          bio: before.bio.en,
          focusMinutes: before.focusMinutes,
        },
      });
      account = null;
      return snapshot();
    },
    signOut: async () => {
      const owner = api.session.get()?.sessionId;
      try {
        if (api.session.get()) await api.call("post_api_v1_auth_logout");
      } finally {
        if (api.session.get()?.sessionId === owner) {
          api.session.clear();
          account = null;
          resetToken = null;
          setPending(null);
        }
      }
      return { status: "anonymous", user: null };
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  return service;
}
