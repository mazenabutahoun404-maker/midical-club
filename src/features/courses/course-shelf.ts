import type { Batch, ClinicalYear, Course } from "../../types/content";

/** Use the actual curriculum containing this course; never mix unrelated years. */
export function shelfCourses(
  course: Course,
  courses: Course[],
  batches: Batch[],
  years: ClinicalYear[],
) {
  const batch = batches.find(
    (item) =>
      item.studyYear === course.year &&
      item.terms.some(
        (term) => term.current && term.courseIds.includes(course.id),
      ),
  );
  const term = batch?.terms.find(
    (item) => item.current && item.courseIds.includes(course.id),
  );
  const year = years.find(
    (item) => item.year === course.year && item.courseIds.includes(course.id),
  );
  const ids = term?.courseIds || year?.courseIds;
  return courses.filter((item) =>
    ids
      ? ids.includes(item.id)
      : item.track === course.track && item.year === course.year,
  );
}
