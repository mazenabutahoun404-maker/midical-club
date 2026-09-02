import { ArrowRight } from "lucide-react";
import type { SiteContent } from "../../../types/content";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { ActionLink } from "../../../components/ui/ActionLink";
export function Community({ site }: { site: SiteContent }) {
  const { t } = useLocale();
  return (
    <div className="community">
      <div>
        <span className="eyebrow">{t(site.headings.community.eyebrow)}</span>
        <h2 className="preserve-lines">{t(site.headings.community.title)}</h2>
      </div>
      <div>
        <p>{t(site.community.body)}</p>
        <ActionLink href={site.community.action.href}>
          {t(site.community.action.label)}
          <ArrowRight className="directional" size={16} />
        </ActionLink>
      </div>
    </div>
  );
}
