import { ScrollHeader } from "./ScrollHeader";
import { HeaderUtilities } from "./HeaderUtilities";
import { useLocale } from "../../app/providers/LocaleProvider";
export function PersonalHeader() {
  const { label } = useLocale();
  return (
    <ScrollHeader className="personal-header utility-header">
      <div className="personal-header-actions">
        <HeaderUtilities searchLabel={label("personalSearch")} />
      </div>
    </ScrollHeader>
  );
}
