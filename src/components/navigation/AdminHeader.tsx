import { ScrollHeader } from "./ScrollHeader";
import { NotebookFittings } from "./NotebookFittings";
import { LocationTitle } from "./LocationTitle";
import { ArrowLeft, Radio, UserRound } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import { HeaderNotes } from "./HeaderNotes";

export function AdminHeader() {
  const { label } = useLocale();
  return (
    <ScrollHeader className="admin-header container">
      <NotebookFittings axis="header" />
      <div className="admin-header-start">
        <AppLink
          className="admin-back space-portal-link"
          href="/"
          aria-label={label("adminBackHome")}
          title={label("adminBackHome")}
        >
          <ArrowLeft size={17} className="directional" aria-hidden="true" />
          <span>{label("adminBackHome")}</span>
        </AppLink>
        <LocationTitle />
      </div>
      <span
        className="admin-live-chip"
        aria-label={label("adminSignalLive")}
        title={label("adminSignalLive")}
      >
        <Radio size={15} aria-hidden="true" />
        <span className="admin-signal-label">{label("adminSignalLive")}</span>
      </span>
      <div className="admin-header-actions">
        <HeaderNotes />
        <AppLink
          href="/my/profile"
          className="admin-operator profile-portal header-profile-priority space-portal-link"
          aria-label={label("myProfile")}
          title={label("myProfile")}
        >
          <UserRound size={18} aria-hidden="true" />
        </AppLink>
      </div>
    </ScrollHeader>
  );
}
