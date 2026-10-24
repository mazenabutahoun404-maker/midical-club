import type { Text } from "./content";
export interface StudentProfile {
  id: string;
  /** Optional on existing accounts; collected for new registrations. */
  universityNumber?: string;
  name: Text;
  initials: Text;
  program: Text;
  batch: Text;
  year: number;
  courseIds: string[];
  focusMinutes: number;
  bio: Text;
}
