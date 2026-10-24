import { ScrollHeader } from "./ScrollHeader";
import { HeaderUtilities } from "./HeaderUtilities";
import { useLocale } from "../../app/providers/LocaleProvider";
export function AdminHeader() {
  const { label } = useLocale();
  return (
    <ScrollHeader className="admin-header utility-header">
      <div className="admin-header-actions">
        <HeaderUtilities searchLabel={label("searchLabel")} more={false} />
      </div>
    </ScrollHeader>
  );
}
