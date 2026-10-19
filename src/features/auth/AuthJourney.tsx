import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type AuthFeedback = "idle" | "submitting" | "success" | "error";

type Journey = {
  feedback: AuthFeedback;
  setFeedback: (value: AuthFeedback) => void;
  focused: string | null;
  setFocused: (value: string | null) => void;
  progress: string[];
  finalRestoration: boolean;
  finishRestoration: () => void;
  setProgress: (value: string[]) => void;
  welcomeToken: number;
  welcoming: boolean;
  startWelcome: () => Promise<void>;
  stopWelcome: () => void;
};
const Context = createContext<Journey>({
  feedback: "idle",
  setFeedback: () => {},
  focused: null,
  setFocused: () => {},
  progress: [],
  finalRestoration: false,
  finishRestoration: () => {},
  setProgress: () => {},
  welcomeToken: 0,
  welcoming: false,
  startWelcome: async () => {},
  stopWelcome: () => {},
});
export function AuthJourneyProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<AuthFeedback>("idle");
  const [focused, setFocused] = useState<string | null>(null);
  const [finalRestoration, setFinalRestoration] = useState(false);
  const finishRestoration = useCallback(() => setFinalRestoration(true), []);
  const [progress, setProgressState] = useState<string[]>([]);
  const [welcomeToken, setWelcomeToken] = useState(0);
  const [welcoming, setWelcoming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const resolve = useRef<(() => void) | null>(null);
  const setProgress = useCallback((value: string[]) => {
    if (value.length < 6) setFinalRestoration(false);
    setProgressState((current) =>
      current.join("|") === value.join("|") ? current : value,
    );
  }, []);
  const stopWelcome = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
    setWelcoming(false);
    resolve.current?.();
    resolve.current = null;
  }, []);
  const startWelcome = useCallback(() => {
    stopWelcome();
    setFeedback("success");
    if (
      document.hidden ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return Promise.resolve();
    setWelcoming(true);
    setWelcomeToken((value) => value + 1);
    return new Promise<void>((done) => {
      resolve.current = done;
      timer.current = setTimeout(stopWelcome, 420);
    });
  }, [stopWelcome]);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      if (document.hidden || reduced.matches) stopWelcome();
    };
    document.addEventListener("visibilitychange", stop);
    reduced.addEventListener("change", stop);
    return () => {
      clearTimeout(timer.current);
      resolve.current?.();
      resolve.current = null;
      document.removeEventListener("visibilitychange", stop);
      reduced.removeEventListener("change", stop);
    };
  }, [stopWelcome]);
  return (
    <Context.Provider
      value={{
        feedback,
        setFeedback,
        focused,
        setFocused,
        progress,
        setProgress,
        finalRestoration,
        finishRestoration,
        welcomeToken,
        welcoming,
        startWelcome,
        stopWelcome,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useAuthJourney = () => useContext(Context);
