import { ArrowUpRight, Languages, MapPin, UsersRound } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { routes } from "../../constants/routes";
import type { Mentor, MentorshipRequest } from "../../types/content";
import { AppLink } from "../navigation/AppLink";
import { Button } from "../ui/button";

export function MentorCard({
  mentor,
  request,
  onRequest,
}: {
  mentor: Mentor;
  request?: MentorshipRequest;
  onRequest: (mentor: Mentor) => void;
}) {
  const { t, label } = useLocale();
  const openPlaces = Math.max(0, mentor.capacity - mentor.activeMentees);
  return (
    <article
      className="mentor-card"
      data-capacity={openPlaces ? "open" : "full"}
    >
      <div className="mentor-card-head">
        <span className="mentor-avatar" aria-hidden="true">
          {t(mentor.initials)}
        </span>
        <div>
          <span>
            {t(mentor.title)} · {label("classOf")} {mentor.graduationYear}
          </span>
          <h2>{t(mentor.name)}</h2>
          <strong>{t(mentor.specialty)}</strong>
        </div>
      </div>
      <p>{t(mentor.bio)}</p>
      <div className="mentor-meta">
        <span>
          <MapPin size={15} /> {label(mentor.format)}
        </span>
        <span>
          <Languages size={15} /> {mentor.languages.map(t).join(" · ")}
        </span>
      </div>
      <div className="mentor-areas">
        <span>{label("mentoringAreas")}</span>
        <ul>
          {mentor.areas.map((area) => (
            <li key={area.en}>{t(area)}</li>
          ))}
        </ul>
      </div>
      <div
        className="mentor-capacity"
        aria-label={`${openPlaces} ${label("placesAvailable")}`}
      >
        <span>
          <UsersRound size={17} />
        </span>
        <div>
          <i
            style={{
              width: `${(mentor.activeMentees / mentor.capacity) * 100}%`,
            }}
          />
        </div>
        <strong>
          {openPlaces
            ? `${openPlaces} ${label("placesAvailable")}`
            : label("atCapacity")}
        </strong>
      </div>
      {request &&
      request.status !== "cancelled" &&
      request.status !== "declined" ? (
        <AppLink
          href={routes.myMentorship}
          className="button button-secondary mentor-action"
        >
          {label(request.status)}
          <ArrowUpRight size={17} className="directional" />
        </AppLink>
      ) : (
        <Button
          className="button button-primary mentor-action"
          disabled={!openPlaces}
          onClick={() => onRequest(mentor)}
        >
          {label("requestSession")}
          <ArrowUpRight size={17} className="directional" />
        </Button>
      )}
    </article>
  );
}
