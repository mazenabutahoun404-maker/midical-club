import { publicMainItems } from "./involvement";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Modal } from "../ui/Modal";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import { useAuth } from "../../app/providers/AuthProvider";
import { signInPath } from "../../constants/routes";
export function MobileNavigation({ site }: { site: SiteContent }) {
  const [open, setOpen] = useState(false);
  const { label, t } = useLocale();
  const location = useLocation();
  const auth = useAuth();
  const signedIn = auth.snapshot.status === "authenticated";
  const secondaryActive = [
    "/events",
    "/opportunities",
    "/community",
    "/journal",
    "/mentorship",
    "/contribute",
    "/recruitment",
    "/store",
    "/utilities",
  ].some((path) => location.pathname.startsWith(path));
  useEffect(() => setOpen(false), [location.key]);
  return (
    <>
      <button
        className={`icon-button mobile-menu ${secondaryActive ? "active" : ""}`}
        aria-current={secondaryActive ? "page" : undefined}
        aria-label={label("menu")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu size={21} aria-hidden="true" />
        <span>{label("more")}</span>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={label("menuTitle")}
        description={label("menuDescription")}
        className="mobile-menu-dialog"
      >
        <nav className="mobile-nav-list" aria-label={label("menuTitle")}>
          <AppLink href="/" onClick={() => setOpen(false)}>
            {label("home")}
          </AppLink>
          <AppLink href="/learn" onClick={() => setOpen(false)}>
            {label("learn")}
          </AppLink>
          {[
            ...site.navigation.academic,
            ...publicMainItems(site),
            ...site.navigation.tools,
          ].map((item) => (
            <AppLink
              key={item.id}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {t(item.label)}
            </AppLink>
          ))}
          <AppLink href="/journal" onClick={() => setOpen(false)}>
            {label("journal")}
          </AppLink>
          <AppLink
            href={signedIn ? "/my" : signInPath("/my")}
            onClick={() => setOpen(false)}
          >
            {label(signedIn ? "myProfile" : "signIn")}
          </AppLink>
        </nav>
      </Modal>
    </>
  );
}
