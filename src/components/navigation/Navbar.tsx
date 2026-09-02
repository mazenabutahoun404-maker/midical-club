import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { DesktopNavigation } from "./DesktopNavigation";
import { PhoneNavigation } from "./PhoneNavigation";
export function Navbar({ site }: { site: SiteContent }) {
  const { label } = useLocale();
  return (
    <>
      <a className="skip-link" href="#main">
        {label("skip")}
      </a>
      <DesktopNavigation site={site} />
      <PhoneNavigation site={site} />
    </>
  );
}
