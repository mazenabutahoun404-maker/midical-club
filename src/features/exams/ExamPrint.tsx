import { useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { AppLink } from "../../components/navigation/AppLink";
import { useLocale } from "../../app/providers/LocaleProvider";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useExams, useExamQuery, useExamError } from "./useExams";
import { ExamFailure, ExamEmpty } from "./ExamFrame";
import { QuestionView } from "./QuestionView";
export default function ExamPrint() {
  const { examId = "" } = useParams(),
    { t } = useLocale(),
    { service, base } = useExams(),
    errorText = useExamError();
  const exam = useExamQuery(
      "set",
      (signal) => service.getExam(examId, signal),
      examId,
    ),
    questions = useExamQuery(
      "questions",
      (signal) => service.questions(examId, signal),
      examId,
    );
  const [answers, setAnswers] = useState(false);
  if (exam.isPending || questions.isPending) return <LoadingState />;
  if (exam.isError || questions.isError)
    return <ExamFailure message={errorText(exam.error || questions.error)} />;
  if (!exam.data)
    return (
      <ExamEmpty
        title={t({ en: "Set unavailable", ar: "المجموعة غير متاحة" })}
        body=""
        href={base}
        action={t({ en: "Browse", ar: "تصفح" })}
      />
    );
  return (
    <div className="exam-print-page">
      <div className="exam-print-controls">
        <AppLink href={`${base}/set/${examId}`} className="text-link">
          <ArrowLeft className="directional" size={17} />
          {t({ en: "Back to session", ar: "العودة للجلسة" })}
        </AppLink>
        <label className="exam-check">
          <input
            type="checkbox"
            checked={answers}
            onChange={(e) => setAnswers(e.target.checked)}
          />
          <span>
            {t({
              en: "Include answers and explanations",
              ar: "تضمين الإجابات والشرح",
            })}
          </span>
        </label>
        <button
          type="button"
          className="button button-primary"
          onClick={() => window.print()}
        >
          <Printer size={18} />
          {t({ en: "Print / save as PDF", ar: "طباعة / حفظ PDF" })}
        </button>
      </div>
      <header>
        <span className="exam-kicker">MedClub · {t(exam.data.batch)}</span>
        <h1 data-page-heading tabIndex={-1}>
          {t(exam.data.title)}
        </h1>
        <p>
          {questions.data?.length} {t({ en: "questions", ar: "سؤال" })}
        </p>
      </header>
      {questions.data?.map((q, i) => (
        <article className="exam-review-card" key={q.id}>
          <QuestionView
            question={answers ? q : { ...q, explanation: undefined }}
            reveal={answers}
            locked
            number={i + 1}
          />
        </article>
      ))}
    </div>
  );
}
