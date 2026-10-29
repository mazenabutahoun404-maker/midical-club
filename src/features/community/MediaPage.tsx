import {useServices} from "../../app/providers/ServicesProvider";
import {PublicationList} from "../publications/Publications";
import { Camera, CirclePlay, Megaphone } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { CommunityNavigation } from "../../components/navigation/CommunityNavigation";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { Notice } from "../../components/feedback/Notice";
import { useCommunityMedia } from "../../hooks/useContent";
import { formatDate } from "../../lib/dates";

const icons = { "photo-story": Camera, video: CirclePlay, campaign: Megaphone };
const labels = {
  "photo-story": "photoStory",
  video: "video",
  campaign: "campaign",
} as const;

function PreviewMediaPage() {
  const { t, label, locale } = useLocale();
  const query = useCommunityMedia();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  return (
    <div className="community-v5 community-index-page container">
      <CommunityNavigation />
      <header className="community-page-intro media-page-intro">
        <span className="eyebrow">{label("mediaEyebrow")}</span>
        <h1 tabIndex={-1} data-page-heading>
          {label("mediaTitle")}
        </h1>
        <p>{label("mediaBody")}</p>
      </header>
      <div className="media-story-grid" aria-label={label("mediaArchive")}>
        {query.data?.map((story, index) => {
          const Icon = icons[story.kind];
          return (
            <article
              key={story.id}
              className="media-story"
              data-tone={story.accent}
              data-wide={index === 0 || index === 3 || undefined}
            >
              <div className="media-placeholder" aria-hidden="true">
                <Icon size={28} />
                <span />
                <i />
              </div>
              <div className="media-story-copy">
                <span className="eyebrow">{label(labels[story.kind])}</span>
                <h2>{t(story.title)}</h2>
                <p>{t(story.caption)}</p>
                <time dateTime={story.capturedAt}>
                  {formatDate(story.capturedAt, locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
            </article>
          );
        })}
      </div>
      <Notice>{label("mediaPreviewNote")}</Notice>
    </div>
  );
}

export default function MediaPage(){return useServices().publicationApi?<PublicationList section="campaigns"/>:<PreviewMediaPage/>;}
