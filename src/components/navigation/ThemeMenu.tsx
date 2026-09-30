import { Sun, Moon, Monitor } from "lucide-react";
import {
  useAppearance,
  type ColorMode,
} from "../../app/providers/AppearanceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";

const choices = [
  { value: "light", en: "Light", ar: "فاتح", Icon: Sun },
  { value: "dark", en: "Dark", ar: "داكن", Icon: Moon },
  { value: "system", en: "System", ar: "حسب الجهاز", Icon: Monitor },
] as const;

export function ThemeMenu() {
  const { colorMode, setColorMode, persisted } = useAppearance();
  const { locale, dir } = useLocale();
  const current = choices.find((choice) => choice.value === colorMode)!;
  const title = locale === "ar" ? "مظهر الموقع" : "Color mode";
  return (
    <DropdownMenu modal={false} dir={dir}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="workspace-icon theme-trigger"
          aria-label={`${title}: ${current[locale]}`}
          title={`${title}: ${current[locale]}`}
        >
          <span className="utility-mode-glyph">
            <current.Icon size={19} aria-hidden="true" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="theme-menu">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={colorMode}
          onValueChange={(value) => setColorMode(value as ColorMode)}
        >
          {choices.map(({ value, Icon, ...name }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon size={17} aria-hidden="true" />
              {name[locale]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        {!persisted && (
          <p role="status" className="theme-session-note">
            {locale === "ar"
              ? "المظهر محفوظ لهذه الجلسة فقط"
              : "Saved for this session only"}
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
