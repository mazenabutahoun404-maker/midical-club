import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

const Context = createContext({
  focus: false,
  studying: false,
  courseNavigationVisible: false,
  setCourseNavigationVisible: (_value: boolean) => {},
  setFocus: (_value: boolean) => {},
});
export function StudyChromeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const studying = /^\/(?:learn\/courses|my\/learning)\/[^/]+\/?$/.test(
    pathname,
  );
  useLayoutEffect(() => {
    if (!studying) return;
    const previous = document.documentElement.dataset.studyRoute;
    document.documentElement.dataset.studyRoute = "true";
    return () => {
      if (previous === undefined)
        delete document.documentElement.dataset.studyRoute;
      else document.documentElement.dataset.studyRoute = previous;
    };
  }, [studying]);
  const [focusPath, setFocusPath] = useState<string | null>(null);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const focus = focusPath === pathname;
  const setCourseNavigationVisible = useCallback(
    (value: boolean) => {
      setMenuPath(value && !studying ? pathname : null);
    },
    [pathname, studying],
  );
  useEffect(() => {
    setFocusPath(null);
    setMenuPath(null);
  }, [pathname]);
  return (
    <Context.Provider
      value={{
        focus,
        studying,
        courseNavigationVisible: studying && !focus && menuPath === pathname,
        setCourseNavigationVisible,
        setFocus: (value) => {
          setFocusPath(value ? pathname : null);
          if (value) setMenuPath(null);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useStudyChrome = () => useContext(Context);
