import { BookOpen } from "lucide-react";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "../ui/empty";
import { ActionLink } from "../ui/ActionLink";
import { useLocale } from "../../app/providers/LocaleProvider";
export function EmptyState({
  title,
  description,
  href,
}: {
  title?: string;
  description?: string;
  href?: string;
}) {
  const { label } = useLocale();
  return (
    <Empty className="empty-state">
      <BookOpen aria-hidden="true" />
      <EmptyHeader>
        <EmptyTitle>{title || label("emptyTitle")}</EmptyTitle>
        <EmptyDescription>{description || label("emptyBody")}</EmptyDescription>
      </EmptyHeader>
      {href && <ActionLink href={href}>{label("browse")}</ActionLink>}
    </Empty>
  );
}
