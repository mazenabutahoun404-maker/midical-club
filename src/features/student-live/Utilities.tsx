import { ContentPlaceholder } from "../../components/feedback/ContentPlaceholder";
import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { AppLink } from "../../components/navigation/AppLink";
import { record, string, number } from "../../services/api/mapping";
import type { Schemas } from "../../services/api/schema.generated";
import {
  canonicalPath,
  Panel,
  QueryStatus,
  rows,
  useStudentAction,
  useStudentConnection,
  useStudentQuery,
} from "./shared";

export function UtilityDirectory() {
  const { api, authenticated } = useStudentConnection(),
    { t, locale } = useLocale();
  const query = useStudentQuery(
    "utilities",
    (signal) => api.get_api_v1_utilities({ signal }),
    "",
    authenticated,
  );
  return (
    <Panel
      title={t({ en: "Available study tools", ar: "أدوات الدراسة المتاحة" })}
    >
      {!authenticated ? (
        <ContentPlaceholder
          compact
          icon="lock"
          title={t({
            en: "Sign in for your account’s study tools",
            ar: "سجّل الدخول لأدوات الدراسة المرتبطة بحسابك",
          })}
          href="/auth/sign-in?returnTo=%2Futilities"
          actionLabel={t({ en: "Sign in", ar: "تسجيل الدخول" })}
        />
      ) : (
        <QueryStatus query={query} />
      )}
      <div className="student-connected-actions">
        {rows(query.data).map((row) => {
          const path = canonicalPath(row.route);
          return path ? (
            <AppLink key={string(row.id)} href={path}>
              {string(
                locale === "ar"
                  ? row.nameAr || row.nameEn
                  : row.nameEn || row.nameAr,
              )}
            </AppLink>
          ) : null;
        })}
      </div>
    </Panel>
  );
}
export function PomodoroSettings({
  onApply,
}: {
  onApply?: (focus: number, rest: number) => void;
}) {
  const { owner, services } = useStudentConnection();
  if (!owner || !services.studentApi) return null;
  return <Settings key={owner} onApply={onApply} />;
}
function Settings({
  onApply,
}: {
  onApply?: (focus: number, rest: number) => void;
}) {
  const { api } = useStudentConnection(),
    { t } = useLocale(),
    action = useStudentAction();
  const query = useStudentQuery("pomodoro", (signal) =>
    api.get_api_v1_utilities_pomodoro_settings({ signal }),
  );
  const [draft, setDraft] = useState<Required<
    Schemas["PomodoroRequest"]
  > | null>(null);
  const data = record(query.data),
    value = draft || {
      focusMinutes: number(data.focusMinutes, 25),
      shortBreakMinutes: number(data.shortBreakMinutes, 5),
      longBreakMinutes: number(data.longBreakMinutes, 15),
      cyclesBeforeLongBreak: number(data.cyclesBeforeLongBreak, 4),
    };
  const fields = [
    ["focusMinutes", { en: "Focus minutes", ar: "دقائق التركيز" }],
    [
      "shortBreakMinutes",
      { en: "Short break minutes", ar: "دقائق الاستراحة القصيرة" },
    ],
    [
      "longBreakMinutes",
      { en: "Long break minutes", ar: "دقائق الاستراحة الطويلة" },
    ],
    [
      "cyclesBeforeLongBreak",
      { en: "Cycles before a long break", ar: "الجلسات قبل الاستراحة الطويلة" },
    ],
  ] as const;
  return (
    <details className="student-connected-panel">
      <summary>
        {t({ en: "Account timer settings", ar: "إعدادات مؤقّت الحساب" })}
      </summary>
      <QueryStatus query={query} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(
            () => api.put_api_v1_utilities_pomodoro_settings({ body: value }),
            () => {
              setDraft(null);
              onApply?.(value.focusMinutes, value.shortBreakMinutes);
            },
          );
        }}
      >
        {fields.map(([key, label]) => (
          <label key={key}>
            {t(label)}
            <input
              type="number"
              required
              min="1"
              max={key === "cyclesBeforeLongBreak" ? 20 : 180}
              value={value[key]}
              onChange={(e) =>
                setDraft({ ...value, [key]: Number(e.target.value) })
              }
            />
          </label>
        ))}
        <p>
          {t({
            en: "Saving changes your account preferences. Apply them to the desk while its timer is paused.",
            ar: "يحدّث الحفظ تفضيلات حسابك. طبّقها على المكتب عندما يكون المؤقّت متوقفاً.",
          })}
        </p>
        <Button disabled={action.busy || query.isPending || !!query.error}>
          {t({ en: "Save settings", ar: "حفظ الإعدادات" })}
        </Button>
        {onApply && (
          <Button
            type="button"
            variant="outline"
            disabled={query.isPending || !!query.error}
            onClick={() => onApply(value.focusMinutes, value.shortBreakMinutes)}
          >
            {t({ en: "Apply to desk", ar: "تطبيق على المكتب" })}
          </Button>
        )}
        {action.feedback}
      </form>
    </details>
  );
}
export function LiveGpa() {
  const { owner } = useStudentConnection();
  return <GpaForm key={owner || "guest"} />;
}
function GpaForm() {
  const { api, authenticated } = useStudentConnection(),
    { t } = useLocale(),
    action = useStudentAction();
  const [context, setContext] = useState("default"),
    [courses, setCourses] = useState<Schemas["GpaCourseRequest"][]>([
      { name: "", credits: 3, letterGrade: "" },
    ]),
    [previousGpa, setPreviousGpa] = useState(""),
    [previousCredits, setPreviousCredits] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const scale = useStudentQuery(
    "active-gpa-scale",
    (signal) =>
      api.get_api_v1_utilities_gpa_active_scale({ query: { context }, signal }),
    context,
    authenticated,
  );
  const grades = rows(record(scale.data).gradeEntries);
  function clear() {
    setResult(null);
  }
  return (
    <Panel title={t({ en: "GPA calculator", ar: "حاسبة المعدّل" })}>
      {!authenticated ? (
        <p>
          {t({
            en: "Sign in to calculate using the active university scale.",
            ar: "سجّل الدخول للحساب باستخدام سلم الجامعة الفعّال.",
          })}
        </p>
      ) : (
        <>
          <label>
            {t({ en: "Academic context", ar: "السياق الأكاديمي" })}
            <input
              value={context}
              onChange={(e) => {
                setContext(e.target.value);
                clear();
              }}
            />
          </label>
          <QueryStatus query={scale} />
          <p>{string(record(record(scale.data).scale).name)}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action.run(
                async () => {
                  const value = await api.post_api_v1_utilities_gpa_calculate({
                    body: {
                      context,
                      courses,
                      previousGpa:
                        previousGpa === "" ? null : Number(previousGpa),
                      previousCredits:
                        previousCredits === "" ? null : Number(previousCredits),
                    },
                  });
                  setResult(record(value));
                },
                undefined,
                t({ en: "Calculation ready", ar: "الحساب جاهز" }),
              );
            }}
          >
            {courses.map((course, index) => (
              <div key={index} className="student-connected-grid">
                <label>
                  {t({ en: "Course name", ar: "اسم المساق" })}
                  <input
                    required
                    value={course.name}
                    onChange={(e) => {
                      setCourses((v) =>
                        v.map((c, i) =>
                          i === index ? { ...c, name: e.target.value } : c,
                        ),
                      );
                      clear();
                    }}
                  />
                </label>
                <label>
                  {t({ en: "Credits", ar: "الساعات" })}
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={course.credits}
                    onChange={(e) => {
                      setCourses((v) =>
                        v.map((c, i) =>
                          i === index
                            ? { ...c, credits: Number(e.target.value) }
                            : c,
                        ),
                      );
                      clear();
                    }}
                  />
                </label>
                <label>
                  {t({ en: "Grade", ar: "التقدير" })}
                  <select
                    required
                    value={course.letterGrade || ""}
                    onChange={(e) => {
                      setCourses((v) =>
                        v.map((c, i) =>
                          i === index
                            ? { ...c, letterGrade: e.target.value }
                            : c,
                        ),
                      );
                      clear();
                    }}
                  >
                    <option value="" />
                    {grades.map((g) => (
                      <option key={string(g.id)} value={string(g.letterGrade)}>
                        {string(g.letterGrade)} · {number(g.gradePoints)}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  disabled={courses.length <= 1 || action.busy}
                  onClick={() => {
                    setCourses((v) => v.filter((_, i) => i !== index));
                    clear();
                  }}
                >
                  {t({ en: "Remove course", ar: "إزالة المساق" })}
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCourses((v) => [
                  ...v,
                  { name: "", credits: 3, letterGrade: "" },
                ]);
                clear();
              }}
            >
              {t({ en: "Add course", ar: "إضافة مساق" })}
            </Button>
            <div className="student-connected-grid">
              <label>
                {t({
                  en: "Previous GPA (optional)",
                  ar: "المعدّل السابق (اختياري)",
                })}
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={previousGpa}
                  onChange={(e) => {
                    setPreviousGpa(e.target.value);
                    clear();
                  }}
                />
              </label>
              <label>
                {t({
                  en: "Previous credits (optional)",
                  ar: "الساعات السابقة (اختياري)",
                })}
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={previousCredits}
                  onChange={(e) => {
                    setPreviousCredits(e.target.value);
                    clear();
                  }}
                />
              </label>
            </div>
            <Button disabled={action.busy || scale.isPending || !!scale.error}>
              {t({
                en: "Calculate with active scale",
                ar: "الحساب بالسلم الفعّال",
              })}
            </Button>
          </form>
          {result && (
            <div role="status">
              <h3>
                {t({ en: "Semester GPA", ar: "معدّل الفصل" })}:{" "}
                {number(result.semesterGpa).toFixed(3)}
              </h3>
              {result.projectedCumulativeGpa !== null && (
                <p>
                  {t({
                    en: "Projected cumulative GPA",
                    ar: "المعدّل التراكمي المتوقع",
                  })}
                  : {number(result.projectedCumulativeGpa).toFixed(3)}
                </p>
              )}
              <p>{string(result.disclaimer)}</p>
              <small>
                {t({ en: "Scale revision", ar: "إصدار السلم" })}{" "}
                {String(result.scaleRevision)}
              </small>
            </div>
          )}
          {action.feedback}
        </>
      )}
    </Panel>
  );
}
