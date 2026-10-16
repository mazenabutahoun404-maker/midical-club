import { ArrowUpRight } from "lucide-react";
import type { SiteContent } from "../../../types/content";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { AppLink } from "../../../components/navigation/AppLink";
import { Icon } from "../../../components/ui/Icon";
export function QuickAccess({ site }: { site: SiteContent }) {
  const { t } = useLocale();
  return (
    <nav
      className="home-study-shortcuts"
      aria-label={t({ en: "Study shortcuts", ar: "اختصارات الدراسة" })}
    >
      {site.pathways.map((item, index) => (
        <AppLink
          key={item.id}
          href={item.href}
          className="home-study-shortcut"
          data-home-reveal="rise"
          data-home-step={index % 4}
          data-shortcut-tone={index % 4}
        >
          <span className="home-shortcut-icon" aria-hidden="true">
            <Icon name={item.icon || "book"} />
          </span>
          <span className="home-shortcut-copy">
            <strong>{t(item.label)}</strong>
            {item.description && <small>{t(item.description)}</small>}
          </span>
          <ArrowUpRight className="directional" size={17} aria-hidden="true" />
        </AppLink>
      ))}
    </nav>
  );
}
