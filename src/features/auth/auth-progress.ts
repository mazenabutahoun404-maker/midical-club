export const authMilestones = [
  "fullName",
  "email",
  "batch",
  "year",
  "password",
  "confirm",
] as const;
export type AuthMilestone = (typeof authMilestones)[number];
export const isEmailReady = (value: string) =>
  /^\S+@\S+\.\S+$/.test(value.trim());
export const isPasswordReady = (value: string) =>
  value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
