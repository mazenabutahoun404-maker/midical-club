import { useLocation } from "react-router-dom";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import type { DetailRecord } from "../../types/content";
import { useWorkspace } from "./WorkspaceProvider";
interface OverlayContextValue {
  notesOpen: boolean;
  notesVisited: boolean;
  toggleNotes: () => void;
  hideNotes: () => void;
  searchOpen: boolean;
  detail: DetailRecord | null;
  openSearch: (event?: MouseEvent<HTMLElement>) => void;
  searchTrigger: HTMLElement | null;
  closeSearch: () => void;
  openDetail: (record: DetailRecord) => void;
  closeDetail: () => void;
}
const Context = createContext<OverlayContextValue | null>(null);
export function OverlayProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { send } = useWorkspace();
  useEffect(() => {
    setSearch(false);
    setDetail(null);
  }, [location.pathname]);
  const [searchOpen, setSearch] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesVisited, setNotesVisited] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState<HTMLElement | null>(null);
  const [detail, setDetail] = useState<DetailRecord | null>(null);
  function openSearch(event?: MouseEvent<HTMLElement>) {
    if (detail) return;
    const trigger =
      event?.currentTarget ??
      Array.from(
        document.querySelectorAll<HTMLElement>("[data-search-trigger]"),
      ).find((node) => node.getBoundingClientRect().width > 0);
    setSearchTrigger(trigger ?? null);
    setSearch(true);
  }
  function closeSearch() {
    setSearch(false);
  }
  function openDetail(record: DetailRecord) {
    if (record.kind === "resource")
      void send({ type: "view-resource", id: record.item.id });
    setSearch(false);
    setDetail(record);
  }
  function closeDetail() {
    setDetail(null);
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      const target = e.target;
      const editing =
        target instanceof HTMLElement &&
        (target.isContentEditable || target.matches("input,textarea,select"));
      if (editing || document.querySelector('dialog[open], [role="dialog"]'))
        return;
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
        notesOpen,
        notesVisited,
        toggleNotes: () => {
          setNotesVisited(true);
          setNotesOpen((open) => !open);
        },
        hideNotes: () => setNotesOpen(false),
        searchOpen,
        searchTrigger,
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
