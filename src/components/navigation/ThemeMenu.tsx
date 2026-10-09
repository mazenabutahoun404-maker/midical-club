import { Sun, Moon, Monitor } from "lucide-react";
import {
  useAppearance,
  type ColorMode,
} from "../../app/providers/AppearanceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";

const choices = [
  { value: "light", en: "Light", ar: "فاتح", Icon: Sun },
  { value: "dark", en: "Dark", ar: "داكن", Icon: Moon },
  { value: "system", en: "System", ar: "حسب الجهاز", Icon: Monitor },
] as const;
export function nextColorMode(mode: ColorMode): ColorMode {
  return mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
}
export function ThemeMenu({
  nativeTooltip = true,
}: { nativeTooltip?: boolean } = {}) {
  const { colorMode, setColorMode, persisted } = useAppearance();
  const { locale } = useLocale();
  const current = choices.find((choice) => choice.value === colorMode)!;
  const next = choices.find(
    (choice) => choice.value === nextColorMode(colorMode),
  )!;
  const title = locale === "ar" ? "مظهر الموقع" : "Color mode";
  const action = locale === "ar" ? "التبديل إلى " : "Switch to ";
  return (
    <button
      type="button"
      className="workspace-icon theme-trigger"
      aria-label={title + ": " + current[locale] + ". " + action + next[locale]}
      title={
        nativeTooltip
          ? action +
            next[locale] +
            (!persisted
              ? locale === "ar"
                ? " · لهذه الجلسة"
                : " · this session"
              : "")
          : undefined
      }
      data-color-mode={colorMode}
      onClick={() => setColorMode(next.value)}
    >
      <span className="utility-mode-glyph" key={colorMode}>
        <current.Icon size={19} aria-hidden="true" />
      </span>
    </button>
  );
}
