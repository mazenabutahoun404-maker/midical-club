import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type KeyboardEvent,
} from "react";
type Point = { x: number; y: number };
export function useFloatingNotebook(owner: string, open: boolean) {
  const root = useRef<HTMLElement>(null);
  const [point, setPoint] = useState<Point>({ x: 8, y: 88 });
  const current = useRef(point),
    gesture = useRef<{
      pointer: number;
      x: number;
      y: number;
      origin: Point;
    } | null>(null);
  const frame = useRef<number | null>(null),
    pending = useRef<Point | null>(null);
  const key = "medclub.notes-panel.v1." + encodeURIComponent(owner);
  function clamp(p: Point) {
    const view = window.visualViewport;
    const width = view?.width || innerWidth,
      height = view?.height || innerHeight;
    const ox = view?.offsetLeft || 0,
      oy = view?.offsetTop || 0;
    const nav =
      innerWidth < 768
        ? document
            .querySelector<HTMLElement>(".phone-navigation")
            ?.getBoundingClientRect()
        : undefined;
    const bottom =
      nav && nav.height && nav.top < oy + height
        ? Math.max(oy + 120, nav.top - 8)
        : oy + height - 8;
    return {
      x: Math.max(
        ox + 8,
        Math.min(p.x, ox + width - (root.current?.offsetWidth || 300) - 8),
      ),
      y: Math.max(
        oy + 8,
        Math.min(p.y, bottom - (root.current?.offsetHeight || 200)),
      ),
    };
  }
  function move(p: Point, save = false) {
    const next = clamp(p);
    current.current = next;
    setPoint(previous => previous.x === next.x && previous.y === next.y ? previous : next);
    if (save)
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* Moving stays available without device storage. */
      }
  }
  useLayoutEffect(() => {
    let saved: Point | null = null;
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      if (value && Number.isFinite(value.x) && Number.isFinite(value.y))
        saved = value;
    } catch {}
    move(
      saved || {
        x: document.documentElement.dir === "rtl" ? 16 : innerWidth - 376,
        y: 96,
      },
    );
  }, [key]);
  useLayoutEffect(() => {
    if (!open) return;
    const sync = () => move(current.current);
    sync();
    const observer = new ResizeObserver(sync);
    if (root.current) observer.observe(root.current);
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      gesture.current = null;
    };
  }, [open, key]);
  const grip = {
    onPointerDown(e: PointerEvent<HTMLButtonElement>) {
      if (!e.isPrimary || e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      gesture.current = {
        pointer: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        origin: current.current,
      };
    },
    onPointerMove(e: PointerEvent<HTMLButtonElement>) {
      const g = gesture.current;
      if (!g || g.pointer !== e.pointerId) return;
      pending.current = {
        x: g.origin.x + e.clientX - g.x,
        y: g.origin.y + e.clientY - g.y,
      };
      if (frame.current === null)
        frame.current = requestAnimationFrame(() => {
          frame.current = null;
          if (pending.current) move(pending.current);
        });
    },
    onPointerUp(e: PointerEvent<HTMLButtonElement>) {
      if (gesture.current?.pointer !== e.pointerId) return;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      move(pending.current || current.current, true);
      pending.current = null;
      gesture.current = null;
    },
    onPointerCancel() {
      gesture.current = null;
      pending.current = null;
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    },
    onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
      const step = e.shiftKey ? 48 : 16;
      const delta: Record<string, Point> = {
        ArrowLeft: { x: -step, y: 0 },
        ArrowRight: { x: step, y: 0 },
        ArrowUp: { x: 0, y: -step },
        ArrowDown: { x: 0, y: step },
      };
      if (delta[e.key]) {
        e.preventDefault();
        e.stopPropagation();
        move(
          {
            x: current.current.x + delta[e.key].x,
            y: current.current.y + delta[e.key].y,
          },
          true,
        );
      } else if (e.key === "Home") {
        e.preventDefault();
        move({ x: innerWidth - 376, y: 96 }, true);
      }
    },
  };
  return {
    root,
    grip,
    reset: () =>
      move(
        {
          x: document.documentElement.dir === "rtl" ? 16 : innerWidth - 376,
          y: 96,
        },
        true,
      ),
    style: {
      left: point.x,
      top: point.y,
      maxHeight: Math.min(560, Math.max(
        160,
        (window.visualViewport?.height || innerHeight) -
          (innerWidth < 768 ? 108 : 32),
      )),
    } as CSSProperties,
  };
}
