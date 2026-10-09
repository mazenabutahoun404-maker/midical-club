import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import { CommunityOverview } from "./CommunityOverview";
import {
  Activity,
  ArrowUpRight,
  Award,
  Camera,
  Newspaper,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { CommunityActivityCard } from "../../components/cards/CommunityActivityCard";
import { ArticleCard } from "../../components/cards/ArticleCard";
import { CommunityNavigation } from "../../components/navigation/CommunityNavigation";
import { AppLink } from "../../components/navigation/AppLink";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { Notice } from "../../components/feedback/Notice";
import { routes } from "../../constants/routes";
import { useCommunityActivities, useJournal } from "../../hooks/useContent";

const portals = [
  { href: routes.activities, label: "activities", icon: Activity, tone: "red" },
  { href: routes.journal, label: "journal", icon: Newspaper, tone: "ink" },
  { href: routes.media, label: "media", icon: Camera, tone: "russet" },
  {
    href: routes.executiveBodies,
    label: "executiveBodies",
    icon: ShieldCheck,
    tone: "olive",
  },
  { href: routes.honorPlate, label: "recognition", icon: Award, tone: "red" },
] as const;

export default function CommunityPage() {
  const { label, locale } = useLocale();
  const activities = useCommunityActivities();
  const journal = useJournal();
  const queries = [activities, journal];
  if (queries.some((query) => query.isPending)) return <LoadingState />;
  if (queries.some((query) => query.isError))
    return (
      <ErrorState
        retry={() => queries.forEach((query) => void query.refetch())}
      />
    );
  const featuredActivity = activities.data?.find((item) => item.featured);
  const featuredArticle = journal.data?.find((item) => item.featured);
  return (
    <div className="community-v5 container">
      <CommunityNavigation />
      <section className="community-hero artwork-scene">
        <div className="community-hero-copy">
          <span className="eyebrow">{label("communityEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {locale === "en" ? (
              <>
                <span className="community-title-line">Medicine</span>{" "}
                <span className="community-title-line">
                  is learned together.
                </span>
              </>
            ) : (
              label("communityTitle")
            )}
          </h1>
          <p>{label("communityBody")}</p>
          <AppLink className="button button-primary" href={routes.activities}>
            {label("exploreCommunity")}
            <ArrowUpRight className="directional" size={18} />
          </AppLink>
        </div>
        <HeroArtwork section="community" />
        <div className="community-hero-side">
          <CommunityOverview />
        </div>
      </section>
      <section
        className="community-portals"
        aria-label={label("communityNavigation")}
      >
        {portals.map(({ href, label: key, icon: Icon, tone }) => (
          <AppLink href={href} key={href} data-tone={tone}>
            <span className="portal-medical-icon" aria-hidden="true">
              <Icon size={22} />
            </span>
            <strong>{label(key)}</strong>
            <ArrowUpRight className="directional" size={18} />
          </AppLink>
        ))}
      </section>
      {(featuredActivity || featuredArticle) && (
        <section className="community-feature-grid">
          {featuredActivity && (
            <div>
              <span className="eyebrow">{label("activities")}</span>
              <CommunityActivityCard activity={featuredActivity} />
            </div>
          )}
          {featuredArticle && (
            <div>
              <span className="eyebrow">{label("featuredStory")}</span>
              <ArticleCard article={featuredArticle} />
            </div>
          )}
        </section>
      )}
      <section className="community-callout">
        <div>
          <UsersRound size={26} />
          <span className="eyebrow">{label("aboutMedClub")}</span>
          <h2>{label("aboutTitle")}</h2>
          <p>{label("aboutBody")}</p>
        </div>
        <AppLink className="button button-outline" href={routes.about}>
          {label("aboutMedClub")}
          <ArrowUpRight className="directional" size={17} />
        </AppLink>
      </section>
      <Notice>{label("communityPreviewNotice")}</Notice>
    </div>
  );
}
