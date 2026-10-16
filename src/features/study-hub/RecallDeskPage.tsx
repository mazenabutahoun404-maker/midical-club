import {
  ActionReceipt,
  useActionReceipt,
} from "../../components/feedback/ActionReceipt";
import { useState, useEffect, useRef } from "react";
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
import { RecallFlipCard } from "./RecallFlipCard";
import { Modal } from "../../components/ui/Modal";
import "./recall-editor.css";
import { SessionTools } from "../exams/SessionTools";
import "../exams/exam-studio.css";
import "../exams/exam-design-v1349.css";
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
  const [view, setView] = useState<"review" | "collection">("review");
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const current = practiceId
    ? cards.data?.find((c) => c.id === practiceId)
    : due[0];
  const previousCard = useRef<string | undefined>(undefined);
  useEffect(() => {
    const changed =
      previousCard.current && previousCard.current !== current?.id;
    previousCard.current = current?.id;
    if (!changed) return;
    const frame = requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>(".recall-flip-card, .recall-queue-empty h2")
        ?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [current?.id]);
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
    <main className="container study-hub studio-personal-recall">
      <header className="study-hub-heading studio-topbar">
        <AppLink href="/my/study" className="text-link studio-recall-exit">
          ← {t({ en: "Study desk", ar: "مكتب الدراسة" })}
        </AppLink>
        <div className="studio-recall-brand">
          <span className="studio-brand-name">MedClub</span>
          <h1 data-page-heading tabIndex={-1}>
            {t({ en: "Recall", ar: "الاسترجاع" })}
          </h1>
        </div>
        <SessionTools />
        <span className="study-hub-action-receipt">
          <ActionReceipt receipt={feedback.receipt} />
        </span>
      </header>
      <div className="studio-recall-desk">
        <nav
          className="recall-view-tabs"
          aria-label={t({ en: "Recall views", ar: "عروض الاسترجاع" })}
        >
          <button
            type="button"
            aria-pressed={view === "review"}
            onClick={() => setView("review")}
          >
            {t({ en: "Review", ar: "المراجعة" })}
            <small>{due.length}</small>
          </button>
          <button
            type="button"
            aria-pressed={view === "collection"}
            onClick={() => setView("collection")}
          >
            {t({ en: "My cards", ar: "بطاقاتي" })}
            <small>{cards.data?.length || 0}</small>
          </button>
        </nav>
        <div className="study-hub-actions">
          <label>
            {t({ en: "Course", ar: "المساق" })}
            <select
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                setPracticeId(null);
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
            <section className="recall-review-stage" hidden={view !== "review"}>
              {current ? (
                <>
                  <RecallFlipCard
                    cardId={current.id}
                    nextCards={due
                      .filter((c) => c.id !== current.id)
                      .slice(0, 3)
                      .map((c) => ({
                        id: c.id,
                        prompt: c.prompt,
                        course: courses.data?.find(
                          (item) => item.id === c.courseId,
                        )
                          ? t(
                              courses.data.find(
                                (item) => item.id === c.courseId,
                              )!.title,
                            )
                          : undefined,
                      }))}
                    prompt={current.prompt}
                    answer={current.answer}
                    course={
                      courses.data?.find((c) => c.id === current.courseId)
                        ? t(
                            courses.data.find((c) => c.id === current.courseId)!
                              .title,
                          )
                        : undefined
                    }
                    flipped={revealed === current.id}
                    disabled={busy}
                    onFlip={() =>
                      setRevealed(revealed === current.id ? null : current.id)
                    }
                  />
                  {current.source &&
                    courses.data?.find((c) => c.id === current.courseId) && (
                      <AppLink
                        className="study-source-note text-link"
                        href={
                          "/my/learning/" +
                          courses.data.find((c) => c.id === current.courseId)!
                            .slug +
                          "?" +
                          new URLSearchParams({
                            pdf: current.source.resourceId,
                            page: String(current.source.page),
                            revision: current.source.resourceRevision,
                          }).toString()
                        }
                      >
                        {t({ en: "Open source page", ar: "فتح صفحة المصدر" })}{" "}
                        {current.source.page}
                      </AppLink>
                    )}
                  {revealed === current.id ? (
                    <>
                      <p className="recall-help">
                        {t({
                          en: "How did that recall feel? Your rating schedules the next review.",
                          ar: "كيف كان استرجاعك؟ تقييمك يحدد المراجعة التالية.",
                        })}
                      </p>
                      <div className="recall-grades">
                        {(
                          ["again", "hard", "good", "easy"] as RecallGrade[]
                        ).map((grade, i) => (
                          <button
                            type="button"
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
                                setPracticeId(null);
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
                            <small>
                              {t(
                                [
                                  {
                                    en: "Not yet recalled",
                                    ar: "لم أتذكرها بعد",
                                  },
                                  { en: "Needed effort", ar: "احتجت جهداً" },
                                  { en: "Recalled it", ar: "تذكرتها" },
                                  { en: "Came easily", ar: "تذكرتها بسهولة" },
                                ][i],
                              )}
                            </small>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </>
              ) : (
                <div className="recall-queue-empty">
                  <Brain size={28} />
                  <h2>{t({ en: "A clear desk.", ar: "مكتبك هادئ." })}</h2>
                  <p>
                    {t({
                      en: "No cards due. Add a question or open any card from your collection.",
                      ar: "لا توجد بطاقات مستحقة. أضف سؤالاً أو افتح بطاقة من مجموعتك.",
                    })}
                  </p>
                </div>
              )}
            </section>
            <section hidden={view !== "collection"}>
              <h2>{t({ en: "Your card collection", ar: "مجموعة بطاقاتك" })}</h2>
              <div className="study-record-list">
                {cards.data?.map((c) => (
                  <article data-recall-id={c.id} key={c.id}>
                    <div>
                      <button
                        type="button"
                        className="recall-collection-question"
                        onClick={() => {
                          setPracticeId(c.id);
                          setView("review");
                          setRevealed(null);
                          requestAnimationFrame(() =>
                            document
                              .querySelector<HTMLElement>(".recall-flip-card")
                              ?.focus({ preventScroll: false }),
                          );
                        }}
                      >
                        {c.prompt}
                      </button>
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
      </div>
      {editing !== undefined && (
        <Modal
          open
          onClose={() => !busy && setEditing(undefined)}
          title={t({ en: "Recall card", ar: "بطاقة استرجاع" })}
          description={t({
            en: "Write one question and its answer for future mental review.",
            ar: "اكتب سؤالاً وإجابته لمراجعته في ذهنك لاحقاً.",
          })}
          className="recall-editor-dialog"
          initialFocus="textarea"
        >
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
                  dir="auto"
                  required
                  minLength={3}
                  maxLength={600}
                  value={draft.prompt}
                  onChange={(e) =>
                    setDraft({ ...draft, prompt: e.target.value })
                  }
                />
              </label>
              <label>
                {t({ en: "Answer", ar: "الإجابة" })}
                <textarea
                  dir="auto"
                  required
                  maxLength={3000}
                  value={draft.answer}
                  onChange={(e) =>
                    setDraft({ ...draft, answer: e.target.value })
                  }
                />
              </label>
              <div>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={busy}
                >
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
        </Modal>
      )}
    </main>
  );
}
