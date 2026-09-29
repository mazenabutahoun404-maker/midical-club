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

export function useAdaptiveNavigation(personal = false) {
  const { pathname } = useLocation();
  const { focus } = useStudyChrome();
  const enabled = true;
  const automatic = !personal || isCourseRoute(pathname);
  const secondary = hasSectionNavigation(pathname);
  const [pinned, setPinned] = useState(() => {
    try {
      return localStorage.getItem(pinKey) === "true";
    } catch {
      return false;
    }
  });
  const [hidden, setHidden] = useState(false);
  const [manualHidden, setManualHidden] = useState(false);
  const manual = useRef(false);
  const suppressHandleFocus = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hovering = useRef(false);
  const config = useRef({ enabled, pinned, focus });
  config.current = { enabled, pinned, focus };
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
  const reveal = useCallback(() => {
    cancel();
    setHidden(false);
  }, [cancel]);
  const retreat = useCallback(() => {
    const state = config.current;
    if (
      state.enabled &&
      (manual.current || !state.pinned || state.focus) &&
      !locked()
    )
      setHidden(true);
  }, [locked]);
  const leave = useCallback(() => {
    hovering.current = false;
    cancel();
    if (manual.current || secondary || focus || window.scrollY > 80)
      timer.current = setTimeout(retreat, 650);
  }, [cancel, focus, retreat, secondary]);
  useEffect(() => {
    if (!manual.current) reveal();
    hovering.current = false;
    if (automatic && (secondary || focus) && (!pinned || focus))
      timer.current = setTimeout(retreat, focus ? 120 : 1100);
    return cancel;
  }, [pathname, automatic, secondary, pinned, focus, reveal, retreat, cancel]);
  useEffect(() => {
    if (!automatic) return;
    let previous = window.scrollY,
      total = 0,
      direction = 0,
      frame = 0;
    const scroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const next = Math.max(0, window.scrollY),
          delta = next - previous;
        previous = next;
        if (manual.current || Math.abs(delta) < 2) return;
        const sign = Math.sign(delta);
        total = direction === sign ? total + Math.abs(delta) : Math.abs(delta);
        direction = sign;
        if (next <= 12 && !config.current.focus) {
          reveal();
          total = 0;
        } else if (sign > 0 && total >= 48) {
          retreat();
          total = 0;
        } else if (sign < 0 && total >= 24) {
          reveal();
          total = 0;
        }
      });
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(frame);
    };
  }, [automatic, reveal, retreat]);
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
    hidden: enabled && hidden,
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
  if (!state.enabled) return <>{children}</>;
  return (
    <NavigationContext.Provider value={state}>
      <div
        className="adaptive-navigation-controls"
        data-open={!state.hidden}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") state.reveal();
        }}
      >
        <button
          ref={state.handle}
          type="button"
          className="navigation-glance"
          aria-label={s(personal ? "personalMenu" : "menu")}
          aria-expanded={!state.hidden}
          aria-controls={id}
          onClick={state.reveal}
          onFocus={() => {
            if (state.hidden && !state.suppressHandleFocus.current)
              state.reveal();
          }}
        >
          <Menu size={17} aria-hidden="true" />
          <span>{s(personal ? "personalMenu" : "menu")}</span>
          <ChevronRight size={14} className="directional" aria-hidden="true" />
        </button>
      </div>
      <div
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
        onFocusCapture={state.reveal}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) state.leave();
        }}
      >
        {children}
      </div>
    </NavigationContext.Provider>
  );
}
