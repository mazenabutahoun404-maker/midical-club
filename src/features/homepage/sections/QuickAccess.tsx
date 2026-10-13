import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import type { SiteContent } from "../../../types/content";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { AppLink } from "../../../components/navigation/AppLink";
import { Icon } from "../../../components/ui/Icon";
export function QuickAccess({ site }: { site: SiteContent }) {
  const { t } = useLocale();
  return (
    <div className="home-gateways">
      {site.pathways.map((item, index) => (
        <div
          className="home-gateway-wrap"
          key={item.id}
          data-home-reveal="unfold"
          style={
            {
              "--home-stagger": `${Math.min(index, 4) * 90}ms`,
            } as CSSProperties
          }
        >
          <AppLink href={item.href} className="home-gateway">
            <div className="home-gateway-art" aria-hidden="true">
              <span className="home-gateway-arch" />
              <span className="home-gateway-emblem">
                <Icon name={item.icon || "book"} />
              </span>
              <span className="home-gateway-orbit" />
            </div>
            <div className="home-gateway-caption">
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <ArrowUpRight className="directional" size={21} />
            </div>
            <h3>{t(item.label)}</h3>
            {item.description && <p>{t(item.description)}</p>}
          </AppLink>
        </div>
      ))}
    </div>
  );
}
