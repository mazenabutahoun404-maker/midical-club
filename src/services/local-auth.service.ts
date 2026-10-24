import {
  normalizeUniversityNumber,
  isUniversityNumberReady,
} from "../lib/university-number";
import { STORAGE_KEYS } from "../constants/config";
import { student } from "../data/mock/student";
import type {
  AuthProfileInput,
  AuthService,
  AuthSnapshot,
  AuthUser,
  RegisterInput,
  SignInInput,
} from "../types/auth";
import type { StudentProfile } from "../types/student";

export const PREVIEW_CREDENTIALS = {
  email: "student@medclub.jo",
  password: "MedClub2026!",
  verificationCode: "260908",
} as const;

interface StoredAccount {
  user: AuthUser;
  credentialDigest: string;
}

interface StoredAuthState {
  session: AuthUser | null;
  accounts: StoredAccount[];
  pending: StoredAccount | null;
}

const demoUser: AuthUser = {
  id: student.id,
  email: PREVIEW_CREDENTIALS.email,
  emailVerified: true,
  createdAt: "2026-09-03T09:00:00+03:00",
  profile: student,
};

const initialState = (): StoredAuthState => ({
  session: null,
  accounts: [],
  pending: null,
});

const clone = <T>(value: T): T => structuredClone(value);
const normalizedEmail = (value: string) => value.trim().toLowerCase();
const text = (value: string) => ({ en: value.trim(), ar: value.trim() });

const profileFromRegistration = (input: RegisterInput): StudentProfile => {
  const initials = input.fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
  return {
    id: `student-${crypto.randomUUID?.() || Date.now().toString(36)}`,
    universityNumber: normalizeUniversityNumber(input.universityNumber),
    name: text(input.fullName),
    initials: text(initials || "MC"),
    program: { en: "Medicine", ar: "الطب" },
    batch: text(input.batch),
    year: input.year,
    courseIds: [],
    focusMinutes: 25,
    bio: {
      en: "Building a steady medical learning rhythm, one useful step at a time.",
      ar: "بناء إيقاع ثابت للتعلّم الطبي، خطوة مفيدة في كل مرة.",
    },
  };
};

async function credentialDigest(email: string, password: string) {
  const value = new TextEncoder().encode(
    `${normalizedEmail(email)}:${password}`,
  );
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", value);
    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  }
  let hash = 2166136261;
  value.forEach((byte) => {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  });
  return `preview-${(hash >>> 0).toString(36)}`;
}

function toSnapshot(state: StoredAuthState): AuthSnapshot {
  if (state.session)
    return { status: "authenticated", user: clone(state.session) };
  if (state.pending)
    return {
      status: "verification-required",
      user: null,
      pendingEmail: state.pending.user.email,
    };
  return { status: "anonymous", user: null };
}

function normalizeState(value: unknown): StoredAuthState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<StoredAuthState>;
  return {
    session:
      candidate.session && typeof candidate.session.email === "string"
        ? candidate.session
        : null,
    accounts: Array.isArray(candidate.accounts)
      ? candidate.accounts.filter(
          (account): account is StoredAccount =>
            !!account &&
            typeof account.credentialDigest === "string" &&
            typeof account.user?.email === "string",
        )
      : [],
    pending:
      candidate.pending &&
      typeof candidate.pending.credentialDigest === "string" &&
      typeof candidate.pending.user?.email === "string"
        ? candidate.pending
        : null,
  };
}

