import { useId, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { AppLink } from "../../components/navigation/AppLink";
import day from "../../assets/home/living-campus-1672.webp";
import night from "../../assets/home/living-campus-night-1672.webp";
import quietDay from "../../assets/home/personal-campus-quiet-day.webp";
import quietNight from "../../assets/home/personal-campus-quiet-night.webp";
import { campusDestinations } from "../homepage/living-campus";
import { CampusLights } from "../homepage/CampusLights";
import { useCampusLife } from "../homepage/useCampusLife";
import { phoneRestorationRegions } from "../auth/auth-restoration-regions";
import type { CampusLevels } from "./useCampusGrowth";
import "../homepage/living-campus.css";

const places = {
  learning: {
    label: { en: "My courses", ar: "مساقاتي" },
    href: "/my/learning",
    center: [740, 265],
    body: {
      en: "Completed resource reviews bring your learning hall to life.",
      ar: "المراجعات المكتملة تمنح قاعة التعلم حياةً.",
    },
  },
  media: {
    label: { en: "Recall", ar: "المراجعة" },
    href: "/my/study/recall",
    center: [1065, 170],
    body: {
      en: "Review different recall cards to develop your revision space.",
      ar: "راجع بطاقات مختلفة لتطوير مساحة المراجعة.",
    },
  },
  community: {
    label: { en: "Community", ar: "مجتمعك" },
    href: "/my/study/rooms",
    center: [1330, 235],
    body: {
      en: "Study milestones, finished study rooms or verified activities develop this space.",
      ar: "إنجازات الدراسة والغرف المكتملة والأنشطة المعتمدة تطور هذه المساحة.",
    },
  },
  mentorship: {
    label: { en: "Mentorship", ar: "إرشادك" },
    href: "/my/mentorship",
    center: [1490, 465],
    body: {
      en: "Accepted mentorship requests or study milestones develop your pavilion.",
      ar: "طلبات الإرشاد المقبولة أو إنجازات الدراسة تطور جناحك.",
    },
  },
  contribution: {
    label: { en: "Contribution", ar: "مساهماتك" },
    href: "/my/contributions",
    center: [1300, 680],
    body: {
      en: "Approved contributions or study milestones add life to your exhibition.",
      ar: "المساهمات المعتمدة أو إنجازات الدراسة تضيف حياةً إلى معرضك.",
    },
  },
  journals: {
    label: { en: "My library", ar: "مكتبتي" },
    href: "/my/library",
    center: [770, 665],
    body: {
      en: "Saved resources and organized collections fill your library.",
      ar: "المصادر المحفوظة والمجموعات المنظمة تملأ مكتبتك.",
    },
  },
};
const stages = [
  { en: "Ready for you", ar: "جاهز لك" },
  { en: "In use", ar: "ينبض بالحياة" },
  { en: "Growing", ar: "يتطور" },
  { en: "Established", ar: "مزدهر" },
];

export default function PersonalCampus({
  levels,
  quiet,
  hero = false,
}: {
  levels: CampusLevels;
  quiet: boolean;
  hero?: boolean;
}) {
  const { t, dir } = useLocale(),
    { resolvedTheme } = useAppearance();
  const dark = resolvedTheme === "dark",
    source = dark ? quietNight : quietDay,
    active = dark ? night : day;
  const [loaded, setLoaded] = useState<string | null>(null),
    [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<keyof typeof places>("learning");
  const stage = useRef<HTMLDivElement>(null),
    id = useId().replace(/:/g, "");
  const life = useCampusLife(
    stage,
    "ambient",
    loaded === source &&
      !quiet &&
      !failed &&
      Object.values(levels).some((n) => n > 0),
  );
  const activePlace = places[selected];
  return (
    <div
      className="personal-campus"
      data-direction={dir}
      data-presentation={hero ? "hero" : "section"}
      data-failed={failed || undefined}
      data-campus-lighting={dark ? "night" : "day"}
      ref={stage}
    >
      <div className="personal-campus-window" data-failed={failed || undefined}>
        <div className="personal-campus-art">
          <img
            src={source}
            width={1672}
            height={941}
            alt=""
            decoding="async"
            fetchPriority={quiet ? "low" : "high"}
            loading={quiet ? "lazy" : "eager"}
            onLoad={() => {
              setLoaded(source);
              setFailed(false);
            }}
            onError={() => setFailed(true)}
          />
          {!failed && (
            <svg
              className="personal-campus-map"
              viewBox="0 0 1672 941"
              role="group"
              aria-label={t({
                en: "Your personal MedClub campus",
                ar: "حرم ميدكلب الخاص بك",
              })}
            >
              <defs>
                <mask
                  id={`${id}-growth`}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="1672"
                  height="941"
                  style={{ maskType: "luminance" }}
                >
                  <rect width="1672" height="941" fill="black" />
                  {campusDestinations.map((destination) => {
                    const level = levels[destination.id as keyof CampusLevels],
                      [x, y] =
                        places[destination.id as keyof typeof places].center;
                    return (
                      <g
                        key={destination.id}
                        data-campus-level={level}
                        data-campus-building={destination.id}
                        filter={`url(#${id}-soft-mask)`}
                      >
                        {level >= 3 ? (
                          <path
                            d={phoneRestorationRegions[destination.id]}
                            fill="white"
                          />
                        ) : level >= 2 ? (
                          <polygon points={destination.polygon} fill="white" />
                        ) : level >= 1 ? (
                          <ellipse
                            cx={x}
                            cy={y}
                            rx={destination.id === "journals" ? 105 : 98}
                            ry={100}
                            fill="white"
                          />
                        ) : null}
                      </g>
                    );
                  })}
                </mask>
                <filter id={`${id}-soft-mask`}>
                  <feGaussianBlur stdDeviation="5" />
                </filter>
              </defs>
              <image
                href={active}
                width={1672}
                height={941}
                mask={`url(#${id}-growth)`}
                data-personal-growth-source="fixed"
              />
              <CampusLights
                lit={
                  life.lit && levels[life.lit as keyof CampusLevels]
                    ? life.lit
                    : null
                }
                revealed={life.revealed.filter(
                  (key) => levels[key as keyof CampusLevels] > 0,
                )}
              />
              {campusDestinations.map((destination) => {
                const key = destination.id as keyof typeof places,
                  place = places[key];
                return (
                  <AppLink
                    key={key}
                    href={place.href}
                    className="campus-building"
                    data-personal-campus-link={key}
                    aria-label={t(place.label)}
                    onFocus={() => setSelected(key)}
                    onPointerEnter={() => setSelected(key)}
                  >
                    <polygon
                      className="campus-building-hit"
                      points={destination.polygon}
                      vectorEffect="non-scaling-stroke"
                    />
                    <g
                      transform={
                        dir === "rtl"
                          ? `translate(${destination.labelX * 2} 0) scale(-1 1)`
                          : undefined
                      }
                    >
                      <text
                        className="campus-building-label"
                        x={destination.labelX}
                        y={destination.labelY}
                        transform={`rotate(${dir === "rtl" ? -destination.rotation : destination.rotation} ${destination.labelX} ${destination.labelY})`}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        aria-hidden="true"
                      >
                        {t(place.label)}
                      </text>
                    </g>
                  </AppLink>
                );
              })}
            </svg>
          )}
        </div>
      </div>
      <div className="personal-campus-caption">
        <span
          className="campus-level-dots"
          aria-label={t(stages[levels[selected]])}
        >
          {[1, 2, 3].map((n) => (
            <i key={n} data-earned={levels[selected] >= n || undefined} />
          ))}
        </span>
        <strong>{t(activePlace.label)}</strong>
        <span>{t(stages[levels[selected]])}</span>
        <AppLink href={activePlace.href} aria-label={t(activePlace.label)}>
          <ArrowUpRight className="directional" size={18} />
        </AppLink>
      </div>
      <p className="personal-campus-explainer">{t(activePlace.body)}</p>
      <nav
        className="personal-campus-destinations"
        aria-label={t({ en: "Personal campus destinations", ar: "وجهات حرمك" })}
      >
        {Object.entries(places).map(([key, place]) => (
          <AppLink
            key={key}
            href={place.href}
            onFocus={() => setSelected(key as keyof typeof places)}
          >
            {t(place.label)}
          </AppLink>
        ))}
      </nav>
      <details className="personal-campus-guide">
        <summary>
          {t({ en: "How your campus grows", ar: "كيف يتطور حرمك" })}
        </summary>
        <p>
          {t({
            en: "Complete resource reviews, review different recall cards, organize saved materials or take part in approved activities. Six, eighteen and thirty-six completed reviews can also develop the community, mentorship and contribution buildings. Your progress stays when you take a break. Visits and timer minutes do not count.",
            ar: "أكمل مراجعات المصادر وراجع بطاقات مختلفة ونظم المحفوظات أو شارك في أنشطة معتمدة. ست أو ثماني عشرة أو ست وثلاثون مراجعة مكتملة تطور أيضاً مباني المجتمع والإرشاد والمساهمات. يبقى تقدمك عند أخذ استراحة. الزيارات ودقائق المؤقت لا تُحتسب.",
          })}
        </p>
      </details>
    </div>
  );
}
