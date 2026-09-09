import { Languages, Check } from "lucide-react";
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
    <DropdownMenu dir={dir}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="language-button"
          aria-label={label("language")}
        >
          <Languages size={18} aria-hidden="true" />
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
