type LocalizedText = { en: string; ar: string };
export const appearancePalettes = [
  {
    id: "medclub",
    title: { en: "MedClub", ar: "النادي الطبي" },
    description: {
      en: "Original wine and warm paper",
      ar: "ألوان النبيذ والورق الدافئ الأصلية",
    },
    swatches: ["#96475e", "#f4f0e9", "#2b2933"],
    darkPaper: "#292b35",
    darkInk: "#e9e8e3",
    preferred: null,
  },
  {
    id: "paper",
    title: { en: "Paper", ar: "ورق" },
    description: { en: "Warm ivory with quiet ink", ar: "عاجي دافئ وحبر هادئ" },
    swatches: ["#f4ead7", "#514636", "#a50f15"],
    darkPaper: "#302d29",
    darkInk: "#eee6d6",
    preferred: "light",
  },
  {
    id: "dusk",
    title: { en: "Dusk", ar: "غسق" },
    description: {
      en: "Muted slate and wine accents",
      ar: "ألوان أردواز هادئة ولمسات نبيذية",
    },
    swatches: ["#292f3b", "#e3e6ed", "#b9c7e8"],
    darkPaper: "#292f3b",
    darkInk: "#e3e6ed",
    preferred: "dark",
  },
  {
    id: "contrast",
    title: { en: "High contrast", ar: "تباين عالٍ" },
    description: {
      en: "Clear boundaries and strong text",
      ar: "حدود واضحة ونصوص بارزة",
    },
    swatches: ["#ffffff", "#171a22", "#9b133b"],
    darkPaper: "#11151c",
    darkInk: "#ffffff",
    preferred: null,
  },
  {
    id: "tokyo",
    title: { en: "Tokyo Night", ar: "ليالي طوكيو" },
    description: {
      en: "Soft blue-violet; also has a day mode",
      ar: "أزرق وبنفسجي هادئان، مع وضع نهاري",
    },
    swatches: ["#1a1b26", "#7aa2f7", "#bb9af7"],
    darkPaper: "#1a1b26",
    darkInk: "#c0caf5",
    preferred: "dark",
  },
  {
    id: "solarized",
    title: { en: "Solarized", ar: "سولارايزد" },
    description: {
      en: "Deep teal at night, ivory by day",
      ar: "فيروزي عميق ليلاً وعاجي نهاراً",
    },
    swatches: ["#002b36", "#fdf6e3", "#2aa198"],
    darkPaper: "#002b36",
    darkInk: "#eee8d5",
    preferred: "dark",
  },
] as const satisfies readonly {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  swatches: readonly string[];
  darkPaper: string;
  darkInk: string;
  preferred: "light" | "dark" | null;
}[];
export type AppearancePalette = (typeof appearancePalettes)[number]["id"];
export const isAppearancePalette = (
  value: unknown,
): value is AppearancePalette =>
  appearancePalettes.some((palette) => palette.id === value);
export const getAppearancePalette = (id: AppearancePalette) =>
  appearancePalettes.find((palette) => palette.id === id)!;
