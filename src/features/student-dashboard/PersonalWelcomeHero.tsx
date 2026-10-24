import { lazy, Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { VitalWelcome } from "../../components/medical/VitalWelcome";
import { AccountSettingsButton } from "../../components/navigation/AccountSettingsButton";
import type { CampusLevels } from "./useCampusGrowth";
import "../homepage/living-campus.css";
const PersonalCampus = lazy(() => import("./PersonalCampus"));

export function PersonalWelcomeHero({
  firstName,
  levels,
  resumeHref,
  openRevision,
}: {
  firstName: string;
  levels: CampusLevels;
  resumeHref?: string;
  openRevision: () => void;
}) {
  const { t, dir } = useLocale();
  return (
    <section
      className="personal-welcome-hero campus-hero"
      data-direction={dir}
      aria-labelledby="personal-welcome-heading"
    >
      <div className="campus-hero-layout">
        <div className="campus-hero-copy" dir={dir}>
          <div className="personal-welcome-utilities">
            <p className="personal-welcome-greeting">
              {t({ en: "Welcome back", ar: "مرحباً بعودتك" })},{" "}
              <strong>{firstName}.</strong>
            </p>
            <AccountSettingsButton />
          </div>
          <h1 id="personal-welcome-heading" data-page-heading tabIndex={-1}>
            <VitalWelcome
              identity="personal-welcome"
              lines={[
                { text: t({ en: "Back in", ar: "أهلاً بك" }) },
                {
                  text: t({ en: "rhythm.", ar: "من جديد." }),
                  className: "campus-hero-accent",
                },
              ]}
            />
          </h1>
          <p>
            {t({
              en: "Pick up where you left off.",
              ar: "تابع من حيث توقفت.",
            })}
          </p>
          <div className="campus-hero-actions">
            <AppLink
              href={resumeHref || "/my/learning"}
              className="campus-primary-action"
            >
              {t(
                resumeHref
                  ? { en: "Resume studying", ar: "متابعة الدراسة" }
                  : { en: "Open my courses", ar: "فتح مساقاتي" },
              )}
              <ArrowUpRight size={20} className="directional" />
            </AppLink>
            <button
              type="button"
              className="campus-secondary-action"
              onClick={openRevision}
            >
              {t({ en: "Quick revision", ar: "مراجعة سريعة" })}
              <ArrowUpRight size={17} className="directional" />
            </button>
          </div>
        </div>
        <div className="campus-scene personal-welcome-scene">
          <div className="campus-scene-inner">
            <Suspense
              fallback={
                <div
                  className="personal-welcome-placeholder"
                  aria-hidden="true"
                />
              }
            >
              <PersonalCampus levels={levels} quiet={false} hero />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="personal-welcome-footer">
        <span>
          {t({ en: "Your MedClub campus", ar: "حرم ميدكلب الخاص بك" })}
        </span>
        <AppLink href="/my/progress">
          {t({ en: "Built by your journey", ar: "يتطور برحلتك" })}
          <ArrowUpRight size={15} className="directional" />
        </AppLink>
      </div>
    </section>
  );
}
