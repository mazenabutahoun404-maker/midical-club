import type { AccountService } from "../../types/accounts";
import type { ApiClient } from "./client";
import { ApiError } from "./client";
export function requireVersion(version: unknown): asserts version is string {
  if (typeof version !== "string" || !version.trim())
    throw new ApiError(
      "Reload this record before making a change.",
      409,
      "VERSION_REQUIRED",
    );
}
export function createHttpAccounts(api: ApiClient): AccountService {
  const requirePassword = (value: string) => {
    if (!value)
      throw new ApiError(
        "Enter your current password.",
        422,
        "PASSWORD_REQUIRED",
      );
  };
  const endSession = (owner: string | undefined) => {
    if (api.session.get()?.sessionId !== owner)
      throw new ApiError("The session changed.", 401, "SESSION_CHANGED");
    api.session.clear();
  };
  return {
    academicProfile: () => api.call("get_api_v1_me_academic_profile"),
    requestEmailChange: async (password, newEmail) => {
      requirePassword(password);
      if (!/^\S+@\S+\.\S+$/.test(newEmail.trim()))
        throw new ApiError(
          "Enter a valid email address.",
          422,
          "EMAIL_INVALID",
        );
      return api.call("post_api_v1_me_email_change_request", {
        body: { password, newEmail: newEmail.trim() },
      });
    },
    confirmEmailChange: async (challengeId, code) => {
      if (!challengeId || !/^\d{6}$/.test(code))
        throw new ApiError("Enter the verification code.", 422, "INVALID_CODE");
      const owner = api.session.get()?.sessionId;
      await api.call("post_api_v1_me_email_change_confirm", {
        body: { challengeId, code },
      });
      endSession(owner);
    },
    changePassword: async (currentPassword, newPassword) => {
      requirePassword(currentPassword);
      if (newPassword.length < 15 || newPassword.length > 128)
        throw new ApiError(
          "Use 15–128 characters for your new password.",
          422,
          "PASSWORD_RULES",
        );
      const owner = api.session.get()?.sessionId;
      await api.call("post_api_v1_me_change_password", {
        body: { currentPassword, newPassword },
      });
      endSession(owner);
    },
    deleteAccount: async (password) => {
      requirePassword(password);
      const owner = api.session.get()?.sessionId;
      await api.call("delete_api_v1_me_account", { body: { password } });
      endSession(owner);
    },
  };
}
