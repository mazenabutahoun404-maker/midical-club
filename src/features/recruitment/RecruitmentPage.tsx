import {RecruitmentDirectory as ConnectedPage} from "../membership/Recruitment";
import {MembershipScope} from "../membership/shared";
import {useServices} from "../../app/providers/ServicesProvider";
import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  Aperture,
  BriefcaseBusiness,
  CalendarRange,
  Code2,
  Microscope,
  Network,
  ShieldCheck,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { RecruitmentPositionCard } from "../../components/cards/RecruitmentPositionCard";
import { RecruitmentPipeline } from "../../components/data-display/RecruitmentPipeline";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { SearchInput } from "../../components/forms/SearchInput";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { RecruitmentNavigation } from "../../components/navigation/RecruitmentNavigation";
import { useRecruitmentPositions } from "../../hooks/useContent";
import { teamKey } from "../../lib/recruitment";
import type { RecruitmentTeam } from "../../types/recruitment";

type TeamView = "all" | RecruitmentTeam;
const teamIcons = {
  scientific: Microscope,
  technical: Code2,
  media: Aperture,
  activities: CalendarRange,
  operations: Network,
};

function PreviewRecruitmentPage() {
  const { label, t } = useLocale();
  const positions = useRecruitmentPositions();
  const [team, setTeam] = useState<TeamView>("all");
  const [query, setQuery] = useState("");
  const [includeClosed, setIncludeClosed] = useState(false);
  const rows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return (positions.data || []).filter((position) => {
      const haystack = [
        t(position.title),
        t(position.summary),
        t(position.description),
        ...position.skills.map(t),
      ]
        .join(" ")
        .toLocaleLowerCase();
      return (
        (team === "all" || position.team === team) &&
        (includeClosed || position.status !== "closed") &&
        (!needle || haystack.includes(needle))
      );
    });
  }, [includeClosed, positions.data, query, t, team]);
  if (positions.isPending) return <LoadingState />;
  if (positions.isError)
    return <ErrorState retry={() => void positions.refetch()} />;
  const teams: RecruitmentTeam[] = [
    "scientific",
    "technical",
    "media",
    "activities",
    "operations",
  ];
  const tabs = [
    {
      id: "all" as const,
      label: label("allTeams"),
      icon: BriefcaseBusiness,
      count: (positions.data || []).filter(
        (position) => includeClosed || position.status !== "closed",
      ).length,
    },
    ...teams.map((item) => ({
      id: item,
      label: label(teamKey(item)),
      icon: teamIcons[item],
      count: (positions.data || []).filter(
        (position) =>
          position.team === item &&
          (includeClosed || position.status !== "closed"),
      ).length,
    })),
  ];
  return (
    <div className="recruitment-v9 recruitment-page">
      <div className="container">
        <RecruitmentNavigation />
        <section className="recruitment-hero artwork-scene">
          <div className="recruitment-hero-copy">
            <span className="eyebrow">{label("recruitmentEyebrow")}</span>
            <h1 tabIndex={-1} data-page-heading>
              {label("recruitmentTitle")}
            </h1>
            <p>{label("recruitmentBody")}</p>
            <div className="recruitment-hero-facts">
              <span>
                <BriefcaseBusiness size={17} />
                <strong>
                  {
                    (positions.data || []).filter(
                      (position) => position.status !== "closed",
                    ).length
                  }
                </strong>
                {label("openPositions")}
              </span>
              <span>
                <ShieldCheck size={17} />
                {label("membershipNotPermission")}
              </span>
            </div>
          </div>
          <HeroArtwork section="team" />
        </section>

        <section className="recruitment-openings" id="open-positions">
          <div className="recruitment-section-heading">
            <div>
              <span className="eyebrow">{label("recruitmentPulse")}</span>
              <h2>{label("openPositions")}</h2>
            </div>
            <label className="include-closed-control">
              <input
                type="checkbox"
                checked={includeClosed}
                onChange={(event) => setIncludeClosed(event.target.checked)}
              />
              <span>{label("includeClosed")}</span>
            </label>
          </div>
          <div className="recruitment-filter-panel">
            <SearchInput
              value={query}
              onChange={setQuery}
              label={label("findPosition")}
            />
            <AliveTabs
              label={label("recruitmentFilters")}
              items={tabs}
              value={team}
              onChange={setTeam}
            />
          </div>
          {rows.length ? (
            <div className="recruitment-position-grid">
              {rows.map((position) => (
                <RecruitmentPositionCard
                  key={position.id}
                  position={position}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={label("noRecruitmentPositions")}
              description={label("noRecruitmentPositionsBody")}
            />
          )}
        </section>

        <section className="recruitment-path-section">
          <div>
            <span className="eyebrow">{label("recruitmentPathTitle")}</span>
            <h2>{label("recruitmentPathTitle")}</h2>
            <p>{label("recruitmentPathBody")}</p>
          </div>
          <RecruitmentPipeline />
        </section>
        <aside className="recruitment-boundary">
          <ShieldCheck size={20} />
          <div>
            <strong>{label("membershipNotPermission")}</strong>
            <p>{label("membershipNotPermissionBody")}</p>
          </div>
        </aside>
        <p className="v9-preview-note">{label("recruitmentPreviewNotice")}</p>
      </div>
    </div>
  );
}

export default function RecruitmentPage(){const services=useServices();return services.membershipApi?<MembershipScope><ConnectedPage /></MembershipScope>:<PreviewRecruitmentPage/>}
