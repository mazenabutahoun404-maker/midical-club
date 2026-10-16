import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Upload,
  Pencil,
  ArrowLeft,
  Trash2,
  Eye,
  FileQuestion,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { AppLink } from "../../components/navigation/AppLink";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useExams, useExamQuery, useExamError } from "./useExams";
import { ExamHeading, ExamEmpty, ExamFailure } from "./ExamFrame";
import type { ExamQuestion, ExamSet } from "../../types/exams";
import { bilingual } from "./exam-model";
import { QuestionEditor } from "./QuestionEditor";
import { ExamImport } from "./ExamImport";
import "./exams.css";
export default function AdminExamsPage() {
  const { t } = useLocale(),
    { service, refresh } = useExams(),
    errorText = useExamError(),
    [params, setParams] = useSearchParams();
  const catalog = useExamQuery("catalog", (signal) => service.catalog(signal)),
    reports = useExamQuery("reports", (signal) =>
      service.admin.reports(signal),
    );
  const selected = catalog.data?.sets.find((s) => s.id === params.get("set")),
    questions = useExamQuery(
      "questions",
      (signal) => service.questions(selected!.id, signal),
      selected?.id || "",
      !!selected,
    );
  const [tab, setTab] = useState("sets"),
    [query, setQuery] = useState(""),
    [setDialog, setSetDialog] = useState<ExamSet | "new" | null>(null),
    [editor, setEditor] = useState<ExamQuestion | "new" | null>(null),
    [importing, setImporting] = useState(false),
    [deleting, setDeleting] = useState<ExamSet | null>(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [limit, setLimit] = useState(25);
  const sets = (catalog.data?.sets || []).filter(
    (s) =>
      s.version !== "preview-1" &&
      !s.ownerId &&
      `${s.title.en} ${s.title.ar}`.toLowerCase().includes(query.toLowerCase()),
  );
  async function remove() {
    if (!deleting) return;
    setPending(true);
    setError("");
    try {
      await service.admin.deleteSet(deleting.id, deleting.version);
      setDeleting(null);
      if (selected?.id === deleting.id) setParams({});
      await refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setPending(false);
    }
  }
  async function resolve(id: string) {
    setPending(true);
    setError("");
    try {
      await service.admin.resolveReport(id);
      await refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="container exam-platform exam-admin">
      <div className="exam-preview-note">
        <FileQuestion size={16} />
        <span>
          {t(
            service.source === "preview"
              ? {
                  en: "Exam content preview · Changes stay on this device",
                  ar: "معاينة محتوى الامتحانات · التغييرات تبقى على هذا الجهاز",
                }
              : { en: "Exam content workspace", ar: "مساحة محتوى الامتحانات" },
          )}
        </span>
      </div>
      <ExamHeading
        eyebrow={t({ en: "Question bank management", ar: "إدارة بنك الأسئلة" })}
        title={
          selected
            ? t(selected.title)
            : t({
                en: "Give good questions\na clear home.",
                ar: "امنح الأسئلة الجيدة\nمساحة واضحة.",
              })
        }
        body={t({
          en: "Manage question sets, review explanations and resolve reported issues.",
          ar: "أدر مجموعات الأسئلة وراجع الشرح والبلاغات.",
        })}
      >
        <button
          type="button"
          className="button button-primary"
          onClick={() => setSetDialog("new")}
        >
          <Plus size={18} />
          {t({ en: "New question set", ar: "مجموعة أسئلة جديدة" })}
        </button>
      </ExamHeading>
      <div className="exam-filter-tabs">
        {["sets", "reports"].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
          >
            {t(
              value === "sets"
                ? { en: "Question sets", ar: "مجموعات الأسئلة" }
                : { en: "Reported issues", ar: "البلاغات" },
            )}
            {value === "reports" &&
            reports.data?.some((r) => r.status === "open")
              ? ` (${reports.data.filter((r) => r.status === "open").length})`
              : ""}
          </button>
        ))}
      </div>
      {error && (
        <p className="exam-error" role="alert">
          {error}
        </p>
      )}
      {catalog.isPending ? (
        <LoadingState />
      ) : catalog.isError ? (
        <ExamFailure
          message={errorText(catalog.error)}
          retry={() => void catalog.refetch()}
        />
      ) : tab === "reports" ? (
        reports.isPending ? (
          <LoadingState />
        ) : reports.isError ? (
          <ExamFailure
            message={errorText(reports.error)}
            retry={() => void reports.refetch()}
          />
        ) : reports.data?.length ? (
          <div className="exam-report-list">
            {reports.data.slice(0, limit).map((report) => (
              <article key={report.id} className="exam-report-card">
                <div>
                  <span className="exam-kicker">
                    {report.category} · {report.status}
                  </span>
                  <p>{report.body}</p>
                  <small>{report.questionId}</small>
                </div>
                {report.status === "open" && (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => void resolve(report.id)}
                    disabled={pending}
                  >
                    {t({ en: "Mark resolved", ar: "تحديد كمحلول" })}
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <ExamEmpty
            title={t({
              en: "The review desk is clear",
              ar: "مكتب المراجعة خالٍ",
            })}
            body={t({
              en: "Reported questions will appear here for review.",
              ar: "تظهر الأسئلة المبلغ عنها هنا للمراجعة.",
            })}
          />
        )
      ) : selected ? (
        <>
          <button
            className="text-link"
            type="button"
            onClick={() => setParams({})}
          >
            <ArrowLeft className="directional" size={17} />
            {t({ en: "All sets", ar: "كل المجموعات" })}
          </button>
          <div className="exam-admin-set-tools">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setSetDialog(selected)}
            >
              <Pencil size={17} />
              {t({ en: "Edit details", ar: "تعديل التفاصيل" })}
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => setEditor("new")}
            >
              <Plus size={17} />
              {t({ en: "Add question", ar: "إضافة سؤال" })}
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setImporting(true)}
            >
              <Upload size={17} />
              {t({ en: "Bulk import", ar: "استيراد جماعي" })}
            </button>
            <AppLink
              href={`/learn/electronic-exams/set/${selected.id}/review`}
              className="text-link"
            >
              <Eye size={17} />
              {t({ en: "Preview questions", ar: "معاينة الأسئلة" })}
            </AppLink>
          </div>
          {questions.isPending ? (
            <LoadingState />
          ) : questions.isError ? (
            <ExamFailure
              message={errorText(questions.error)}
              retry={() => void questions.refetch()}
            />
          ) : questions.data?.length ? (
            <div className="exam-admin-question-list">
              {questions.data.slice(0, limit).map((q, i) => (
                <article key={q.id}>
                  <span>{i + 1}</span>
                  <div>
                    <strong>{t(q.stem)}</strong>
                    <small>
                      {t(q.chapter)} · {q.correct?.toUpperCase()}
                    </small>
                  </div>
                  <button
                    className="exam-icon-button"
                    type="button"
                    aria-label={t({
                      en: `Edit question ${i + 1}`,
                      ar: `تعديل السؤال ${i + 1}`,
                    })}
                    onClick={() => setEditor(q)}
                  >
                    <Pencil size={18} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <ExamEmpty
              title={t({
                en: "This set is ready for its first question",
                ar: "المجموعة جاهزة لسؤالها الأول",
              })}
              body={t({
                en: "Add one question, or validate and import a question file.",
                ar: "أضف سؤالاً أو تحقق من ملف أسئلة واستورده.",
              })}
            />
          )}
        </>
      ) : (
        <>
          <div className="exam-filters">
            <input
              aria-label={t({
                en: "Find a question set",
                ar: "البحث عن مجموعة أسئلة",
              })}
              placeholder={t({ en: "Search sets…", ar: "ابحث في المجموعات…" })}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(25);
              }}
            />
          </div>
          {sets.length ? (
            <div className="exam-admin-set-list">
              {sets.slice(0, limit).map((set) => (
                <article key={set.id}>
                  <button
                    className="exam-admin-set-open"
                    type="button"
                    onClick={() => {
                      setParams({ set: set.id });
                      setLimit(25);
                    }}
                  >
                    <span className="exam-kicker">
                      {set.published
                        ? t({ en: "Published", ar: "منشور" })
                        : t({ en: "Draft", ar: "مسودة" })}{" "}
                      · {set.questionIds.length}{" "}
                      {t({ en: "questions", ar: "أسئلة" })}
                    </span>
                    <h2>{t(set.title)}</h2>
                    <p>
                      {t(set.batch)} ·{" "}
                      {catalog.data?.courses.find(
                        (c) => c.id === set.courseId,
                      ) &&
                        t(
                          catalog.data.courses.find(
                            (c) => c.id === set.courseId,
                          )!.title,
                        )}
                    </p>
                  </button>
                  <button
                    className="exam-icon-button"
                    type="button"
                    aria-label={t({ en: "Delete set", ar: "حذف المجموعة" })}
                    onClick={() => {
                      setDeleting(set);
                      setError("");
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <ExamEmpty
              title={t({
                en: "A clean desk for your first set",
                ar: "مكتب جاهز لمجموعتك الأولى",
              })}
              body={t({
                en: "Create a draft set, then add and review its questions before publishing.",
                ar: "أنشئ مسودة وأضف أسئلتها وراجعها قبل النشر.",
              })}
            />
          )}
        </>
      )}
      {(tab === "reports"
        ? reports.data?.length || 0
        : selected
          ? questions.data?.length || 0
          : sets.length) > limit && (
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setLimit((n) => n + 25)}
        >
          {t({ en: "Show more", ar: "عرض المزيد" })}
        </button>
      )}
      {setDialog && catalog.data && (
        <SetEditor
          existing={setDialog === "new" ? undefined : setDialog}
          courses={catalog.data.courses}
          close={() => setSetDialog(null)}
          saved={(id) => setParams({ set: id })}
        />
      )}
      {editor && selected && (
        <QuestionEditor
          existing={editor === "new" ? undefined : editor}
          exam={selected}
          close={() => setEditor(null)}
        />
      )}
      {importing && selected && (
        <ExamImport exam={selected} close={() => setImporting(false)} />
      )}
      {deleting && (
        <Modal
          open
          onClose={() => !pending && setDeleting(null)}
          title={t({
            en: "Delete this question set?",
            ar: "حذف مجموعة الأسئلة؟",
          })}
          description={t(deleting.title)}
          className="exam-finish-dialog"
        >
          {error && (
            <p role="alert" className="exam-error">
              {error}
            </p>
          )}
          <div className="exam-dialog-actions">
            <button
              type="button"
              className="button button-secondary"
              disabled={pending}
              onClick={() => setDeleting(null)}
            >
              {t({ en: "Cancel", ar: "إلغاء" })}
            </button>
            <button
              type="button"
              className="button button-primary"
              disabled={pending}
              onClick={() => void remove()}
            >
              {t({ en: "Delete set", ar: "حذف المجموعة" })}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
function SetEditor({
  existing,
  courses,
  close,
  saved,
}: {
  existing?: ExamSet;
  courses: import("../../types/content").Course[];
  close: () => void;
  saved: (id: string) => void;
}) {
  const { t } = useLocale(),
    { service, refresh } = useExams(),
    errorText = useExamError();
  const [title, setTitle] = useState(existing?.title.en || ""),
    [arabic, setArabic] = useState(
      existing?.title.ar === existing?.title.en ? "" : existing?.title.ar || "",
    ),
    [course, setCourse] = useState(existing?.courseId || courses[0]?.id || ""),
    [batch, setBatch] = useState(existing?.batch.en || ""),
    [kind, setKind] = useState<ExamSet["kind"]>(existing?.kind || "practice"),
    [year, setYear] = useState(existing?.year || new Date().getFullYear()),
    [published, setPublished] = useState(existing?.published || false),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const set = await service.admin.saveSet(
        {
          id: existing?.id || "",
          courseId: course,
          title: { en: title.trim(), ar: arabic.trim() || title.trim() },
          description: existing?.description || bilingual(""),
          batch: bilingual(batch.trim() || "General"),
          kind,
          year,
          suggestedMinutes:
            existing?.suggestedMinutes ||
            Math.max(1, existing?.questionIds.length || 1),
          published,
          questionIds: existing?.questionIds || [],
          version: existing?.version || "new",
        },
        existing?.version,
      );
      await refresh();
      saved(set.id);
      close();
    } catch (e) {
      setError(errorText(e));
      setPending(false);
    }
  }
  return (
    <Modal
      open
      onClose={() => !pending && close()}
      title={t(
        existing
          ? { en: "Edit question set", ar: "تعديل المجموعة" }
          : { en: "New question set", ar: "مجموعة جديدة" },
      )}
      description={t({
        en: "Save as a draft while you prepare the questions.",
        ar: "احفظها مسودة أثناء تجهيز الأسئلة.",
      })}
      className="exam-set-dialog"
      initialFocus="#exam-set-title"
    >
      <form className="exam-form" onSubmit={submit}>
        <label>
          <span>{t({ en: "Set title", ar: "اسم المجموعة" })}</span>
          <input
            id="exam-set-title"
            required
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          <span>
            {t({
              en: "Arabic title (optional)",
              ar: "الاسم بالعربية (اختياري)",
            })}
          </span>
          <input
            value={arabic}
            maxLength={150}
            dir="auto"
            onChange={(e) => setArabic(e.target.value)}
          />
        </label>
        <label>
          <span>{t({ en: "Course", ar: "المساق" })}</span>
          <select
            value={course}
            required
            onChange={(e) => setCourse(e.target.value)}
            disabled={!!existing?.questionIds.length}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c.title)}
              </option>
            ))}
          </select>
        </label>
        <div className="exam-form-pair">
          <label>
            <span>{t({ en: "Batch", ar: "الدفعة" })}</span>
            <input
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              maxLength={100}
            />
          </label>
          <label>
            <span>{t({ en: "Calendar year", ar: "السنة" })}</span>
            <input
              type="number"
              min={2000}
              max={2100}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </label>
          <label>
            <span>{t({ en: "Type", ar: "النوع" })}</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as ExamSet["kind"])}
            >
              {(["practice", "midterm", "final"] as const).map((k) => (
                <option key={k} value={k}>
                  {t({
                    en: k,
                    ar: { practice: "تدريب", midterm: "نصفي", final: "نهائي" }[
                      k
                    ],
                  })}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="exam-check">
          <input
            type="checkbox"
            checked={published}
            disabled={!existing?.questionIds.length}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span>{t({ en: "Publish this set", ar: "نشر المجموعة" })}</span>
        </label>
        {error && (
          <p className="exam-error" role="alert">
            {error}
          </p>
        )}
        <footer>
          <button
            type="button"
            className="button button-secondary"
            disabled={pending}
            onClick={close}
          >
            {t({ en: "Cancel", ar: "إلغاء" })}
          </button>
          <button
            type="submit"
            className="button button-primary"
            disabled={pending}
          >
            {t(
              pending
                ? { en: "Saving…", ar: "جارٍ الحفظ…" }
                : { en: "Save set", ar: "حفظ المجموعة" },
            )}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