export function createLocalAuthService(): AuthService {
  let memory = initialState();
  const listeners = new Set<() => void>();

  const read = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.auth);
      if (raw === null) return clone(memory);
      const parsed = normalizeState(JSON.parse(raw));
      if (parsed) memory = parsed;
    } catch {
      // Keep the last valid in-memory state when storage is unavailable/corrupt.
    }
    return clone(memory);
  };

  const write = (state: StoredAuthState) => {
    memory = clone(state);
    try {
      localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(memory));
    } catch {
      // The preview remains usable for this tab when storage is blocked.
    }
    listeners.forEach((listener) => listener());
    return toSnapshot(memory);
  };

  return {
    getSnapshot: async () => toSnapshot(read()),
    getProfile: async () => {
      const session = read().session;
      return clone(session?.profile || student);
    },
    signIn: async ({ email, password }: SignInInput) => {
      const state = read();
      const cleanEmail = normalizedEmail(email);
      if (
        cleanEmail === PREVIEW_CREDENTIALS.email &&
        password === PREVIEW_CREDENTIALS.password
      ) {
        state.session = clone(demoUser);
        state.pending = null;
        return write(state);
      }
      const account = state.accounts.find(
        (item) => normalizedEmail(item.user.email) === cleanEmail,
      );
      if (
        !account ||
        account.credentialDigest !==
          (await credentialDigest(cleanEmail, password))
      )
        throw new Error("invalid-credentials");
      state.session = clone(account.user);
      state.pending = null;
      return write(state);
    },
    register: async (input: RegisterInput) => {
      if (!isUniversityNumberReady(input.universityNumber || ""))
        throw new Error("university-number-invalid");
      const state = read();
      const email = normalizedEmail(input.email);
      if (
        email === PREVIEW_CREDENTIALS.email ||
        state.accounts.some(
          (account) => normalizedEmail(account.user.email) === email,
        )
      )
        throw new Error("email-in-use");
      const profile = profileFromRegistration(input);
      const user: AuthUser = {
        id: profile.id,
        email,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        profile,
      };
      state.session = null;
      state.pending = {
        user,
        credentialDigest: await credentialDigest(email, input.password),
      };
      return write(state);
    },
    verifyEmail: async (code: string) => {
      const state = read();
      if (!state.pending) throw new Error("verification-missing");
      if (code.replace(/\D/g, "") !== PREVIEW_CREDENTIALS.verificationCode)
        throw new Error("invalid-code");
      const account = clone(state.pending);
      account.user.emailVerified = true;
      state.accounts = [
        ...state.accounts.filter(
          (item) => item.user.email !== account.user.email,
        ),
        account,
      ];
      state.session = clone(account.user);
      state.pending = null;
      return write(state);
    },
    requestPasswordReset: async (email: string) => ({
      accepted: true,
      email: normalizedEmail(email),
    }),
    updateProfile: async (input: AuthProfileInput) => {
      const state = read();
      if (!state.session) throw new Error("authentication-required");
      const profile = state.session.profile;
      profile.name = text(input.fullName);
      profile.initials = text(
        input.fullName
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() || "")
          .join("") || "MC",
      );
      profile.year = input.year;
      profile.batch = text(input.batch);
      profile.focusMinutes = input.focusMinutes;
      profile.bio = text(input.bio);
      state.accounts = state.accounts.map((account) =>
        account.user.id === state.session?.id
          ? { ...account, user: clone(state.session) }
          : account,
      );
      return write(state);
    },
    signOut: async () => {
      const state = read();
      state.session = null;
      return write(state);
    },
    restoreProfile: async (before, expected) => {
      const state = read();
      if (!state.session || state.session.profile.id !== before.id)
        throw new Error("authentication-required");
      if (JSON.stringify(state.session.profile) !== JSON.stringify(expected))
        throw new Error("PROFILE_CHANGED");
      for (const field of ["name", "initials", "batch", "bio"] as const)
        if (
          typeof before[field]?.en !== "string" ||
          typeof before[field]?.ar !== "string"
        )
          throw new Error("INVALID_PROFILE");
      if (
        !Number.isInteger(before.year) ||
        !Number.isFinite(before.focusMinutes)
      )
        throw new Error("INVALID_PROFILE");
      state.session.profile = {
        ...state.session.profile,
        name: clone(before.name),
        initials: clone(before.initials),
        batch: clone(before.batch),
        bio: clone(before.bio),
        year: before.year,
        focusMinutes: before.focusMinutes,
      };
      state.accounts = state.accounts.map((account) =>
        account.user.id === state.session?.id
          ? { ...account, user: clone(state.session) }
          : account,
      );
      return write(state);
    },
    subscribe: (listener) => {
      listeners.add(listener);
      const storageListener = (event: StorageEvent) => {
        if (event.key === STORAGE_KEYS.auth) listener();
      };
      if (typeof window !== "undefined")
        window.addEventListener("storage", storageListener);
      return () => {
        listeners.delete(listener);
        if (typeof window !== "undefined")
          window.removeEventListener("storage", storageListener);
      };
    },
  };
}
