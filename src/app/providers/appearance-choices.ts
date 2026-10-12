import {
  appearancePalettes,
  type AppearancePalette,
} from "./appearance-palettes";
import type { ColorMode } from "./AppearanceProvider";

export const appearanceChoices = [
  ...appearancePalettes.flatMap((palette) =>
    (["light", "dark"] as const).map((mode) => ({
      id: `${palette.id}-${mode}`,
      palette: palette.id,
      mode,
      title: {
        en:
          palette.id === "tokyo"
            ? mode === "light"
              ? "Tokyo Day"
              : "Tokyo Night"
            : `${palette.title.en} · ${mode === "light" ? "Light" : "Dark"}`,
        ar: `${palette.title.ar} · ${mode === "light" ? "فاتح" : "داكن"}`,
      },
    })),
  ),
  {
    id: "system",
    palette: "medclub" as const,
    mode: "system" as const,
    title: { en: "System · follow this device", ar: "حسب الجهاز · تلقائي" },
  },
] as const;
export const findAppearanceChoice = (id: string) =>
  appearanceChoices.find((choice) => choice.id === id);
export const appearanceChoiceId = (
  palette: AppearancePalette,
  mode: ColorMode,
) => (mode === "system" ? "system" : `${palette}-${mode}`);
