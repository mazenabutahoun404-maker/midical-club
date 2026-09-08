import type { SiteContent } from "../../types/content";
import { DesktopNavigation } from "./DesktopNavigation";
import { PhoneNavigation } from "./PhoneNavigation";
export function Navbar({ site }: { site: SiteContent }) {
  return (
    <>
      <DesktopNavigation site={site} />
      <PhoneNavigation site={site} />
    </>
  );
}
