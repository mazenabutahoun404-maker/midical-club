export const authMilestones = [
  "fullName",
  "universityNumber",
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
  value.length >= 15 && value.length <= 128;

export {
  normalizeUniversityNumber,
  isUniversityNumberReady,
} from "../../lib/university-number";
