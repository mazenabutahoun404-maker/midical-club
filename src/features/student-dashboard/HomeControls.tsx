import { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { useLocale } from "../../app/providers/LocaleProvider";
import { APP_TIMEZONE } from "../../constants/config";
import { calendarDate } from "../../lib/calendar";
import { shortcutChoices } from "./personal-home-model";
import type { PersonalHomeData } from "./usePersonalHome";

export function HomeControls({
  data,
  kind,
  close,
}: {
  data: PersonalHomeData;
  kind: "exam" | "shortcuts";
  close: () => void;
}) {
  const { t } = useLocale();
  const [shortcuts, setShortcuts] = useState(data.preferences.shortcuts);
  const [title, setTitle] = useState(data.preferences.exam?.title || "");
  const [course, setCourse] = useState(
    data.preferences.exam?.courseId || data.myCourses[0]?.id || "",
  );
  const date = data.preferences.exam
    ? new Date(data.preferences.exam.startsAt)
    : null;
  const [starts, setStarts] = useState(
    date
      ? `${calendarDate(date.toISOString())}T${new Intl.DateTimeFormat("en-GB", { timeZone: APP_TIMEZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date)}`
      : "",
  );
  const [error, setError] = useState("");
  function save(event: React.FormEvent) {
    event.preventDefault();
    if (kind === "shortcuts") {
      if (shortcuts.length !== 3) {
        setError(
          t({ en: "Choose three shortcuts.", ar: "اختر ثلاثة اختصارات." }),
        );
        return;
      }
      data.savePreferences({ ...data.preferences, shortcuts });
      close();
      return;
    }
    const timestamp = Date.parse(`${starts}:00+03:00`);
    if (
      !title.trim() ||
      !data.myCourses.some((c) => c.id === course) ||
      !Number.isFinite(timestamp) ||
      timestamp <= Date.now()
    ) {
      setError(
        t({
          en: "Enter an exam title, your course, and a future date and time.",
          ar: "أدخل اسم الامتحان ومساقك وموعداً مستقبلياً صحيحاً.",
        }),
      );
      return;
    }
    data.savePreferences({
      ...data.preferences,
      exam: {
        title: title.trim().slice(0, 100),
        courseId: course,
        startsAt: new Date(timestamp).toISOString(),
      },
    });
    close();
  }
  return (
    <Modal
      open
      onClose={close}
      title={t(
        kind === "exam"
          ? { en: "Your next exam", ar: "امتحانك القادم" }
          : { en: "Keep three things close", ar: "ثلاثة أشياء بالقرب منك" },
      )}
      description={t(
        kind === "exam"
          ? {
              en: "Save the date you know. Times are shown in Amman.",
              ar: "احفظ الموعد الذي تعرفه. الأوقات بتوقيت عمّان.",
            }
          : {
              en: "Your shortcuts keep the same order until you change them.",
              ar: "تبقى اختصاراتك بالترتيب نفسه حتى تغيّره.",
            },
      )}
      className="personal-home-dialog"
    >
      <form onSubmit={save} className="workspace-form" noValidate>
        {kind === "exam" ? (
          <>
            <label className="workspace-field">
              <span>{t({ en: "Exam title", ar: "اسم الامتحان" })}</span>
              <input
                id="home-exam-title"
                value={title}
                maxLength={100}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
            <label className="workspace-field">
              <span>{t({ en: "Course", ar: "المساق" })}</span>
              <select
                id="home-exam-course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              >
                {!course && (
                  <option value="">
                    {t({ en: "Choose a course", ar: "اختر مساقاً" })}
                  </option>
                )}
                {data.myCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.title)}
                  </option>
                ))}
              </select>
            </label>
            <label className="workspace-field">
              <span>
                {t({
                  en: "Date and time · Amman",
                  ar: "التاريخ والوقت · عمّان",
                })}
              </span>
              <input
                id="home-exam-time"
                type="datetime-local"
                dir="ltr"
                value={starts}
                onChange={(e) => setStarts(e.target.value)}
                required
              />
            </label>
            {data.preferences.exam && (
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  data.savePreferences({
                    shortcuts: data.preferences.shortcuts,
                  });
                  close();
                }}
              >
                {t({
                  en: "Remove this exam reminder",
                  ar: "إزالة تذكير هذا الامتحان",
                })}
              </button>
            )}
          </>
        ) : (
          <fieldset className="home-shortcut-choices">
            <legend>
              {t({ en: "Choose three", ar: "اختر ثلاثة" })} · {shortcuts.length}
              /3
            </legend>
            {shortcutChoices.map((item) => (
              <label key={item.id}>
                <input
                  type="checkbox"
                  checked={shortcuts.includes(item.id)}
                  disabled={
                    !shortcuts.includes(item.id) && shortcuts.length === 3
                  }
                  onChange={() =>
                    setShortcuts((current) =>
                      current.includes(item.id)
                        ? current.filter((id) => id !== item.id)
                        : [...current, item.id],
                    )
                  }
                />
                <span>{t(item.label)}</span>
              </label>
            ))}
          </fieldset>
        )}
        {error && (
          <p role="alert" className="auth-form-error">
            {error}
          </p>
        )}
        <p className="home-device-note">
          {t({
            en: "Saved privately for this account on this device.",
            ar: "يُحفظ بشكل خاص لهذا الحساب على هذا الجهاز.",
          })}
        </p>
        <div className="workspace-form-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={close}
          >
            {t({ en: "Cancel", ar: "إلغاء" })}
          </button>
          <button type="submit" className="button button-primary">
            {t({ en: "Save", ar: "حفظ" })}
          </button>
        </div>
      </form>
    </Modal>
  );
}
