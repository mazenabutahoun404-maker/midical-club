import { ArrowRight } from "lucide-react";
import type { SiteContent } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import { Icon } from "../ui/Icon";
export function MegaMenu({
  navigation,
  onNavigate,
}: {
  navigation: SiteContent["navigation"];
  onNavigate: () => void;
}) {
  const { t, label } = useLocale();
  return (
    <div className="mega-menu" id="learn-menu">
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
                href={item.href}
                onClick={onNavigate}
              >
                {item.icon && <Icon name={item.icon} motion />}
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
}
