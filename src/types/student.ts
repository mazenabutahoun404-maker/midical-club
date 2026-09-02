import type { Text } from "./content";
export interface StudentProfile {
  id: string;
  name: Text;
  initials: Text;
  program: Text;
  batch: Text;
  year: number;
  courseIds: string[];
  focusMinutes: number;
  bio: Text;
}
