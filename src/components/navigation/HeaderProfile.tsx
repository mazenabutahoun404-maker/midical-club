import { ArrowUpRight, UserRound } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { StudentProfile } from "../../types/student";
import { MorphIcon } from "../ui/MorphIcon";
import { AppLink } from "./AppLink";

/** A named profile portal stays available when the sidebar is collapsed or hidden. */
export function HeaderProfile({
  href,
  profile,
  signedIn = true,
}: {
  href: string;
  profile?: StudentProfile;
  signedIn?: boolean;
}) {
  const { label, t } = useLocale();
  const title = label(signedIn ? "myProfile" : "signIn");
  return (
    <AppLink
      href={href}
      className="header-profile-priority profile-portal space-portal-link"
      aria-label={title}
      title={title}
    >
      <span className="profile-portal-avatar" aria-hidden="true">
        {profile ? t(profile.initials) : <MorphIcon icon={UserRound} size={19} />}
      </span>
      <span className="profile-portal-copy">
        <strong>{title}</strong>
        {profile && <small>{t(profile.name)}</small>}
      </span>
      <ArrowUpRight size={15} className="directional" aria-hidden="true" />
    </AppLink>
  );
}
