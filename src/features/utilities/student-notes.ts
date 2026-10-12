export interface StudentNote {
  id: string;
  title: string;
  body: string;
  courseId?: string;
  updatedAt: string;
}
const validId = (id: string) =>
  !!id &&
  id.length <= 200 &&
  !["guest", "__proto__", "constructor", "prototype"].includes(id);
export const notesKey = (userId: string) => {
  if (!validId(userId)) throw new Error("SIGNED_IN_ACCOUNT_REQUIRED");
  return "medclub:student-notes:v1:" + encodeURIComponent(userId);
};
export function normalizeNotes(value: unknown): StudentNote[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .slice(0, 500)
    .flatMap((item) => {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.id !== "string" ||
        !validId(item.id) ||
        seen.has(item.id) ||
        typeof item.body !== "string"
      )
        return [];
      seen.add(item.id);
      return [
        {
          id: item.id,
          title: typeof item.title === "string" ? item.title.slice(0, 150) : "",
          body: item.body.slice(0, 25000),
          ...(typeof item.courseId === "string" && validId(item.courseId)
            ? { courseId: item.courseId }
            : {}),
          updatedAt:
            typeof item.updatedAt === "string" &&
            !Number.isNaN(Date.parse(item.updatedAt))
              ? item.updatedAt
              : new Date(0).toISOString(),
        },
      ];
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export function readNotes(userId: string): StudentNote[] {
  try {
    return normalizeNotes(
      JSON.parse(localStorage.getItem(notesKey(userId)) || "[]"),
    );
  } catch {
    return [];
  }
}
/** Device-local adapter. Callers always supply the current signed-in account. */
export function saveNote(userId: string, note: StudentNote) {
  const key = notesKey(userId);
  const validated = normalizeNotes([note])[0];
  if (!validated) throw new Error("INVALID_NOTE");
  const existing = readNotes(userId);
  if (existing.length >= 500 && !existing.some((item) => item.id === note.id))
    throw new Error("NOTES_LIMIT_REACHED");
  const notes = [validated, ...existing.filter((item) => item.id !== note.id)];
  localStorage.setItem(key, JSON.stringify(notes));
  window.dispatchEvent(
    new CustomEvent("medclub:notes-updated", { detail: key }),
  );
}
export function removeNote(userId: string, id: string) {
  const key = notesKey(userId);
  localStorage.setItem(
    key,
    JSON.stringify(readNotes(userId).filter((item) => item.id !== id)),
  );
  window.dispatchEvent(
    new CustomEvent("medclub:notes-updated", { detail: key }),
  );
}
export function migrateCourseNote(
  userId: string,
  courseId: string,
  legacyKey: string,
) {
  const marker = notesKey(userId) + ":migrated:" + encodeURIComponent(courseId);
  if (localStorage.getItem(marker)) return;
  const raw = JSON.parse(
    localStorage.getItem(legacyKey + ":tools:v1") || "null",
  );
  if (
    typeof raw?.notes === "string" &&
    raw.notes.trim() &&
    !readNotes(userId).some((note) => note.id === "legacy-" + courseId)
  )
    saveNote(userId, {
      id: "legacy-" + courseId,
      title: "Study notes",
      body: raw.notes,
      courseId,
      updatedAt: new Date().toISOString(),
    });
  localStorage.setItem(marker, "1");
}
