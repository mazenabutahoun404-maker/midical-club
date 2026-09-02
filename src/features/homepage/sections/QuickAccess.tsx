import { ArrowUpRight } from "lucide-react";
import type { SiteContent } from "../../../types/content";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { AppLink } from "../../../components/navigation/AppLink";
import { Icon } from "../../../components/ui/Icon";
export function QuickAccess({ site }: { site: SiteContent }) {
  const { t } = useLocale();
  return (
    <div className="pathways">
      {site.pathways.map((item) => (
        <AppLink key={item.id} href={item.href} className="pathway">
          <span className="pathway-icon">
            <Icon name={item.icon || "book"} />
          </span>
          <ArrowUpRight className="arrow directional" size={19} />
          <h3>{t(item.label)}</h3>
          {item.description && <p>{t(item.description)}</p>}
        </AppLink>
      ))}
    </div>
  );
}
