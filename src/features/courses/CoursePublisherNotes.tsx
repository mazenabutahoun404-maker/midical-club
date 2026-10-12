import { offerUndo } from "../../components/feedback/undo-action";
import { useAuth } from "../../app/providers/AuthProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useEffect, useRef, useState } from "react";
import { Pencil, Save } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import {
  ActionReceipt,
  useActionReceipt,
} from "../../components/feedback/ActionReceipt";
import type { Text } from "../../types/content";

const empty: Text = { en: "", ar: "" };
export const publisherNotesKey = (id: string) =>
  "medclub:publisher-course-notes:v1:" + encodeURIComponent(id);
export function readPublisherNotes(id: string, fallback: Text = empty): Text {
  try {
    const raw = JSON.parse(
      localStorage.getItem(publisherNotesKey(id)) || "null",
    );
    return raw && typeof raw.en === "string" && typeof raw.ar === "string"
      ? { en: raw.en.slice(0, 25000), ar: raw.ar.slice(0, 25000) }
      : fallback;
  } catch {
    return fallback;
  }
}
export function writePublisherNotes(
  id: string,
  notes: Text,
  authorized: boolean,
) {
  if (!authorized) throw new Error("COURSE_EDIT_PERMISSION_REQUIRED");
  if (
    !id ||
    id.length > 200 ||
    typeof notes.en !== "string" ||
    typeof notes.ar !== "string"
  )
    throw new Error("INVALID_COURSE_NOTES");
  localStorage.setItem(
    publisherNotesKey(id),
    JSON.stringify({
      en: notes.en.slice(0, 25000),
      ar: notes.ar.slice(0, 25000),
    }),
  );
  window.dispatchEvent(
    new CustomEvent("medclub:publisher-notes-updated", {
      detail: publisherNotesKey(id),
    }),
  );
}
export function CoursePublisherNotes({
  courseId,
  initial,
  canEdit,
}: {
  courseId: string;
  initial?: Text;
  canEdit: boolean;
}) {
  const { t, locale } = useLocale(),
    feedback = useActionReceipt();
  const services = useServices(),
    { snapshot } = useAuth();
  const owner = `${snapshot.status}:${snapshot.user?.id || "guest"}`;
  const [notes, setNotes] = useState(() =>
      readPublisherNotes(courseId, initial),
    ),
    [draft, setDraft] = useState(notes),
    [editing, setEditing] = useState(false),
    [error, setError] = useState(false);
  const authorization = useRef(canEdit);
  authorization.current = canEdit;
  useEffect(() => {
    authorization.current = canEdit;
    return () => {
      authorization.current = false;
    };
  }, [canEdit]);
  useEffect(() => {
    const refresh = (event: Event) => {
      if (
        event.type === "storage"
          ? (event as StorageEvent).key === publisherNotesKey(courseId)
          : (event as CustomEvent).detail === publisherNotesKey(courseId)
      )
        setNotes(readPublisherNotes(courseId, initial));
    };
    window.addEventListener("storage", refresh);
    window.addEventListener("medclub:publisher-notes-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("medclub:publisher-notes-updated", refresh);
    };
  }, [courseId, initial]);
  useEffect(() => {
    if (!canEdit) setEditing(false);
  }, [canEdit]);
  return (
    <section
      className="course-publisher-notes"
      aria-label={t({ en: "Publisher notes", ar: "ملاحظات الناشر" })}
    >
      <header>
        <h3>{t({ en: "Publisher notes", ar: "ملاحظات الناشر" })}</h3>
        <ActionReceipt receipt={feedback.receipt} />
        {canEdit && !editing && (
          <button
            type="button"
            className="notebook-icon-button publisher-notes-edit"
            aria-label={t({
              en: "Edit publisher notes",
              ar: "تعديل ملاحظات الناشر",
            })}
            onClick={() => {
              setDraft(notes);
              setEditing(true);
              setError(false);
            }}
          >
            <Pencil size={16} />
          </button>
        )}
      </header>
      {editing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            try {
              const before = readPublisherNotes(courseId, initial),
                after = { ...draft };
              writePublisherNotes(courseId, after, canEdit);
              offerUndo({
                message: t({
                  en: "Publisher notes saved",
                  ar: "حُفظت ملاحظات الناشر",
                }),
                label: t({ en: "Undo", ar: "تراجع" }),
                restored: t({
                  en: "Previous notes restored",
                  ar: "استُعيدت الملاحظات السابقة",
                }),
                failed: t({
                  en: "Could not undo. These notes may have changed.",
                  ar: "تعذّر التراجع. ربما تغيّرت هذه الملاحظات.",
                }),
                canRestore: () => authorization.current,
                undo: async () => {
                  const fresh = await services.auth.getSnapshot();
                  if (`${fresh.status}:${fresh.user?.id || "guest"}` !== owner)
                    throw new Error("ACCOUNT_CHANGED");
                  if (
                    JSON.stringify(readPublisherNotes(courseId, initial)) !==
                    JSON.stringify(after)
                  )
                    throw new Error("COURSE_NOTES_CHANGED");
                  writePublisherNotes(courseId, before, authorization.current);
                  setNotes(before);
                  setDraft(before);
                },
              });
              setNotes(draft);
              setEditing(false);
              setError(false);
              feedback.flash("saved");
            } catch {
              setError(true);
            }
          }}
        >
          {(["en", "ar"] as const).map((language) => (
            <label key={language}>
              {t(
                language === "en"
                  ? { en: "English notes", ar: "الملاحظات بالإنجليزية" }
                  : { en: "Arabic notes", ar: "الملاحظات بالعربية" },
              )}
              <textarea
                autoFocus={language === locale}
                dir={language === "ar" ? "rtl" : "ltr"}
                value={draft[language]}
                maxLength={25000}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    [language]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
          <div>
            <button type="submit" className="notebook-button">
              <Save size={16} />
              {t({ en: "Save publisher notes", ar: "حفظ ملاحظات الناشر" })}
            </button>
            <button
              type="button"
              className="notebook-button"
              onClick={() => setEditing(false)}
            >
              {t({ en: "Cancel", ar: "إلغاء" })}
            </button>
          </div>
          {error && (
            <p role="alert">
              {t({
                en: "Could not save. Your draft is still here.",
                ar: "تعذّر الحفظ. مسودتك ما زالت هنا.",
              })}
            </p>
          )}
        </form>
      ) : notes[locale].trim() ? (
        <p className="publisher-note-text">{notes[locale]}</p>
      ) : (
        <p className="publisher-note-empty">
          {t({
            en: "No publisher notes yet.",
            ar: "لا توجد ملاحظات من الناشر بعد.",
          })}
        </p>
      )}
    </section>
  );
}
