import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight, Menu, Pin, PinOff, X } from "lucide-react";
import { advanceHeaderScroll, initialHeaderScroll } from "./header-scroll";
import { useStudyChrome } from "../../app/providers/StudyChromeProvider";
import { useStudyCopy } from "../../features/courses/study-copy";

const pinKey = "medclub:navigation:pinned:v1";
export const isCourseRoute = (path: string) =>
  /^\/(?:learn\/courses|my\/learning)\/[^/]+\/?$/.test(path);
export const hasSectionNavigation = (path: string) =>
  isCourseRoute(path) ||
  /^\/(?:community|journal|mentorship|contribute|store|recruitment|events|opportunities|get-involved)(?:\/|$)/.test(
    path,
  );

export function useAdaptiveNavigation() {
  const { pathname } = useLocation();
  const { focus, studying, setCourseNavigationVisible } = useStudyChrome();
  const enabled = true;
  const automatic = true;
  const secondary = hasSectionNavigation(pathname);
  const [pinned, setPinned] = useState(() => {
    try {
      return localStorage.getItem(pinKey) === "true";
    } catch {
      return false;
    }
  });
  const [hidden, setHidden] = useState(studying);
  const [manualHidden, setManualHidden] = useState(false);
  const manual = useRef(false);
  const suppressHandleFocus = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hovering = useRef(false);
  const config = useRef({ enabled, pinned, focus, hidden, studying });
  config.current = { enabled, pinned, focus, hidden, studying };
  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const locked = useCallback(
    () =>
      hovering.current ||
      !!root.current?.contains(document.activeElement) ||
      !!document.querySelector('dialog[open], [role="dialog"], [role="menu"]'),
    [],
  );
  const reveal = useCallback(
    (_intentional = false) => {
      if (config.current.focus || config.current.studying) return;
      cancel();
      setHidden(false);
    },
    [cancel],
  );
  const retreat = useCallback(() => {
    const state = config.current;
    if (
      state.enabled &&
      (manual.current || state.studying || !state.pinned || state.focus) &&
      !locked()
    ) {
      setHidden(true);
      if (state.studying) setCourseNavigationVisible(false);
    }
  }, [locked, setCourseNavigationVisible]);
  const leave = useCallback(() => {
    hovering.current = false;
    cancel();
    if (
      manual.current ||
      focus ||
      studying ||
      (!studying && (secondary || window.scrollY > 80))
    )
      timer.current = setTimeout(retreat, 650);
  }, [cancel, focus, retreat, secondary, studying]);
  // Course entry removes campus chrome completely, even when pinned elsewhere.
  useEffect(() => {
    if (!studying) return;
    cancel();
    manual.current = false;
    setManualHidden(false);
    setHidden(true);
    setCourseNavigationVisible(false);
    hovering.current = false;
    return cancel;
  }, [pathname, studying, focus, cancel, setCourseNavigationVisible]);
  useEffect(() => {
    if (studying) return;
    if (!manual.current) reveal();
    hovering.current = false;
    if (automatic && (secondary || focus) && (!pinned || focus))
      timer.current = setTimeout(retreat, focus ? 120 : 1100);
    return cancel;
  }, [
    pathname,
    automatic,
    secondary,
    pinned,
    focus,
    studying,
    reveal,
    retreat,
    cancel,
  ]);
  useEffect(() => {
    if (!automatic || studying) return;
    let scrollState = initialHeaderScroll(window.scrollY);
    let frame = 0;
    const scroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const next = Math.max(0, window.scrollY);
        if (manual.current) {
          scrollState = initialHeaderScroll(next);
          return;
        }
        scrollState.hidden = config.current.hidden;
        const wasHidden = scrollState.hidden;
        scrollState = advanceHeaderScroll(
          scrollState,
          next,
          locked() || config.current.pinned,
        );
        if (scrollState.hidden && !wasHidden) retreat();
        else if (!scrollState.hidden && (wasHidden || next <= 20)) reveal();
      });
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
    };
  }, [automatic, studying, reveal, retreat, locked]);
  useEffect(() => {
    const storage = (event: StorageEvent) => {
      if (event.key === pinKey) setPinned(event.newValue === "true");
    };
    window.addEventListener("storage", storage);
    return () => window.removeEventListener("storage", storage);
  }, []);
  const togglePin = () => {
    const value = !pinned;
    setPinned(value);
    try {
      localStorage.setItem(pinKey, String(value));
    } catch {}
    if (value) {
      manual.current = false;
      setManualHidden(false);
      reveal();
    }
  };
  return {
    enabled,
    secondary,
    manualHidden,
    suppressHandleFocus,
    focus,
    studying,
    hidden: enabled && (focus || studying || hidden),
    pinned,
    root,
    handle,
    reveal,
    leave,
    hovering,
    togglePin,
    hide: () => {
      cancel();
      setPinned(false);
      try {
        localStorage.setItem(pinKey, "false");
      } catch {
        /* Session-only preference. */
      }
      manual.current = true;
      setManualHidden(true);
      hovering.current = false;
      setHidden(true);
      if (studying) setCourseNavigationVisible(false);
      requestAnimationFrame(() => {
        suppressHandleFocus.current = true;
        handle.current?.focus({ preventScroll: true });
        suppressHandleFocus.current = false;
      });
    },
  };
}

