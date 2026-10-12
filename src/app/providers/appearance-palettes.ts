type LocalizedText = { en: string; ar: string };
export const appearancePalettes = [
  {
    id: "medclub",
    title: { en: "MedClub", ar: "النادي الطبي" },
    description: {
      en: "Soft neutrals with MedClub red",
      ar: "ألوان محايدة هادئة مع أحمر النادي الطبي",
    },
    swatches: ["#a50f15", "#f5f5f2", "#202326"],
    darkPaper: "#292d30",
    darkInk: "#e4e7e5",
    preferred: null,
  },
  {
    id: "paper",
    title: { en: "Paper", ar: "ورق" },
    description: { en: "Warm ivory with quiet ink", ar: "عاجي دافئ وحبر هادئ" },
    swatches: ["#f5f0e6", "#242523", "#d7c8a6"],
    darkPaper: "#2e302c",
    darkInk: "#e7e5db",
    preferred: "light",
  },
  {
    id: "dusk",
    title: { en: "Dusk", ar: "غسق" },
    description: {
      en: "Quiet slate with soft blue accents",
      ar: "ألوان أردواز هادئة ولمسات زرقاء ناعمة",
    },
    swatches: ["#f1f3f5", "#232830", "#b3c5e1"],
    darkPaper: "#2d343d",
    darkInk: "#e1e6eb",
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
    swatches: ["#f1f2f6", "#222530", "#b6a8e5"],
    darkPaper: "#2c3040",
    darkInk: "#dce2f1",
    preferred: "dark",
  },
  {
    id: "solarized",
    title: { en: "Solarized", ar: "سولارايزد" },
    description: {
      en: "Deep teal at night, ivory by day",
      ar: "فيروزي عميق ليلاً وعاجي نهاراً",
    },
    swatches: ["#f6f3e8", "#203033", "#acd1c3"],
    darkPaper: "#293c3f",
    darkInk: "#e3e8df",
    preferred: "dark",
  },
  {
    id: "sage",
    title: { en: "Sage", ar: "المريمية" },
    description: { en: "Soft sage and olive accents", ar: "درجات المريمية الهادئة ولمسات زيتونية" },
    swatches: ["#f3f5ef", "#232b25", "#a8c79b"],
    darkPaper: "#2e3830",
    darkInk: "#e3eadf",
    preferred: "light",
  },
  {
    id: "midnight",
    title: { en: "Midnight", ar: "منتصف الليل" },
    description: { en: "Deep navy with quiet gold accents", ar: "كحلي عميق ولمسات ذهبية هادئة" },
    swatches: ["#f1f3f8", "#202a3c", "#d7bc7a"],
    darkPaper: "#29374d",
    darkInk: "#e3e8f3",
    preferred: "dark",
  },
  {
    id: "espresso",
    title: { en: "Espresso", ar: "إسبريسو" },
    description: { en: "Warm coffee, cream and copper", ar: "درجات القهوة الدافئة والكريمي والنحاسي" },
    swatches: ["#f5f0ea", "#2b2320", "#d7b394"],
    darkPaper: "#372d28",
    darkInk: "#efe5d9",
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
