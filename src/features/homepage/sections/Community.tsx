import { HomeSectionState } from "./HomeSectionState";
import { ArrowUpRight, Compass, Users } from "lucide-react";
import type { SiteContent } from "../../../types/content";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { useMentors } from "../../../hooks/useContent";
import { ActionLink } from "../../../components/ui/ActionLink";
import { AppLink } from "../../../components/navigation/AppLink";
import { LoadingState } from "../../../components/feedback/LoadingState";
import { ErrorState } from "../../../components/feedback/ErrorState";
import { mentorPath } from "../../../constants/routes";
export function Community({ site }: { site: SiteContent }) {
  const { t } = useLocale(),
    mentors = useMentors();
  return (
    <div className="home-people-layout">
      <div className="home-people-intro" data-home-reveal="rise">
        <div className="home-community-emblem" aria-hidden="true">
          <span className="home-community-ring" />
          <span className="home-community-core">
            <Users size={40} />
          </span>
          {mentors.data?.slice(0, 3).map((mentor, index) => (
            <span
              className="home-community-person"
              data-person={index}
              key={mentor.id}
            >
              {t(mentor.initials)}
            </span>
          ))}
        </div>
        <p>{t(site.community.body)}</p>
        <div className="home-people-actions">
          <ActionLink href={site.community.action.href}>
            {t(site.community.action.label)}
            <ArrowUpRight className="directional" size={17} />
          </ActionLink>
          <ActionLink href="/mentorship" variant="outline">
            {t({ en: "Find a mentor", ar: "ابحث عن مرشد" })}
            <Compass size={17} aria-hidden="true" />
          </ActionLink>
        </div>
      </div>
      <div className="home-mentor-directory" data-home-reveal="slide">
        <h3>{t({ en: "Meet the mentors", ar: "تعرّف على المرشدين" })}</h3>
        {mentors.isPending ? (
          <LoadingState />
        ) : mentors.isError ? (
          <ErrorState
            error={mentors.error}
            retry={() => void mentors.refetch()}
          />
        ) : mentors.data.length ? (
          <ul>
            {mentors.data.slice(0, 3).map((mentor, index) => (
              <li key={mentor.id} data-mentor-step={index}>
                <AppLink href={mentorPath(mentor.slug)}>
                  <span className="home-mentor-initials" aria-hidden="true">
                    {t(mentor.initials)}
                  </span>
                  <span className="home-mentor-name">
                    <strong>{t(mentor.name)}</strong>
                    <small>{t(mentor.specialty)}</small>
                  </span>
                  <ArrowUpRight
                    className="directional"
                    size={18}
                    aria-hidden="true"
                  />
                </AppLink>
              </li>
            ))}
          </ul>
        ) : (
          <HomeSectionState kind="mentors" />
        )}
      </div>
    </div>
  );
}
