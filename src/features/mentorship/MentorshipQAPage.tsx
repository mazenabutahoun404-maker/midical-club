import {PublicQA as ConnectedPage} from "../membership/Mentorship";
import {MembershipScope} from "../membership/shared";
import {useServices} from "../../app/providers/ServicesProvider";
import { useState } from "react";
import {
  BriefcaseMedical,
  HeartHandshake,
  Microscope,
  Stethoscope,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { MentorshipNavigation } from "../../components/navigation/MentorshipNavigation";
import { useMentorshipQuestions } from "../../hooks/useContent";
import { formatDate } from "../../lib/dates";

type View =
  "all" | "career" | "research" | "clinical-learning" | "student-life";
function PreviewMentorshipQAPage() {
  const { t, label, locale } = useLocale();
  const query = useMentorshipQuestions();
  const [view, setView] = useState<View>("all");
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const questions = query.data || [];
  const filtered = questions.filter(
    (item) => view === "all" || item.category === view,
  );
  const tabs = [
    {
      id: "all",
      label: label("allQuestions"),
      icon: HeartHandshake,
      count: questions.length,
    },
    {
      id: "career",
      label: label("career"),
      icon: BriefcaseMedical,
      count: questions.filter((item) => item.category === "career").length,
    },
    {
      id: "research",
      label: label("research"),
      icon: Microscope,
      count: questions.filter((item) => item.category === "research").length,
    },
    {
      id: "clinical-learning",
      label: label("clinicalLearning"),
      icon: Stethoscope,
      count: questions.filter((item) => item.category === "clinical-learning")
        .length,
    },
  ] as const;
  return (
    <div className="mentorship-v6 mentorship-qa-page container">
      <MentorshipNavigation />
      <header className="v6-page-intro">
        <div>
          <span className="eyebrow">{label("questionsEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("questionsTitle")}
          </h1>
          <p>{label("questionsBody")}</p>
        </div>
      </header>
      <AliveTabs
        label={label("questionFilters")}
        items={[...tabs]}
        value={view}
        onChange={setView}
      />
      {filtered.length ? (
        <div className="mentor-question-list">
          {filtered.map((item, index) => (
            <article key={item.id}>
              <span className="question-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2>{t(item.question)}</h2>
                <p>{t(item.answer)}</p>
                <footer>
                  <strong>
                    {label("answeredBy")}: {t(item.answeredBy)}
                  </strong>
                  <span>{formatDate(item.answeredAt, locale)}</span>
                </footer>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={label("noQuestions")} />
      )}
      <p className="v6-boundary-note">{label("mentorshipBoundaries")}</p>
    </div>
  );
}

export default function MentorshipQAPage(){const services=useServices();return services.membershipApi?<MembershipScope><ConnectedPage /></MembershipScope>:<PreviewMentorshipQAPage/>}
