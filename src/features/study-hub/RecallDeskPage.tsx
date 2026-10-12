import {
  ActionReceipt,
  useActionReceipt,
} from "../../components/feedback/ActionReceipt";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCourses } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import {
  flyDeletedRecord,
  useStudyHub,
  useHubQuery,
  useStudyError,
} from "./useStudyHub";
import type {
  RecallCard,
  RecallGrade,
  RecallInput,
} from "../../types/study-hub";
import { toast } from "sonner";
import { offerUndo } from "../../components/feedback/undo-action";
import { AppLink } from "../../components/navigation/AppLink";
import { Plus, Trash2, Pencil, Brain } from "lucide-react";
import "./study-hub.css";
export default function RecallDeskPage() {
  const feedback = useActionReceipt();
  const { t } = useLocale(),
    { owner, service, refresh } = useStudyHub(),
    errorText = useStudyError();
  const courses = useCourses();
  const [params] = useSearchParams();
  const [course, setCourse] = useState(params.get("course") || "");
  const cards = useHubQuery(
      "recall",
      (signal) => service.listRecall(course || undefined, { signal }),
      course,
    ),
    history = useHubQuery("reviews", (signal) =>
      service.listReviews({ signal }),
    );
  const [revealed, setRevealed] = useState<string | null>(null),
    [editing, setEditing] = useState<RecallCard | null | undefined>(undefined),
    [busy, setBusy] = useState(false),
    [draft, setDraft] = useState<RecallInput>({
      courseId: course,
      prompt: "",
      answer: "",
    });
  const due = (cards.data || [])
    .filter((c) => Date.parse(c.dueAt) <= Date.now())
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const current = due[0];
  async function action(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      await refresh();
      feedback.flash("saved");
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  function edit(c: RecallCard | null) {
    setEditing(c);
    setDraft(
      c
        ? {
            courseId: c.courseId,
            prompt: c.prompt,
            answer: c.answer,
            source: c.source,
          }
        : {
            courseId: course || courses.data?.[0]?.id || "",
            prompt: "",
            answer: "",
          },
    );
  }
  return (
    <main className="container study-hub">
      <header className="study-hub-heading">
        <span className="study-hub-action-receipt">
          <ActionReceipt receipt={feedback.receipt} />
        </span>
        <AppLink href="/my/study" className="text-link">
          ← {t({ en: "Study desk", ar: "مكتب الدراسة" })}
        </AppLink>
        <h1 data-page-heading tabIndex={-1}>
          {t({ en: "Active recall", ar: "المراجعة النشطة" })}
        </h1>
        <p>
          {t({
            en: "Your own questions, a calm review queue. Ratings describe this recall attempt, not your ability.",
            ar: "أسئلتك الخاصة ومراجعات هادئة. التقييم يصف محاولة الاسترجاع ولا يقيس قدراتك.",
          })}
        </p>
      </header>
      <div className="study-hub-actions">
        <label>
          {t({ en: "Course", ar: "المساق" })}
          <select
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              setRevealed(null);
            }}
          >
            <option value="">
              {t({ en: "All courses", ar: "كل المساقات" })}
            </option>
            {courses.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c.title)}
              </option>
            ))}
          </select>
        </label>
        <button className="button button-primary" onClick={() => edit(null)}>
          <Plus size={18} />
          {t({ en: "New recall card", ar: "بطاقة جديدة" })}
        </button>
      </div>
      {cards.isPending ? (
        <p role="status">
          {t({ en: "Loading your cards…", ar: "جار تحميل بطاقاتك…" })}
        </p>
      ) : cards.isError ? (
        <button onClick={() => void cards.refetch()}>
          {t({ en: "Retry", ar: "حاول مجدداً" })}
        </button>
      ) : (
        <>
          <div className="study-metrics">
            <span>
              <b>{due.length}</b>
              {t({ en: "Due now", ar: "للمراجعة الآن" })}
            </span>
            <span>
              <b>{cards.data?.length || 0}</b>
              {t({ en: "Your cards", ar: "بطاقاتك" })}
            </span>
            <span>
              <b>{history.data?.length || 0}</b>
              {t({ en: "Recorded reviews", ar: "المراجعات المسجلة" })}
            </span>
          </div>
          <section
            className="recall-stage"
            key={current?.id || "clear"}
            aria-live="polite"
          >
            <Brain size={28} aria-hidden="true" />
            {current ? (
              <>
                <small>
                  {courses.data?.find((c) => c.id === current.courseId) &&
                    t(
                      courses.data.find((c) => c.id === current.courseId)!
                        .title,
                    )}
                </small>
                <h2>{current.prompt}</h2>
                {revealed === current.id ? (
                  <>
                    <p className="recall-answer">{current.answer}</p>
                    {current.source && (
                      <p className="study-source-note">
                        {t({ en: "Source page", ar: "صفحة المصدر" })}{" "}
                        {current.source.page}
                      </p>
                    )}
                    <div className="recall-grades">
                      {(["again", "hard", "good", "easy"] as RecallGrade[]).map(
                        (grade, i) => (
                          <button
                            disabled={busy}
                            key={grade}
                            onClick={() =>
                              void action(async () => {
                                await service.reviewRecall(
                                  current.id,
                                  current.version,
                                  grade,
                                  crypto.randomUUID(),
                                );
                                setRevealed(null);
                                toast.success(
                                  t({
                                    en: "Next review scheduled",
                                    ar: "تم تحديد المراجعة التالية",
                                  }),
                                );
                              })
                            }
                          >
                            {t(
                              [
                                { en: "Again", ar: "مرة أخرى" },
                                { en: "Hard", ar: "صعب" },
                                { en: "Good", ar: "جيد" },
                                { en: "Easy", ar: "سهل" },
                              ][i],
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    className="button button-primary"
                    onClick={() => setRevealed(current.id)}
                  >
                    {t({ en: "Reveal answer", ar: "اكشف الإجابة" })}
                  </button>
                )}
              </>
            ) : (
              <>
                <h2>{t({ en: "A clear desk.", ar: "مكتبك هادئ." })}</h2>
                <p>
                  {t({
                    en: "No cards due. Create one from a PDF margin note or add your own question.",
                    ar: "لا توجد بطاقات مستحقة. أنشئ بطاقة من الهامش أو أضف سؤالك.",
                  })}
                </p>
              </>
            )}
          </section>
          <section>
            <h2>{t({ en: "Your card collection", ar: "مجموعة بطاقاتك" })}</h2>
            <div className="study-record-list">
              {cards.data?.map((c) => (
                <article data-recall-id={c.id} key={c.id}>
                  <div>
                    <strong>{c.prompt}</strong>
                    <small>
                      {t({ en: "Next review", ar: "المراجعة التالية" })} ·{" "}
                      {new Date(c.dueAt).toLocaleDateString()}
                    </small>
                  </div>
                  <button
                    aria-label={t({ en: "Edit card", ar: "تعديل البطاقة" })}
                    onClick={() => edit(c)}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    disabled={busy}
                    aria-label={t({ en: "Delete card", ar: "حذف البطاقة" })}
                    onClick={() =>
                      void action(async () => {
                        await service.deleteRecall(c.id, c.version);
                        flyDeletedRecord("data-recall-id", c.id, c.prompt);
                        offerUndo({
                          message: t({
                            en: "Card removed",
                            ar: "حُذفت البطاقة",
                          }),
                          label: t({ en: "Undo", ar: "تراجع" }),
                          restored: t({
                            en: "Card restored",
                            ar: "استعيدت البطاقة",
                          }),
                          failed: t({
                            en: "Could not restore card",
                            ar: "تعذرت الاستعادة",
                          }),
                          undo: async () => {
                            await service.restoreRecall(c);
                            await refresh();
                          },
                          canRestore: () => !!owner,
                        });
                      })
                    }
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
      {editing !== undefined && (
        <section
          className="study-editor"
          aria-label={t({
            en: "Recall card editor",
            ar: "محرر بطاقة الاسترجاع",
          })}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action(async () => {
                const before = editing;
                const saved = await service.saveRecall(
                  draft,
                  editing
                    ? { id: editing.id, version: editing.version }
                    : undefined,
                );
                if (before)
                  offerUndo({
                    message: t({ en: "Card updated", ar: "حُدثت البطاقة" }),
                    label: t({ en: "Undo", ar: "تراجع" }),
                    restored: t({
                      en: "Previous card restored",
                      ar: "استعيدت البطاقة",
                    }),
                    failed: t({
                      en: "This card changed; reload it.",
                      ar: "تغيرت البطاقة؛ أعد تحميلها.",
                    }),
                    undo: async () => {
                      await service.saveRecall(before, {
                        id: saved.id,
                        version: saved.version,
                      });
                      await refresh();
                    },
                  });
                setEditing(undefined);
                toast.success(t({ en: "Card saved", ar: "حُفظت البطاقة" }));
              });
            }}
          >
            <h2>
              {t({
                en: "One question. One clear answer.",
                ar: "سؤال واحد وإجابة واضحة.",
              })}
            </h2>
            <label>
              {t({ en: "Course", ar: "المساق" })}
              <select
                required
                value={draft.courseId}
                onChange={(e) =>
                  setDraft({ ...draft, courseId: e.target.value })
                }
              >
                <option value="" disabled>
                  —
                </option>
                {courses.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.title)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t({ en: "Question", ar: "السؤال" })}
              <textarea
                required
                minLength={3}
                maxLength={600}
                value={draft.prompt}
                onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
              />
            </label>
            <label>
              {t({ en: "Answer", ar: "الإجابة" })}
              <textarea
                required
                maxLength={3000}
                value={draft.answer}
                onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
              />
            </label>
            <div>
              <button className="button button-primary" disabled={busy}>
                {t({ en: "Save card", ar: "حفظ البطاقة" })}
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setEditing(undefined)}
              >
                {t({ en: "Cancel", ar: "إلغاء" })}
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}
