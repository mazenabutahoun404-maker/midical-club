import { useLocale } from "../../app/providers/LocaleProvider";
import type { MessageKey } from "../../constants/messages";
import { ActionLink } from "../ui/ActionLink";
export function PlannedFeaturePage({ titleKey }: { titleKey: MessageKey }) {
  const { label } = useLocale();
  return (
    <div className="container not-found">
      <span className="eyebrow">{label("future")}</span>
      <h1 data-page-heading tabIndex={-1}>
        {label(titleKey)}
      </h1>
      <p>{label("futureBody")}</p>
      <ActionLink href="/">{label("back")}</ActionLink>
    </div>
  );
}
