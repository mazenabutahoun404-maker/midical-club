import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useLocale } from "./LocaleProvider";
import { STORAGE_KEYS } from "../../constants/config";
const Context = createContext<{
  saved: string[];
  toggle: (id: string) => void;
} | null>(null);
export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const { label } = useLocale();
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const result = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.saved) || "[]",
      );
      return Array.isArray(result)
        ? result.filter((id): id is string => typeof id === "string")
        : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    function sync(e: StorageEvent) {
      if (e.key !== STORAGE_KEYS.saved) return;
      try {
        const value = JSON.parse(e.newValue || "[]");
        if (Array.isArray(value))
          setSaved(value.filter((id): id is string => typeof id === "string"));
      } catch {}
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function toggle(id: string) {
    const removing = saved.includes(id);
    const next = removing ? saved.filter((v) => v !== id) : [...saved, id];
    setSaved(next);
    let stored = true;
    try {
      localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(next));
    } catch {
      stored = false;
    }
    toast(label(removing ? "removed" : "saved"), {
      description: label(stored ? "localStorage" : "sessionOnly"),
    });
  }
  return (
    <Context.Provider value={{ saved, toggle }}>{children}</Context.Provider>
  );
}
export function useSavedItems() {
  const value = useContext(Context);
  if (!value) throw new Error("SavedItemsProvider required");
  return value;
}
