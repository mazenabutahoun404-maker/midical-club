import { HeaderUtilities } from "./HeaderUtilities";
import { HeaderProfile } from "./HeaderProfile";
import { ScrollHeader } from "./ScrollHeader";
import { NotebookFittings } from "./NotebookFittings";
import { LocationTitle } from "./LocationTitle";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Brand } from "./Brand";
import { useAuth } from "../../app/providers/AuthProvider";
import { signInPath } from "../../constants/routes";
export function WorkspaceHeader({ site }: { site: SiteContent }) {
  const { label } = useLocale();
  const auth = useAuth();
  const signedIn = auth.snapshot.status === "authenticated";
  return (
    <ScrollHeader className="workspace-header container">
      <NotebookFittings axis="header" />
      <LocationTitle />
      <div className="phone-brand">
        <Brand brand={site.brand} />
      </div>
      <div className="workspace-actions">
        <HeaderUtilities
          searchLabel={label("searchLabel")}
          searchClassName="workspace-search"
          showNotifications={signedIn}
        />
        <HeaderProfile
          href={signedIn ? "/my" : signInPath("/my")}
          profile={signedIn ? auth.snapshot.user?.profile : undefined}
          signedIn={signedIn}
        />
      </div>
    </ScrollHeader>
  );
}
