import {
  ArrowRight,
  BookOpen,
  Compass,
  NotebookPen,
  PenLine,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { SiteContent } from "../../../types/content";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { ActionLink } from "../../../components/ui/ActionLink";
import { AppLink } from "../../../components/navigation/AppLink";
import logo from "../../../assets/brand/medclub-logo.png";
import { campusDestinations } from "../living-campus";
const symbols: Record<string, LucideIcon> = {
  learning: BookOpen,
  media: Video,
  community: Users,
  mentorship: Compass,
  contribution: PenLine,
  journals: NotebookPen,
};
const points = [
  [50, 12],
  [86, 30],
  [86, 70],
  [50, 88],
  [14, 70],
  [14, 30],
];
export function Community({ site }: { site: SiteContent }) {
  const { t } = useLocale();
  return (
    <div className="home-community-layout">
      <div className="home-community-copy" data-home-reveal="left">
        <span className="eyebrow">{t(site.headings.community.eyebrow)}</span>
        <h2 className="preserve-lines">{t(site.headings.community.title)}</h2>
        <p>{t(site.community.body)}</p>
        <ActionLink href={site.community.action.href}>
          {t(site.community.action.label)}
          <ArrowRight className="directional" size={18} />
        </ActionLink>
      </div>
      <nav
        className="home-community-map"
        data-home-reveal="orbit"
        aria-label={t({
          en: "Explore the community campus",
          ar: "استكشف مجتمع الحرم",
        })}
      >
        <svg viewBox="0 0 560 480" aria-hidden="true">
          <ellipse cx="280" cy="240" rx="200" ry="174" />
          {points.map(([x, y], index) => (
            <path
              key={index}
              d={`M280 240 Q${index % 2 ? 280 : x * 5.6} ${y * 4.8} ${x * 5.6} ${y * 4.8}`}
              pathLength={1}
            />
          ))}
        </svg>
        <span className="home-community-center" aria-hidden="true">
          <img src={logo} alt="" width={64} height={64} />
          <strong>MedClub</strong>
        </span>
        {campusDestinations.map((destination, index) => {
          const Icon = symbols[destination.id];
          return (
            <AppLink
              key={destination.id}
              href={destination.href}
              className="home-community-node"
              style={{
                left: `${points[index][0]}%`,
                top: `${points[index][1]}%`,
              }}
            >
              <Icon size={20} />
              <span>{t(destination.label)}</span>
            </AppLink>
          );
        })}
      </nav>
    </div>
  );
}
