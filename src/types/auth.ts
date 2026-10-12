import type { StudentProfile } from "./student";

export type AuthStatus =
  "anonymous" | "verification-required" | "authenticated";

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  profile: StudentProfile;
}

export interface AuthSnapshot {
  status: AuthStatus;
  user: AuthUser | null;
  pendingEmail?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  year: number;
  batch: string;
}

export interface AuthProfileInput {
  fullName: string;
  year: number;
  batch: string;
  focusMinutes: number;
  bio: string;
}

export interface PasswordResetResult {
  accepted: true;
  email: string;
}

export interface AuthService {
  getSnapshot: () => Promise<AuthSnapshot>;
  getProfile: () => Promise<StudentProfile>;
  signIn: (input: SignInInput) => Promise<AuthSnapshot>;
  register: (input: RegisterInput) => Promise<AuthSnapshot>;
  verifyEmail: (code: string) => Promise<AuthSnapshot>;
  requestPasswordReset: (email: string) => Promise<PasswordResetResult>;
  updateProfile: (input: AuthProfileInput) => Promise<AuthSnapshot>;
  /** Restore editable fields only, if the current record still matches. */
  restoreProfile?: (
    before: StudentProfile,
    expected: StudentProfile,
  ) => Promise<AuthSnapshot>;
  signOut: () => Promise<AuthSnapshot>;
  subscribe: (listener: () => void) => () => void;
}
