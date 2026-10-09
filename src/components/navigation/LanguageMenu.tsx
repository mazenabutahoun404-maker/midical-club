import { UtilityGlyph } from "./UtilityGlyph";
import { Button } from "../ui/button";
import { useLocale } from "../../app/providers/LocaleProvider";
export function LanguageMenu({
  nativeTooltip = true,
}: { nativeTooltip?: boolean } = {}) {
  const { locale, setLocale, label } = useLocale();
  const next = locale === "en" ? "ar" : "en";
  const hint = locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية";
  return (
    <Button
      variant="ghost"
      className="language-button"
      aria-label={label("language") + ": " + hint}
      title={nativeTooltip ? hint : undefined}
      onClick={() => setLocale(next)}
    >
      <UtilityGlyph kind="language" />
      <span>{locale === "en" ? "EN" : "عربي"}</span>
    </Button>
  );
}
