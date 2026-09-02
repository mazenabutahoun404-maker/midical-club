import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
  SheetClose,
} from "../ui/sheet";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
export function MobileNavigation({ site }: { site: SiteContent }) {
  const [open, setOpen] = useState(false);
  const { label, t, dir } = useLocale();
  const location = useLocation();
  useEffect(() => setOpen(false), [location.key]);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="icon-button mobile-menu" aria-label={label("menu")}>
          <Menu size={21} />
          <span>{label("more")}</span>
        </button>
      </SheetTrigger>
      <SheetContent
        side={dir === "rtl" ? "left" : "right"}
        dir={dir}
        className="mobile-sheet"
        showCloseButton={false}
      >
        <SheetHeader>
          <SheetTitle>{label("menuTitle")}</SheetTitle>
          <SheetDescription>{label("menuDescription")}</SheetDescription>
        </SheetHeader>
        <nav className="mobile-nav-list" aria-label={label("menuTitle")}>
          <AppLink href="/" onClick={() => setOpen(false)}>
            {label("home")}
          </AppLink>
          <AppLink href="/learn" onClick={() => setOpen(false)}>
            {label("learn")}
          </AppLink>
          {[
            ...site.navigation.academic,
            ...site.navigation.main,
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
          <AppLink href="/my" onClick={() => setOpen(false)}>
            {label("myProfile")}
          </AppLink>
        </nav>
        <SheetClose className="modal-close" aria-label={label("close")}>
          <X size={20} />
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
