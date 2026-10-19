import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

/** Native one-finger scrolling; two fingers preview a CSS scale and commit zoom once. */
export function usePdfTouchZoom(
  viewport: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  zoom: number,
  min: number,
  max: number,
  commit: (zoom: number) => void,
) {
  const config = useRef({ zoom, min, max, commit });
  config.current = { zoom, min, max, commit };
  const pending = useRef<{
    x: number;
    y: number;
    localX: number;
    localY: number;
    reset: () => void;
  } | null>(null);
  useLayoutEffect(() => {
    const anchor = pending.current,
      element = viewport.current;
    if (!anchor || !element) return;
    pending.current = null;
    anchor.reset();
    const pages = element.querySelector<HTMLElement>(".pdf-book-pages");
    if (!pages) return;
    const box = element.getBoundingClientRect(),
      paper = pages.getBoundingClientRect();
    element.scrollLeft +=
      paper.left + anchor.x * paper.width - box.left - anchor.localX;
    element.scrollTop +=
      paper.top + anchor.y * paper.height - box.top - anchor.localY;
  }, [zoom, enabled, viewport]);
  useEffect(() => {
    const element = viewport.current;
    if (!element || !enabled) return;
    let frame = 0,
      cleanupTimer: ReturnType<typeof setTimeout> | undefined;
    let suppressUntil = 0;
    let gesture: {
      distance: number;
      startZoom: number;
      nextZoom: number;
      midX: number;
      midY: number;
      initialX: number;
      initialY: number;
      viewLeft: number;
      viewTop: number;
      originX: number;
      originY: number;
      x: number;
      y: number;
      canvas: HTMLElement;
      reset: () => void;
    } | null = null;
    const midpoint = (touches: TouchList) => ({
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
      distance: Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY,
      ),
    });
    const clearMarker = () => {
      delete element.dataset.pdfPinching;
    };
    const start = (event: TouchEvent) => {
      if (event.touches.length > 2) {
        gesture?.reset();
        gesture = null;
        cancelAnimationFrame(frame);
        frame = 0;
        clearMarker();
        return;
      }
      if (
        event.touches.length !== 2 ||
        gesture ||
        (event.target instanceof Element &&
          event.target.closest(
            "button,a,input,textarea,select,.pdf-note-sticker",
          ))
      )
        return;
      const canvas = element.querySelector<HTMLElement>(".pdf-pan-canvas"),
        pages = element.querySelector<HTMLElement>(".pdf-book-pages");
      if (!canvas || !pages) return;
      const point = midpoint(event.touches);
      if (point.distance < 1) return;
      if (event.cancelable) event.preventDefault();
      clearTimeout(cleanupTimer);
      const view = element.getBoundingClientRect(),
        content = canvas.getBoundingClientRect(),
        paper = pages.getBoundingClientRect();
      const transform = canvas.style.transform,
        origin = canvas.style.transformOrigin;
      const reset = () => {
        canvas.style.transform = transform;
        canvas.style.transformOrigin = origin;
      };
      gesture = {
        distance: point.distance,
        startZoom: config.current.zoom,
        nextZoom: config.current.zoom,
        midX: point.x,
        midY: point.y,
        initialX: point.x,
        initialY: point.y,
        viewLeft: view.left,
        viewTop: view.top,
        originX: point.x - content.left,
        originY: point.y - content.top,
        x: Math.max(
          0,
          Math.min(1, (point.x - paper.left) / Math.max(1, paper.width)),
        ),
        y: Math.max(
          0,
          Math.min(1, (point.y - paper.top) / Math.max(1, paper.height)),
        ),
        canvas,
        reset,
      };
      element.dataset.pdfPinching = "true";
      canvas.style.transformOrigin = `${gesture.originX}px ${gesture.originY}px`;
    };
    const move = (event: TouchEvent) => {
      if (!gesture || event.touches.length !== 2) return;
      if (event.cancelable) event.preventDefault();
      const point = midpoint(event.touches);
      gesture.nextZoom = Math.max(
        config.current.min,
        Math.min(
          config.current.max,
          (gesture.startZoom * point.distance) / gesture.distance,
        ),
      );
      gesture.midX = point.x;
      gesture.midY = point.y;
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (gesture)
            gesture.canvas.style.transform = `translate(${gesture.midX - gesture.initialX}px,${gesture.midY - gesture.initialY}px) scale(${gesture.nextZoom / gesture.startZoom})`;
        });
    };
    const finish = (event: TouchEvent) => {
      if (event.touches.length >= 2 && event.type !== "touchcancel") return;
      cancelAnimationFrame(frame);
      frame = 0;
      const current = gesture;
      gesture = null;
      if (current) {
        suppressUntil = performance.now() + 220;
        if (
          event.type === "touchcancel" ||
          Math.abs(current.nextZoom - current.startZoom) < 0.001
        )
          current.reset();
        else {
          pending.current = {
            x: current.x,
            y: current.y,
            localX: current.midX - current.viewLeft,
            localY: current.midY - current.viewTop,
            reset: current.reset,
          };
          config.current.commit(current.nextZoom);
        }
      }
      if (event.type === "touchcancel") clearMarker();
      else if (!event.touches.length)
        cleanupTimer = setTimeout(clearMarker, 220);
    };
    const click = (event: MouseEvent) => {
      if (performance.now() < suppressUntil || element.dataset.pdfPinching) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    element.addEventListener("touchstart", start, { passive: false });
    element.addEventListener("touchmove", move, { passive: false });
    element.addEventListener("touchend", finish);
    element.addEventListener("touchcancel", finish);
    element.addEventListener("click", click, true);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(cleanupTimer);
      gesture?.reset();
      pending.current?.reset();
      pending.current = null;
      clearMarker();
      element.removeEventListener("touchstart", start);
      element.removeEventListener("touchmove", move);
      element.removeEventListener("touchend", finish);
      element.removeEventListener("touchcancel", finish);
      element.removeEventListener("click", click, true);
    };
  }, [viewport, enabled]);
}
