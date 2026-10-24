import { useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { RouteJourneyContext } from "../../app/router/RouteJourney";
import { advanceHeaderScroll, initialHeaderScroll } from "./header-scroll";
import { useStudyChrome } from "../../app/providers/StudyChromeProvider";
import { NotebookFittings } from "./NotebookFittings";

/** Only the header leaf transforms. The sidebar and page remain fixed to their own geometry. */
export function ScrollHeader({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLElement>(null),
    hover = useRef(false);
  const { pathname } = useLocation();
  const { studying } = useStudyChrome();
  const { phase } = useContext(RouteJourneyContext);
  const { searchOpen, detail } = useOverlays();
  const [otherOverlay, setOtherOverlay] = useState(false);
  const [requestedHidden, setHidden] = useState(false);
  const state = useRef(initialHeaderScroll());
  const held = searchOpen || !!detail || otherOverlay;
  const config = useRef({ held, phase });
  config.current = { held, phase };
  useEffect(() => {
    const sync = () =>
      setOtherOverlay(
        !!document.querySelector(
          'dialog[open], [role="dialog"], [role="menu"]',
        ),
      );
    const observer = new MutationObserver(sync);
    sync();
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["open", "data-state"],
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    state.current = initialHeaderScroll(window.scrollY);
    setHidden(false);
  }, [pathname]);
  useEffect(() => {
    if (held || phase !== "idle") {
      state.current = initialHeaderScroll(window.scrollY);
      setHidden(false);
    }
  }, [held, phase]);
  useEffect(() => {
    state.current = initialHeaderScroll(window.scrollY);
    let frame = 0;
    const scroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const locked =
          config.current.held ||
          config.current.phase !== "idle" ||
          hover.current ||
          !!root.current?.contains(document.activeElement);
        state.current = advanceHeaderScroll(
          state.current,
          window.scrollY,
          locked,
        );
        setHidden(state.current.hidden);
      });
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        state.current = initialHeaderScroll(window.scrollY);
        setHidden(false);
      }
    };
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("keydown", keyboard);
    return () => {
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("keydown", keyboard);
      cancelAnimationFrame(frame);
    };
  }, []);
  const hidden = studying || (requestedHidden && !held && phase === "idle");
  return (
    <header
      ref={root}
      className={`${className} scroll-header`}
      data-header-hidden={hidden || undefined}
      data-header-held={held || phase !== "idle" || undefined}
      inert={hidden || undefined}
      aria-hidden={hidden || undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") hover.current = true;
      }}
      onPointerLeave={() => {
        hover.current = false;
      }}
      onFocusCapture={() => {
        state.current = initialHeaderScroll(window.scrollY);
        setHidden(false);
      }}
    >
      <NotebookFittings axis="header" />
      {children}
    </header>
  );
}
