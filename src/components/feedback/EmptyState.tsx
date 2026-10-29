import { EmptyScene } from "./EmptyScene";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "../ui/empty";
import { ActionLink } from "../ui/ActionLink";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useServices } from "../../app/providers/ServicesProvider";
export function EmptyState({
  title,
  description,
  href,
  actionLabel,
}: {
  title?: string;
  description?: string;
  href?: string;
  actionLabel?: string;
}) {
  const { label, t } = useLocale();
  const live = useServices().contentSnapshot?.kind === "live";
  return (
    <Empty className="empty-state">
      <EmptyScene />
      <EmptyHeader>
        <EmptyTitle>{title || label("emptyTitle")}</EmptyTitle>
        <EmptyDescription>
          {description ||
            (live
              ? t({
                  en: "Nothing has been added here yet.",
                  ar: "لم يُضف محتوى هنا بعد.",
                })
              : label("emptyBody"))}
        </EmptyDescription>
      </EmptyHeader>
      {href && (
        <ActionLink href={href}>{actionLabel || label("browse")}</ActionLink>
      )}
    </Empty>
  );
}
