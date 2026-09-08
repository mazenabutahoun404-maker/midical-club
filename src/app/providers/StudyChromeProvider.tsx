import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

const Context = createContext({
  focus: false,
  setFocus: (_value: boolean) => {},
});
export function StudyChromeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [focusPath, setFocusPath] = useState<string | null>(null);
  const focus = focusPath === pathname;
  useEffect(() => {
    setFocusPath(null);
  }, [pathname]);
  return (
    <Context.Provider
      value={{
        focus,
        setFocus: (value) => setFocusPath(value ? pathname : null),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useStudyChrome = () => useContext(Context);
