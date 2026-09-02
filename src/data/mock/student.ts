import type { StudentProfile } from "../../types/student";
import { text } from "../../lib/localize";
/** Illustrative profile only. A real account adapter will return the current student. */
export const student: StudentProfile = {
  id: "demo-student",
  name: text("Demo student", "طالب تجريبي"),
  initials: text("DS", "ط"),
  program: text("Medicine", "الطب"),
  batch: text("Shifaa", "شفاء"),
  year: 3,
  courseIds: ["anatomy", "physiology", "biochemistry"],
  focusMinutes: 25,
  bio: text(
    "A little curiosity, a little consistency, and something new to learn every day.",
    "قليل من الفضول، وقليل من الاستمرار، وشيء جديد نتعلّمه كل يوم.",
  ),
};
