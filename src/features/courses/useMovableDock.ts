import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type KeyboardEvent,
  type FocusEvent,
  type MouseEvent,
} from "react";

export type DockEdge = "left" | "right" | "top" | "bottom";
type Point = { x: number; y: number };
type Size = { width: number; height: number };
const edges: DockEdge[] = ["left", "right", "top", "bottom"];

export function clampDock(point: Point, viewport: Size, size: Size) {
  return {
    x: Math.max(0, Math.min(Math.max(0, viewport.width - size.width), point.x)),
    y: Math.max(
      0,
      Math.min(Math.max(0, viewport.height - size.height), point.y),
    ),
  };
}

/** Only a deliberate move to an edge docks the tools; initial placement does not. */
export function nearestDockEdge(
  point: Point,
  viewport: Size,
  size: Size,
): DockEdge | null {
  const distances = [
    point.x,
    viewport.width - size.width - point.x,
    point.y,
    viewport.height - size.height - point.y,
  ].map((value) => Math.max(0, value));
  const nearest = Math.min(...distances);
  return nearest <= 5 ? edges[distances.indexOf(nearest)] : null;
}

export function useMovableDock(
  storageKey: string,
  avoidCampusNavigation = false,
  keepOpen = false,
) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLButtonElement>(null);
  const key = storageKey + ":dock:v1";
  const [point, setPoint] = useState<Point>({
    x: 12,
    y: Math.max(8, window.innerHeight - 64),
  });
  const [dragging, setDragging] = useState(false);
  const [edge, setEdge] = useState<DockEdge | null>(null);
  const edgeRef = useRef<DockEdge | null>(null);
  const [peeking, setPeeking] = useState(false);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const frame = useRef<number | null>(null);
  const queued = useRef<Point | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const hovering = useRef(false);
  const panelOpen = useRef(keepOpen);
  panelOpen.current = keepOpen;
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    origin: Point;
    edge: DockEdge | null;
    fromHandle: boolean;
    moved: boolean;
  } | null>(null);
  const current = useRef(point);
  const ignoreHandleClick = useRef(false);
  const dimensions = (): Size => ({
    width: root.current?.offsetWidth || 218,
    height: root.current?.offsetHeight || 48,
  });
  const bounds = () => {
    const width = window.visualViewport?.width || window.innerWidth;
    const height = window.visualViewport?.height || window.innerHeight;
    const phoneNav =
      avoidCampusNavigation && width < 768
        ? document
            .querySelector<HTMLElement>(".phone-navigation")
            ?.getBoundingClientRect()
        : undefined;
    const reserved =
      avoidCampusNavigation && width < 768
        ? phoneNav?.height
          ? Math.max(0, height - phoneNav.top) + 8
          : 86
        : 0;
    return { width, height: Math.max(120, height - reserved) };
  };
  function move(next: Point, persist = false) {
    const view = bounds(),
      size = dimensions();
    current.current = clampDock(next, view, size);
    setPoint(current.current);
    if (persist) {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            x: current.current.x / Math.max(1, view.width - size.width),
            y: current.current.y / Math.max(1, view.height - size.height),
            edge: edgeRef.current,
          }),
        );
      } catch {
        /* Moving works without storage. */
      }
    }
  }
  function setDockEdge(next: DockEdge | null) {
    edgeRef.current = next;
    setEdge(next);
  }
  function snap(next: DockEdge | null, persist: boolean) {
    const view = bounds(),
      size = dimensions();
    const target = { ...current.current };
    if (next === "left") target.x = 0;
    if (next === "right") target.x = view.width - size.width;
    if (next === "top") target.y = 0;
    if (next === "bottom") target.y = view.height - size.height;
    setDockEdge(next);
    move(target, persist);
  }
  function reveal() {
    clearTimeout(hideTimer.current);
    setPeeking(true);
  }
  function scheduleHide() {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      const focused =
        root.current?.contains(document.activeElement) &&
        document.activeElement?.matches(":focus-visible");
      if (
        !hovering.current &&
        !gesture.current &&
        !panelOpen.current &&
        !focused
      )
        setPeeking(false);
    }, 260);
  }
  function reset() {
    clearTimeout(hideTimer.current);
    setDockEdge(null);
    setPeeking(false);
    const view = bounds(),
      size = dimensions();
    move(
      { x: (view.width - size.width) / 2, y: view.height - size.height - 14 },
      true,
    );
  }
  useLayoutEffect(() => {
    const restore = () => {
      const view = bounds(),
        size = dimensions();
      setViewport(view);
      let saved: { x?: unknown; y?: unknown; edge?: unknown } | null = null;
      try {
        saved = JSON.parse(localStorage.getItem(key) || "null");
      } catch {}
      const valid =
        saved &&
        typeof saved.x === "number" &&
        Number.isFinite(saved.x) &&
        typeof saved.y === "number" &&
        Number.isFinite(saved.y);
      move(
        valid
          ? {
              x: Number(saved!.x) * (view.width - size.width),
              y: Number(saved!.y) * (view.height - size.height),
            }
          : {
              x: (view.width - size.width) / 2,
              y: view.height - size.height - 14,
            },
      );
      const savedEdge =
        valid && edges.includes(saved!.edge as DockEdge)
          ? (saved!.edge as DockEdge)
          : null;
      snap(savedEdge, false);
      setPeeking(false);
    };
    restore();
    window.addEventListener("resize", restore);
    window.visualViewport?.addEventListener("resize", restore);
    return () => {
      clearTimeout(hideTimer.current);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      window.removeEventListener("resize", restore);
      window.visualViewport?.removeEventListener("resize", restore);
    };
  }, [key, avoidCampusNavigation]);

  const dragGrip = {
    onPointerDown(event: PointerEvent<HTMLButtonElement>) {
      if (!event.isPrimary || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      clearTimeout(hideTimer.current);
      ignoreHandleClick.current = false;
      // Keep the edge handle mounted throughout pointer capture. Clearing the
      // edge here would remove the element while the user was holding it.
      gesture.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        origin: current.current,
        edge: edgeRef.current,
        fromHandle: event.currentTarget === handle.current,
        moved: false,
      };
      setDragging(true);
      reveal();
    },
    onPointerMove(event: PointerEvent<HTMLButtonElement>) {
      const start = gesture.current;
      if (!start || event.pointerId !== start.id) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5)
        start.moved = true;
      queued.current = {
        x: start.origin.x + event.clientX - start.x,
        y: start.origin.y + event.clientY - start.y,
      };
      if (frame.current === null)
        frame.current = requestAnimationFrame(() => {
          frame.current = null;
          if (queued.current) move(queued.current);
          queued.current = null;
        });
    },
    onPointerUp(event: PointerEvent<HTMLButtonElement>) {
      const start = gesture.current;
      if (!start || start.id !== event.pointerId) return;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      if (queued.current) move(queued.current);
      queued.current = null;
      gesture.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDragging(false);
      if (start.fromHandle && !start.moved) {
        reveal();
        return;
      }
      const nextEdge = nearestDockEdge(current.current, bounds(), dimensions());
      snap(nextEdge, true);
      ignoreHandleClick.current = start.fromHandle && start.moved;
      setPeeking(false);
      if (
        nextEdge &&
        !panelOpen.current &&
        root.current?.contains(document.activeElement)
      ) {
        requestAnimationFrame(() => {
          handle.current?.focus({ preventScroll: true });
          setPeeking(false);
        });
      } else if (!nextEdge && start.fromHandle) {
        requestAnimationFrame(() =>
          root.current
            ?.querySelector<HTMLButtonElement>(".study-tool-grip")
            ?.focus({ preventScroll: true }),
        );
      }
    },
    onPointerCancel() {
      const start = gesture.current;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      queued.current = null;
      gesture.current = null;
      setDragging(false);
      if (start) {
        move(start.origin);
        snap(start.edge, true);
      }
      setPeeking(false);
    },
    onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
      const delta = event.shiftKey ? 40 : 10;
      const offsets: Record<string, [number, number]> = {
        ArrowLeft: [-delta, 0],
        ArrowRight: [delta, 0],
        ArrowUp: [0, -delta],
        ArrowDown: [0, delta],
      };
      const offset = offsets[event.key];
      if (offset) {
        event.preventDefault();
        move({
          x: current.current.x + offset[0],
          y: current.current.y + offset[1],
        });
        // Snapping on keyup lets held arrow keys leave the edge, rather than
        // repeatedly snapping every small movement back to the same point.
        reveal();
      }
      if (event.key === "Home") {
        event.preventDefault();
        const fromHandle = event.currentTarget === handle.current;
        reset();
        if (fromHandle)
          requestAnimationFrame(() =>
            root.current
              ?.querySelector<HTMLButtonElement>(".study-tool-grip")
              ?.focus({ preventScroll: true }),
          );
      }
    },
    onKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
      if (!event.key.startsWith("Arrow")) return;
      event.preventDefault();
      const fromHandle = event.currentTarget === handle.current;
      const nextEdge = nearestDockEdge(current.current, bounds(), dimensions());
      snap(nextEdge, true);
      reveal();
      if (fromHandle && !nextEdge)
        requestAnimationFrame(() =>
          root.current
            ?.querySelector<HTMLButtonElement>(".study-tool-grip")
            ?.focus({ preventScroll: true }),
        );
    },
    onDoubleClick: reset,
  };
  const tucked = !!edge && !peeking && !dragging && !keepOpen;
  return {
    root,
    handle,
    dragging,
    edge,
    tucked,
    reset,
    surface: {
      onPointerEnter(event: PointerEvent<HTMLDivElement>) {
        if (event.pointerType !== "touch") {
          hovering.current = true;
          reveal();
        }
      },
      onPointerLeave(event: PointerEvent<HTMLDivElement>) {
        if (event.pointerType !== "touch") {
          hovering.current = false;
          scheduleHide();
        }
      },
      onFocusCapture: reveal,
      onBlurCapture(event: FocusEvent<HTMLDivElement>) {
        if (!event.currentTarget.contains(event.relatedTarget)) scheduleHide();
      },
      onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape" && edge && !keepOpen) {
          event.preventDefault();
          event.stopPropagation();
          handle.current?.focus({ preventScroll: true });
          setPeeking(false);
        }
      },
    },
    handleAction: (event: MouseEvent<HTMLButtonElement>) => {
      // Native clicks following a captured drag must not reopen a just-docked bar.
      if (ignoreHandleClick.current && event.detail > 0) {
        ignoreHandleClick.current = false;
        return;
      }
      ignoreHandleClick.current = false;
      reveal();
      requestAnimationFrame(() =>
        root.current
          ?.querySelector<HTMLButtonElement>(".study-tool-strip button")
          ?.focus({ preventScroll: true }),
      );
    },
    style: {
      left: point.x,
      top: point.y,
      "--dock-viewport-height": viewport.height + "px",
    } as CSSProperties,
    panelStyle: {
      ...(point.y > viewport.height / 2
        ? { bottom: "calc(100% + 10px)", top: "auto" }
        : { top: "calc(100% + 10px)", bottom: "auto" }),
      left:
        Math.max(
          8,
          Math.min(
            viewport.width - Math.min(380, viewport.width - 16) - 8,
            point.x,
          ),
        ) - point.x,
      right: "auto",
      maxWidth: viewport.width - 16,
      maxHeight: Math.max(
        80,
        point.y > viewport.height / 2
          ? point.y - 18
          : viewport.height - point.y - dimensions().height - 18,
      ),
    } as CSSProperties,
    grip: dragGrip,
    handleGrip: {
      ...dragGrip,
      onDoubleClick: undefined,
      onPointerEnter(event: PointerEvent<HTMLButtonElement>) {
        if (event.pointerType !== "touch" && !gesture.current) {
          hovering.current = true;
          reveal();
        }
      },
    },
  };
}
