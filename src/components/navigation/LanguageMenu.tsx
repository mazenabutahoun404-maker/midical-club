import { UtilityGlyph } from "./UtilityGlyph";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useLocale } from "../../app/providers/LocaleProvider";
export function LanguageMenu() {
  const { locale, setLocale, label, dir } = useLocale();
  return (
    <DropdownMenu modal={false} dir={dir}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="language-button"
          aria-label={label("language")}
        >
          <UtilityGlyph kind="language" />
          <span>{locale === "en" ? "EN" : "عربي"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setLocale("en")} lang="en">
          English {locale === "en" && <Check size={16} />}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setLocale("ar")} lang="ar">
          العربية {locale === "ar" && <Check size={16} />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
