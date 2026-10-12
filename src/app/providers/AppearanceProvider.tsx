import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  getAppearancePalette,
  isAppearancePalette,
  type AppearancePalette,
} from "./appearance-palettes";
import { findAppearanceChoice } from "./appearance-choices";
import { STORAGE_KEYS } from "../../constants/config";
import { captureThemeColors, fadeThemeColors } from "./theme-color-fade";
export type ColorMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type NavigationLayout = "vertical" | "horizontal";
interface AppearancePreferences {
  navigation: NavigationLayout;
  sidebarCollapsed: boolean;
  colorMode: ColorMode;
  palette: AppearancePalette;
}
const DEFAULTS: AppearancePreferences = {
  navigation: "vertical",
  sidebarCollapsed: false,
  colorMode: "system",
  palette: "medclub",
};
const isColorMode = (value: unknown): value is ColorMode =>
  value === "light" || value === "dark" || value === "system";
const isLayout = (value: unknown): value is NavigationLayout =>
  value === "vertical" || value === "horizontal";
function readPreferences(): AppearancePreferences {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.appearance) || "null",
    );
    if (
      value &&
      typeof value === "object" &&
      "navigation" in value &&
      isLayout(value.navigation)
    )
      return {
        navigation: value.navigation,
        palette:
          "palette" in value && isAppearancePalette(value.palette)
            ? value.palette
            : "medclub",
        colorMode:
          "colorMode" in value && isColorMode(value.colorMode)
            ? value.colorMode
            : "system",
        sidebarCollapsed:
          "sidebarCollapsed" in value && value.sidebarCollapsed === true,
      };
  } catch {
    /* Old, invalid or unavailable preferences use safe defaults. */
  }
  return DEFAULTS;
}
interface AppearanceContext extends AppearancePreferences {
  setNavigation: (layout: NavigationLayout) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  persisted: boolean;
  resolvedTheme: ResolvedTheme;
  setColorMode: (mode: ColorMode) => void;
  setPalette: (palette: AppearancePalette) => void;
  setThemeChoice: (id: string) => void;
}
const Context = createContext<AppearanceContext | null>(null);
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [persisted, setPersisted] = useState(true);
  const lastTheme = useRef<string | null>(null);
  const themeAnimations = useRef<Animation[]>([]);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const resolvedTheme: ResolvedTheme =
    preferences.colorMode === "system"
      ? systemDark
        ? "dark"
        : "light"
      : preferences.colorMode;
  useLayoutEffect(() => {
    const signature = `${preferences.palette}:${resolvedTheme}`;
    const changed = lastTheme.current !== null && lastTheme.current !== signature;
    const snapshots = changed && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? captureThemeColors(document.documentElement)
      : [];
    themeAnimations.current.forEach((animation) => animation.cancel());
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.palette = preferences.palette;
    document.documentElement.style.colorScheme = resolvedTheme;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    lastTheme.current = signature;
    themeAnimations.current = fadeThemeColors(snapshots);
  }, [resolvedTheme, preferences.palette]);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      if (reduced.matches) themeAnimations.current.forEach((animation) => animation.cancel());
    };
    reduced.addEventListener("change", stop);
    return () => {
      reduced.removeEventListener("change", stop);
      themeAnimations.current.forEach((animation) => animation.cancel());
    };
  }, []);
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setSystemDark(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.appearance || event.key === null)
        setPreferences(readPreferences());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const value = useMemo(() => {
    function update(change: Partial<AppearancePreferences>) {
      const next = { ...preferences, ...change };
      setPreferences(next);
      try {
        localStorage.setItem(STORAGE_KEYS.appearance, JSON.stringify(next));
        setPersisted(true);
      } catch {
        setPersisted(false);
      }
    }
    return {
      ...preferences,
      persisted,
      resolvedTheme,
      setThemeChoice: (id: string) => {
        const choice = findAppearanceChoice(id);
        if (choice) update({ palette: choice.palette, colorMode: choice.mode });
      },
      setPalette: (palette: AppearancePalette) => {
        if (isAppearancePalette(palette)) {
          const preferred = getAppearancePalette(palette).preferred;
          update({ palette, ...(preferred ? { colorMode: preferred } : {}) });
        }
      },
      setColorMode: (colorMode: ColorMode) => {
        if (isColorMode(colorMode)) update({ colorMode });
      },
      setNavigation: (navigation: NavigationLayout) => {
        if (isLayout(navigation)) update({ navigation });
      },
      setSidebarCollapsed: (sidebarCollapsed: boolean) =>
        update({ sidebarCollapsed }),
    };
  }, [preferences, persisted, resolvedTheme]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAppearance() {
  const value = useContext(Context);
  if (!value) throw new Error("AppearanceProvider required");
  return value;
}
