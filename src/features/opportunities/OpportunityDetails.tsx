import type { Opportunity } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { formatDate } from "../../lib/dates";
import { DetailFacts } from "../../components/data-display/DetailFacts";
import { Notice } from "../../components/feedback/Notice";
export function OpportunityDetails({ item }: { item: Opportunity }) {
  const { t, label, locale } = useLocale();
  return (
    <>
      <DetailFacts
        items={[
          { label: label("organization"), value: t(item.organization) },
          { label: label("location"), value: t(item.location) },
          {
            label: label("deadline"),
            value: formatDate(item.deadline, locale),
          },
          { label: label("eligibility"), value: t(item.eligibility) },
        ]}
      />
      <Notice>{label("opportunityUnavailable")}</Notice>
    </>
  );
}
