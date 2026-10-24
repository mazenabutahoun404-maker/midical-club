import { HeaderUtilities } from "./HeaderUtilities";
import { ScrollHeader } from "./ScrollHeader";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
export function WorkspaceHeader({ site: _site }: { site: SiteContent }) {
  const { label } = useLocale();
  return (
    <ScrollHeader className="workspace-header utility-header">
      <div className="workspace-actions">
        <HeaderUtilities searchLabel={label("searchLabel")} />
      </div>
    </ScrollHeader>
  );
}
