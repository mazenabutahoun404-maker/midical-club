import {
  ArrowUpRight,
  CalendarClock,
  Clock3,
  Layers3,
  UsersRound,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { positionPath } from "../../constants/routes";
import { formatDate } from "../../lib/dates";
import { positionStatusKey, teamKey } from "../../lib/recruitment";
import type { RecruitmentPosition } from "../../types/recruitment";
import { AppLink } from "../navigation/AppLink";

export function RecruitmentPositionCard({
  position,
}: {
  position: RecruitmentPosition;
}) {
  const { label, t, locale } = useLocale();
  return (
    <article
      className="recruitment-position-card"
      data-accent={position.accent}
      data-status={position.status}
    >
      <div className="position-card-signal" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <header>
        <span className="position-team">
          <Layers3 size={15} /> {label(teamKey(position.team))}
        </span>
        <span className="position-status">
          {label(positionStatusKey(position.status))}
        </span>
      </header>
      <div className="position-card-copy">
        <h2>{t(position.title)}</h2>
        <p>{t(position.summary)}</p>
      </div>
      <ul className="position-skills" aria-label={label("usefulSkills")}>
        {position.skills.slice(0, 3).map((skill) => (
          <li key={skill.en}>{t(skill)}</li>
        ))}
      </ul>
      <dl>
        <div>
          <dt>
            <UsersRound size={15} /> {label("openings")}
          </dt>
          <dd>{position.openings}</dd>
        </div>
        <div>
          <dt>
            <Clock3 size={15} /> {label("hoursPerWeek")}
          </dt>
          <dd>{position.commitmentHoursPerWeek}</dd>
        </div>
        <div>
          <dt>
            <CalendarClock size={15} /> {label("closes")}
          </dt>
          <dd>{formatDate(position.closesAt, locale)}</dd>
        </div>
      </dl>
      <AppLink
        href={positionPath(position.slug)}
        className="position-card-action"
      >
        {label("viewPosition")}
        <ArrowUpRight size={17} className="directional" />
      </AppLink>
    </article>
  );
}
