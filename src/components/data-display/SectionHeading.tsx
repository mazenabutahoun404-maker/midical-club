import { ArrowRight } from "lucide-react";
import type { SectionHeading as Heading } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../navigation/AppLink";
export function SectionHeading({
  heading,
  href,
  linkLabel,
  concise = false,
}: {
  heading: Heading;
  href?: string;
  linkLabel?: string;
  concise?: boolean;
}) {
  const { t } = useLocale();
  return (
    <div className="section-heading">
      <div>
        {!concise && <div className="eyebrow">{t(heading.eyebrow)}</div>}
        <h2>{t(heading.title)}</h2>
        {!concise && heading.description && <p>{t(heading.description)}</p>}
      </div>
      {href && (
        <AppLink href={href} className="text-link">
          {linkLabel}
          <ArrowRight className="directional" size={16} />
        </AppLink>
      )}
    </div>
  );
}
