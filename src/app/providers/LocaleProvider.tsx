import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Locale, Text } from "../../types/content";
import { messages, type MessageKey } from "../../constants/messages";
import { DEFAULT_LOCALE, STORAGE_KEYS } from "../../constants/config";
interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (value: Locale) => void;
  t: (value: Text) => string;
  label: (key: MessageKey) => string;
}
const Context = createContext<LocaleContextValue | null>(null);
export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setValue] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.locale);
      return saved === "ar" || saved === "en" ? saved : initialLocale;
    } catch {
      return initialLocale;
    }
  });
  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);
  function setLocale(value: Locale) {
    setValue(value);
    try {
      localStorage.setItem(STORAGE_KEYS.locale, value);
    } catch {
      /* Language still works for this session. */
    }
  }
  const value = useMemo(
    () => ({
      locale,
      dir,
      setLocale,
      t: (text: Text) => text[locale],
      label: (key: MessageKey) => messages[locale][key],
    }),
    [locale, dir],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useLocale() {
  const value = useContext(Context);
  if (!value) throw new Error("LocaleProvider required");
  return value;
}
