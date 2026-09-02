import { useLocation } from "react-router-dom";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DetailRecord } from "../../types/content";
interface OverlayContextValue {
  searchOpen: boolean;
  detail: DetailRecord | null;
  openSearch: () => void;
  closeSearch: () => void;
  openDetail: (record: DetailRecord) => void;
  closeDetail: () => void;
}
const Context = createContext<OverlayContextValue | null>(null);
export function OverlayProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  useEffect(() => {
    setSearch(false);
    setDetail(null);
  }, [location.pathname]);
  const [searchOpen, setSearch] = useState(false);
  const [detail, setDetail] = useState<DetailRecord | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const remember = () => {
    if (document.activeElement instanceof HTMLElement)
      returnFocus.current = document.activeElement;
  };
  const restore = () =>
    requestAnimationFrame(() => {
      if (returnFocus.current?.isConnected) returnFocus.current.focus();
    });
  function openSearch() {
    if (detail) return;
    remember();
    setSearch(true);
  }
  function closeSearch() {
    setSearch(false);
    restore();
  }
  function openDetail(record: DetailRecord) {
    if (!searchOpen) remember();
    setSearch(false);
    setDetail(record);
  }
  function closeDetail() {
    setDetail(null);
    restore();
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const editing =
        target.isContentEditable || target.matches("input,textarea,select");
      if (editing || document.querySelector('[role="dialog"]')) return;
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") ||
        e.key === "/"
      ) {
        e.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [detail]);
  return (
    <Context.Provider
      value={{
        searchOpen,
        detail,
        openSearch,
        closeSearch,
        openDetail,
        closeDetail,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useOverlays() {
  const value = useContext(Context);
  if (!value) throw new Error("OverlayProvider required");
  return value;
}
