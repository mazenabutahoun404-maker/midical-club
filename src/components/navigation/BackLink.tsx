import { ArrowLeft } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import "../../styles/content-states.css";
export function BackLink({ href, label }: { href: string; label?: string }) {
  const { t } = useLocale();
  return (
    <AppLink href={href} className="page-back-link">
      <ArrowLeft size={18} className="directional" aria-hidden="true" />
      <span>{label || t({ en: "Back", ar: "رجوع" })}</span>
    </AppLink>
  );
}
