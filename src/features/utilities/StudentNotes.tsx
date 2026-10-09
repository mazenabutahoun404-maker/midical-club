import {
  ActionReceipt,
  useActionReceipt,
} from "../../components/feedback/ActionReceipt";
import { useEffect, useRef, useState } from "react";
import { Download, Plus, Save, Trash2, LockKeyhole } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useCourses } from "../../hooks/useContent";
import { AppLink } from "../../components/navigation/AppLink";
import { signInPath } from "../../constants/routes";
import {
  migrateCourseNote,
  notesKey,
  readNotes,
  removeNote,
  saveNote,
  type StudentNote,
} from "./student-notes";
import "../../styles/student-tools.css";

export function StudentNotes({
  courseId,
  legacyKey,
  reference,
}: {
  courseId?: string;
  legacyKey?: string;
  reference?: string;
}) {
  const { snapshot } = useAuth(),
    { t } = useLocale();
  if (snapshot.status !== "authenticated" || !snapshot.user)
    return (
      <div className="student-tool-sign-in">
        <LockKeyhole size={24} />
        <h3>{t({ en: "Your private notebook", ar: "دفتر ملاحظاتك الخاص" })}</h3>
        <p>
          {t({
            en: "Sign in to write and save general notes or attach them to a course.",
            ar: "سجّل الدخول لكتابة ملاحظات عامة أو ربطها بمساق وحفظها.",
          })}
        </p>
        <AppLink
          className="button button-primary"
          href={signInPath(window.location.pathname)}
        >
          {t({ en: "Sign in for notes", ar: "تسجيل الدخول للملاحظات" })}
        </AppLink>
      </div>
    );
  return (
    <NotesEditor
      key={snapshot.user.id}
      userId={snapshot.user.id}
      courseId={courseId}
      legacyKey={legacyKey}
      reference={reference}
    />
  );
}
function NotesEditor({
  userId,
  courseId,
  legacyKey,
  reference,
}: {
  userId: string;
  courseId?: string;
  legacyKey?: string;
  reference?: string;
}) {
  const { t } = useLocale(),
    courses = useCourses();
  const feedback = useActionReceipt();
  const [notes, setNotes] = useState(() => readNotes(userId));
  const [draft, setDraft] = useState<StudentNote | null>(null),
    [courseNote, setCourseNote] = useState(false);
  const [dirty, setDirty] = useState(false),
    [status, setStatus] = useState<"ready" | "saved" | "error">("ready"),
    [deleting, setDeleting] = useState(false);
  const latest = useRef({ draft, dirty, courseNote });
  latest.current = { draft, dirty, courseNote };
  useEffect(() => {
    if (courseId && legacyKey) {
      try {
        migrateCourseNote(userId, courseId, legacyKey);
        setNotes(readNotes(userId));
      } catch {
        setStatus("error");
      }
    }
    const refresh = (event: Event) => {
      if (
        event.type === "storage"
          ? (event as StorageEvent).key === notesKey(userId)
          : (event as CustomEvent).detail === notesKey(userId)
      )
        setNotes(readNotes(userId));
    };
    const flush = () => {
      const current = latest.current;
      if (
        current.dirty &&
        current.draft &&
        (!current.courseNote || current.draft.courseId)
      ) {
        try {
          saveNote(userId, {
            ...current.draft,
            updatedAt: new Date().toISOString(),
          });
          current.dirty = false;
        } catch {
          /* The editor keeps the draft and exposes storage failure. */
        }
      }
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("medclub:notes-updated", refresh);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      window.removeEventListener("storage", refresh);
      window.removeEventListener("medclub:notes-updated", refresh);
      window.removeEventListener("pagehide", flush);
    };
  }, [userId, courseId, legacyKey]);
  function persist() {
    if (!draft || (courseNote && !draft.courseId)) return false;
    try {
      saveNote(userId, { ...draft, updatedAt: new Date().toISOString() });
      latest.current.dirty = false;
      setDirty(false);
      setStatus("saved");
      feedback.flash("saved");
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }
  useEffect(() => {
    if (!dirty || !draft || (courseNote && !draft.courseId)) return;
    const timer = setTimeout(persist, 600);
    return () => clearTimeout(timer);
  }, [draft, dirty, courseNote]);
  function choose(note: StudentNote) {
    if (dirty && !persist()) return;
    setDraft(note);
    setCourseNote(!!note.courseId);
    setDirty(false);
    setStatus("ready");
    setDeleting(false);
  }
  function patch(change: Partial<StudentNote>) {
    setDraft((current) => (current ? { ...current, ...change } : current));
    setDirty(true);
    setStatus("ready");
  }
  return (
    <section
      className="student-notes"
      aria-label={t({ en: "Private notes", ar: "ملاحظات خاصة" })}
    >
      <div className="student-notes-list">
        <button
          type="button"
          className="student-tool-primary"
          onClick={() => {
            if (dirty && !persist()) return;
            setDraft({
              id: crypto.randomUUID(),
              title: "",
              body: "",
              ...(courseId ? { courseId } : {}),
              updatedAt: new Date().toISOString(),
            });
            setCourseNote(!!courseId);
            setDirty(false);
            setStatus("ready");
            setDeleting(false);
          }}
        >
          <Plus size={16} />
          {t({ en: "New note", ar: "ملاحظة جديدة" })}
        </button>
        <label>
          {t({ en: "Saved notes", ar: "الملاحظات المحفوظة" })}
          <select
            value={
              draft && notes.some((item) => item.id === draft.id)
                ? draft.id
                : ""
            }
            onChange={(event) => {
              const note = notes.find((item) => item.id === event.target.value);
              if (note) choose(note);
            }}
          >
            <option value="">
              {t({ en: "Choose a note", ar: "اختر ملاحظة" })}
            </option>
            {notes.map((note) => (
              <option key={note.id} value={note.id}>
                {note.title ||
                  t({ en: "Untitled note", ar: "ملاحظة بلا عنوان" })}
                {note.courseId
                  ? " · " +
                    t(
                      courses.data?.find(
                        (course) => course.id === note.courseId,
                      )?.title || { en: "Course", ar: "مساق" },
                    )
                  : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      {draft ? (
        <div className="student-note-editor">
          <ActionReceipt receipt={feedback.receipt} />
          <label>
            {t({ en: "Note title", ar: "عنوان الملاحظة" })}
            <input
              value={draft.title}
              maxLength={150}
              onChange={(event) => patch({ title: event.target.value })}
            />
          </label>
          <div className="student-note-association">
            <label>
              {t({ en: "Note type", ar: "نوع الملاحظة" })}
              <select
                value={courseNote ? "course" : "general"}
                onChange={(event) => {
                  const attached = event.target.value === "course";
                  setCourseNote(attached);
                  patch({
                    courseId: attached
                      ? courseId || courses.data?.[0]?.id
                      : undefined,
                  });
                }}
              >
                <option value="general">
                  {t({ en: "General · private", ar: "عامة · خاصة" })}
                </option>
                <option value="course">
                  {t({ en: "Course · private", ar: "مساق · خاصة" })}
                </option>
              </select>
            </label>
            {courseNote && (
              <label>
                {t({ en: "Attach to course", ar: "ربط بالمساق" })}
                <select
                  value={draft.courseId || ""}
                  disabled={courses.isPending || courses.isError}
                  onChange={(event) =>
                    patch({ courseId: event.target.value || undefined })
                  }
                >
                  <option value="">
                    {t({ en: "Choose a course", ar: "اختر مساقاً" })}
                  </option>
                  {courses.data?.map((course) => (
                    <option key={course.id} value={course.id}>
                      {t(course.title)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {courseNote && courses.isError && (
            <p role="alert">
              {t({
                en: "Courses could not load.",
                ar: "تعذّر تحميل المساقات.",
              })}
              <button type="button" onClick={() => void courses.refetch()}>
                {t({ en: "Retry", ar: "أعد المحاولة" })}
              </button>
            </p>
          )}
          {reference && (
            <button
              type="button"
              className="study-note-reference"
              onClick={() =>
                patch({
                  body: (draft.body + "\n" + reference + "\n").slice(0, 25000),
                })
              }
            >
              {t({
                en: "Insert current page reference",
                ar: "إضافة مرجع الصفحة الحالية",
              })}
            </button>
          )}
          <label>
            {t({ en: "Private notes", ar: "ملاحظات خاصة" })}
            <textarea
              value={draft.body}
              maxLength={25000}
              placeholder={t({
                en: "Questions, key points, things to revisit…",
                ar: "أسئلة ونقاط مهمة وأمور للمراجعة…",
              })}
              onChange={(event) => patch({ body: event.target.value })}
            />
          </label>
          <div className="student-note-actions">
            <button
              type="button"
              className="student-tool-primary"
              disabled={courseNote && !draft.courseId}
              onClick={persist}
            >
              <Save size={16} />
              {t({ en: "Save note", ar: "حفظ الملاحظة" })}
            </button>
            <button
              type="button"
              aria-label={t({ en: "Download note", ar: "تنزيل الملاحظة" })}
              onClick={() => {
                const blob = new Blob([draft.title + "\n\n" + draft.body], {
                    type: "text/plain;charset=utf-8",
                  }),
                  url = URL.createObjectURL(blob),
                  link = document.createElement("a");
                link.href = url;
                link.download = "medclub-note.txt";
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }}
            >
              <Download size={16} />
            </button>
            {notes.some((item) => item.id === draft.id) && (
              <button
                type="button"
                aria-label={t({ en: "Delete note", ar: "حذف الملاحظة" })}
                onClick={() => setDeleting(true)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          {deleting && (
            <div
              className="student-note-delete"
              role="group"
              aria-label={t({ en: "Confirm deletion", ar: "تأكيد الحذف" })}
            >
              <p>{t({ en: "Delete this note?", ar: "حذف هذه الملاحظة؟" })}</p>
              <button
                type="button"
                onClick={() => {
                  try {
                    removeNote(userId, draft.id);
                    latest.current.dirty = false;
                    setDraft(null);
                    setDirty(false);
                    setDeleting(false);
                  } catch {
                    setStatus("error");
                  }
                }}
              >
                {t({ en: "Delete permanently", ar: "حذف نهائي" })}
              </button>
              <button type="button" onClick={() => setDeleting(false)}>
                {t({ en: "Keep note", ar: "الاحتفاظ بالملاحظة" })}
              </button>
            </div>
          )}
          <small role="status">
            {t(
              status === "error"
                ? {
                    en: "Could not save. Download a copy before leaving.",
                    ar: "تعذّر الحفظ. نزّل نسخة قبل المغادرة.",
                  }
                : courseNote && !draft.courseId
                  ? {
                      en: "Choose a course to save this note.",
                      ar: "اختر مساقاً لحفظ هذه الملاحظة.",
                    }
                  : dirty
                    ? { en: "Saving…", ar: "جارٍ الحفظ…" }
                    : status === "saved"
                      ? {
                          en: "Saved privately on this device.",
                          ar: "محفوظة بشكل خاص على هذا الجهاز.",
                        }
                      : {
                          en: "Only your signed-in account can see these notes here. Device-local storage.",
                          ar: "تظهر هذه الملاحظات لحسابك المسجّل فقط هنا. التخزين محلي على الجهاز.",
                        },
            )}
          </small>
        </div>
      ) : (
        <p className="student-tool-empty">
          {t({
            en: "Start a note or choose one you saved. Course notes stay private too.",
            ar: "ابدأ ملاحظة أو اختر ملاحظة محفوظة. ملاحظات المساقات تبقى خاصة أيضاً.",
          })}
        </p>
      )}
    </section>
  );
}
