import { useLocation } from "react-router-dom";
import {
  HeartHandshake,
  MessageCircleQuestion,
  UsersRound,
  UserRoundCheck,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { routes } from "../../constants/routes";
import type { MessageKey } from "../../constants/messages";
import { AppLink } from "./AppLink";

const items = [
  { href: routes.mentorship, label: "findMentor", icon: HeartHandshake },
  { href: routes.mentorshipSessions, label: "groupSessions", icon: UsersRound },
  {
    href: routes.mentorshipQuestions,
    label: "mentorQA",
    icon: MessageCircleQuestion,
  },
  { href: routes.myMentorship, label: "myMentorship", icon: UserRoundCheck },
] satisfies { href: string; label: MessageKey; icon: typeof HeartHandshake }[];

export function MentorshipNavigation() {
  const { pathname } = useLocation();
  const { label } = useLocale();
  const active = (href: string) =>
    href === routes.mentorship ? pathname === href : pathname.startsWith(href);
  return (
    <nav
      className="mentorship-navigation"
      aria-label={label("mentorshipNavigation")}
    >
      {items.map(({ href, label: key, icon: Icon }) => (
        <AppLink
          key={href}
          href={href}
          className={active(href) ? "active" : ""}
          aria-current={active(href) ? "page" : undefined}
        >
          <Icon aria-hidden="true" size={19} className="mentorship-nav-icon" />
          <span>{label(key)}</span>
        </AppLink>
      ))}
    </nav>
  );
}
