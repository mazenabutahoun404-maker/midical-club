import { ScrollHeader } from "./ScrollHeader";
import { NotebookFittings } from "./NotebookFittings";
import { LocationTitle } from "./LocationTitle";
import { ArrowLeft } from "lucide-react";
import { HeaderUtilities } from "./HeaderUtilities";
import { HeaderProfile } from "./HeaderProfile";
import type { StudentProfile } from "../../types/student";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
export function PersonalHeader({ profile }: { profile?: StudentProfile }) {
  const { label } = useLocale();
  return (
    <ScrollHeader className="personal-header container">
      <NotebookFittings axis="header" />
      <AppLink
        className="back-to-medclub space-portal-link"
        href="/"
        aria-label={label("backToMedClub")}
        title={label("backToMedClub")}
      >
        <ArrowLeft size={17} className="directional" aria-hidden="true" />
        <span>{label("backToMedClub")}</span>
      </AppLink>
      <LocationTitle />
      <div className="personal-header-actions">
        <HeaderUtilities searchLabel={label("personalSearch")} />
        <HeaderProfile href="/my/profile" profile={profile} />
      </div>
    </ScrollHeader>
  );
}
