import {useServices} from "../../app/providers/ServicesProvider";
import {PublicationList} from "../publications/Publications";
import { Award, Landmark } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { CommunityNavigation } from "../../components/navigation/CommunityNavigation";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import { Notice } from "../../components/feedback/Notice";
import { useRecognitions } from "../../hooks/useContent";

function PreviewRecognitionPage({
  kind,
}: {
  kind: "honor-plate" | "hall-of-honor";
}) {
  const { t, label } = useLocale();
  const query = useRecognitions();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const rows = query.data?.filter((item) => item.kind === kind) || [];
  const hall = kind === "hall-of-honor";
  const Icon = hall ? Landmark : Award;
  return (
    <div
      className="community-v5 community-index-page recognition-page container"
      data-kind={kind}
    >
      <CommunityNavigation />
      <header className="community-page-intro recognition-intro">
        <span className="recognition-emblem" aria-hidden="true">
          <Icon size={32} />
          <i />
          <b />
        </span>
        <div>
          <span className="eyebrow">
            {label(hall ? "hallEyebrow" : "honorPlateEyebrow")}
          </span>
          <h1 tabIndex={-1} data-page-heading>
            {label(hall ? "hallTitle" : "honorPlateTitle")}
          </h1>
          <p>{label(hall ? "hallBody" : "honorPlateBody")}</p>
        </div>
      </header>
      {rows.length ? (
        <div className="recognition-grid">
          {rows.map((person, index) => (
            <article key={person.id} className="recognition-card">
              <span className="recognition-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="recognition-monogram" aria-hidden="true">
                {t(person.name).slice(0, 1)}
              </div>
              <span className="eyebrow">
                {person.year} · {t(person.title)}
              </span>
              <h2>{t(person.name)}</h2>
              <p>
                <b>{label("contribution")}</b>
                {t(person.contribution)}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      <Notice>{label("communityPreviewNotice")}</Notice>
    </div>
  );
}

export default function RecognitionPage({kind}:{kind:"honor-plate"|"hall-of-honor"}){return useServices().publicationApi?<PublicationList section="honor-plate"/>:<PreviewRecognitionPage kind={kind}/>;}
