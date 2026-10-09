import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  Suspense,
  type ReactNode,
} from "react";
import {
  useLocation,
  useNavigationType,
  type Location,
} from "react-router-dom";
import { LoadingState } from "../../components/feedback/LoadingState";

type Phase = "idle" | "leaving" | "waiting" | "arriving";
export function courseDeskFamily(path: string) {
  if (/^\/learn\/courses\/[^/]+\/?$/.test(path)) return "public";
  if (/^\/my\/learning\/[^/]+\/?$/.test(path)) return "personal";
  return null;
}
export const RouteJourneyContext = createContext<{
  phase: Phase;
  ready: (location: Location) => void;
}>({ phase: "idle", ready: () => {} });

/** One routed tree: fade out, commit the destination, restore while hidden, fade in. */
export function useRouteJourney(target: Location) {
  const action = useNavigationType();
  const [location, setLocation] = useState(target);
  const [phase, setPhase] = useState<Phase>("idle");
  const visible = useRef(location);
  const destination = useRef(target);
  destination.current = target;
  const currentAction = useRef(action);
  currentAction.current = action;
  const positions = useRef(new Map<string, number>());
  const moved = useRef(false);
  const deskSwitch = useRef(false);
  const completed = useRef("");
  const timers = useRef<number[]>([]);
  const frames = useRef<number[]>([]);
  const hashObserver = useRef<MutationObserver | null>(null);
  const focusAtNavigation = useRef<Element | null>(null);
  const motionOff = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
      timers.current.forEach(clearTimeout);
      frames.current.forEach(cancelAnimationFrame);
      hashObserver.current?.disconnect();
      document.documentElement.style.removeProperty("--route-hold-height");
    };
  }, []);
  useLayoutEffect(() => {
    const old = visible.current;
    if (
      old.key === target.key &&
      old.pathname === target.pathname &&
      old.hash === target.hash
    )
      return;
    timers.current.forEach(clearTimeout);
    frames.current.forEach(cancelAnimationFrame);
    hashObserver.current?.disconnect();
    timers.current = [];
    frames.current = [];
    // Only the keyed reader turns over between courses in the same desk.
    // The surrounding shelf never fades, scrolls to the top or becomes inert.
    if (
      old.pathname !== target.pathname &&
      courseDeskFamily(old.pathname) &&
      courseDeskFamily(old.pathname) === courseDeskFamily(target.pathname)
    ) {
      deskSwitch.current = true;
      moved.current = false;
      visible.current = target;
      setLocation(target);
      setPhase("idle");
      document.documentElement.style.removeProperty("--route-hold-height");
      return;
    }
    deskSwitch.current = false;
    if (old.pathname === target.pathname) {
      visible.current = target;
      setLocation(target);
      setPhase("idle");
      return; // Filters and notebook section switches never reset the document.
    }
    positions.current.set(`entry:${old.key}`, window.scrollY);
    positions.current.set(`path:${old.pathname}`, window.scrollY);
    while (positions.current.size > 120)
      positions.current.delete(positions.current.keys().next().value!);
    moved.current = true;
    focusAtNavigation.current = document.activeElement;
    const main = document.getElementById("main");
    if (document.activeElement?.closest(".route-viewport, .route-footer")) {
      main?.focus({ preventScroll: true });
      focusAtNavigation.current = document.activeElement;
    }
    document.documentElement.style.setProperty(
      "--route-hold-height",
      `${Math.max(320, main?.offsetHeight ?? 0)}px`,
    );
    setPhase("leaving");
    const commit = () => {
      visible.current = target;
      setLocation(target);
      setPhase("waiting");
    };
    if (motionOff()) commit();
    else timers.current.push(window.setTimeout(commit, 140));
  }, [target]);
  const ready = useCallback((arrived: Location) => {
    if (
      arrived.key !== destination.current.key ||
      arrived.pathname !== destination.current.pathname ||
      completed.current === `${arrived.key}:${arrived.hash}`
    )
      return;
    completed.current = `${arrived.key}:${arrived.hash}`;
    if (deskSwitch.current) {
      deskSwitch.current = false;
      setPhase("idle");
      return;
    }
    const root = document.documentElement;
    root.style.removeProperty("--route-hold-height");
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    if (arrived.hash) {
      let id = arrived.hash.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {
        /* Keep malformed fragment literal. */
      }
      const revealHash = () => {
        const element = document.getElementById(id);
        if (!element || arrived.key !== destination.current.key) return false;
        element.scrollIntoView({ behavior: "instant" });
        hashObserver.current?.disconnect();
        return true;
      };
      if (!revealHash()) {
        hashObserver.current = new MutationObserver(revealHash);
        hashObserver.current.observe(
          document.getElementById("main") ?? document.body,
          { childList: true, subtree: true },
        );
      }
    } else if (moved.current) {
      const key =
        currentAction.current === "POP"
          ? `entry:${arrived.key}`
          : `path:${arrived.pathname}`;
      const top =
        positions.current.get(key) ??
        positions.current.get(`path:${arrived.pathname}`) ??
        0;
      window.scrollTo({ top, behavior: "instant" });
    }
    root.style.scrollBehavior = previousBehavior;
    if (
      moved.current &&
      !document.querySelector('dialog[open], [role="dialog"], [role="menu"]') &&
      (document.activeElement === focusAtNavigation.current ||
        document.activeElement === document.body)
    )
      document.getElementById("main")?.focus({ preventScroll: true });
    moved.current = false;
    frames.current.push(
      requestAnimationFrame(() => {
        if (arrived.key !== destination.current.key) return;
        setPhase(motionOff() ? "idle" : "arriving");
        timers.current.push(
          window.setTimeout(() => setPhase("idle"), motionOff() ? 0 : 240),
        );
      }),
    );
  }, []);
  return { location, phase, ready };
}

function Arrival({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { ready } = useContext(RouteJourneyContext);
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = content.current;
    if (!node) return;
    const complete = () => {
      if (node.querySelector("[data-route-loading]")) return false;
      ready(location);
      return true;
    };
    if (complete()) return;
    // Query-driven screens can still be loading after their lazy module resolves.
    const observer = new MutationObserver(() => {
      if (complete()) observer.disconnect();
    });
    observer.observe(node, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location, ready]);
  return (
    <div className="route-page-content" ref={content}>
      {children}
    </div>
  );
}
export function RouteViewport({ children }: { children: ReactNode }) {
  const { phase } = useContext(RouteJourneyContext);
  return (
    <div
      className="route-viewport"
      data-route-phase={phase}
      aria-busy={phase === "leaving" || phase === "waiting"}
      aria-hidden={phase === "leaving" || undefined}
      inert={phase === "leaving" || undefined}
    >
      <Suspense fallback={<LoadingState />}>
        <Arrival>{children}</Arrival>
      </Suspense>
    </div>
  );
}

/** Hide outgoing footer destinations from focus/navigation during the short exit. */
export function RouteFooter({ children }: { children: ReactNode }) {
  const { phase } = useContext(RouteJourneyContext);
  return (
    <div
      className="route-footer"
      data-route-phase={phase}
      aria-hidden={phase === "leaving" || undefined}
      inert={phase === "leaving" || undefined}
    >
      {children}
    </div>
  );
}
