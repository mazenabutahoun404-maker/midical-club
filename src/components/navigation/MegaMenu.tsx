import { ArrowRight } from "lucide-react";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import { Icon } from "../ui/Icon";
import { forwardRef, type PointerEventHandler } from "react";
export const MegaMenu = forwardRef<
  HTMLDivElement,
  {
    navigation: SiteContent["navigation"];
    onNavigate: () => void;
    onPointerEnter?: PointerEventHandler<HTMLDivElement>;
    onPointerLeave?: PointerEventHandler<HTMLDivElement>;
    floating?: boolean;
  }
>(function MegaMenu(
  { navigation, onNavigate, onPointerEnter, onPointerLeave, floating = false },
  ref,
) {
  const { t, label } = useLocale();
  return (
    <div
      ref={ref}
      className={`mega-menu${floating ? " learn-subpanel" : ""}`}
      popover={floating ? "manual" : undefined}
      id="learn-menu"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="container mega-grid">
        {[navigation.academic, navigation.tools].map((items, index) => (
          <div key={index}>
            <p className="eyebrow">
              {label(index === 0 ? "academic" : "tools")}
            </p>
            {items.map((item) => (
              <AppLink
                key={item.id}
                className="mega-link"
                data-learn-destination={item.id}
                href={item.href}
                onClick={onNavigate}
              >
                {item.icon && <Icon name={item.icon} />}
                <div>
                  <b>{t(item.label)}</b>
                  {item.description && <p>{t(item.description)}</p>}
                </div>
              </AppLink>
            ))}
          </div>
        ))}
        <div className="mega-aside">
          <span className="eyebrow">{label("ctaEyebrow")}</span>
          <h3>{label("ctaTitle")}</h3>
          <AppLink className="text-link" href="/learn" onClick={onNavigate}>
            {label("allCoursesLink")}
            <ArrowRight className="directional" size={16} />
          </AppLink>
        </div>
      </div>
    </div>
  );
});