const NavigationContext = createContext<ReturnType<
  typeof useAdaptiveNavigation
> | null>(null);

export function NavigationControls() {
  const state = useContext(NavigationContext);
  const s = useStudyCopy();
  if (!state) return null;
  return (
    <div className="navigation-reveal-actions">
      <button
        type="button"
        aria-pressed={state.pinned}
        aria-label={s(state.pinned ? "unpin" : "pin")}
        title={s(state.pinned ? "unpin" : "pin")}
        onClick={state.togglePin}
      >
        {state.pinned ? <PinOff size={17} /> : <Pin size={17} />}
      </button>
      <button
        type="button"
        aria-label={s("collapse")}
        title={s("collapse")}
        onClick={state.hide}
      >
        <X size={17} />
      </button>
    </div>
  );
}

export function AdaptiveNavigation({
  children,
  state,
  personal = false,
}: {
  children: ReactNode;
  state: ReturnType<typeof useAdaptiveNavigation>;
  personal?: boolean;
}) {
  const s = useStudyCopy();
  const id = useId();
  if (state.studying) return null;
  if (!state.enabled) return <>{children}</>;
  return (
    <NavigationContext.Provider value={state}>
      {!state.focus && (
        <div
          className="adaptive-navigation-controls"
          data-open={!state.hidden}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") state.reveal(true);
          }}
        >
          <button
            ref={state.handle}
            type="button"
            className="navigation-glance"
            aria-label={s(personal ? "personalMenu" : "menu")}
            aria-expanded={!state.hidden}
            aria-controls={id}
            onClick={() => state.reveal(true)}
            onFocus={() => {
              if (state.hidden && !state.suppressHandleFocus.current)
                state.reveal(true);
            }}
          >
            <svg
              className="navigation-edge-contour"
              viewBox="0 0 12 420"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 0H2V26C2 48 10 48 10 72V348C10 372 2 372 2 394V420H0Z" />
            </svg>
            <Menu size={17} aria-hidden="true" />
            <span>{s(personal ? "personalMenu" : "menu")}</span>
            <ChevronRight
              size={14}
              className="directional"
              aria-hidden="true"
            />
          </button>
        </div>
      )}
      <div
        hidden={state.focus || undefined}
        id={id}
        ref={state.root}
        className="adaptive-navigation-panel"
        inert={state.hidden || undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            state.hovering.current = true;
            state.reveal();
          }
        }}
        onPointerLeave={state.leave}
        onFocusCapture={() => state.reveal()}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) state.leave();
        }}
      >
        {children}
      </div>
    </NavigationContext.Provider>
  );
}
