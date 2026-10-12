import { useEffect, type RefObject } from "react";

/** A cached pointer-entry rect and one frame per update; no idle animation loop. */
export function useCampusMotion(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const enabled = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let rect: DOMRect | null = null;
    let frame = 0, visible = true, x = 0, y = 0;
    const paint = () => {
      frame = 0;
      element.style.setProperty("--campus-shift-x", `${x.toFixed(2)}px`);
      element.style.setProperty("--campus-shift-y", `${y.toFixed(2)}px`);
    };
    const reset = () => { cancelAnimationFrame(frame); frame = 0; rect = null; x = y = 0; paint(); };
    const enter = (event: PointerEvent) => {
      if (enabled.matches && event.pointerType === "mouse") rect = element.getBoundingClientRect();
    };
    const move = (event: PointerEvent) => {
      if (!enabled.matches || !visible || document.hidden || event.pointerType !== "mouse") return;
      rect ??= element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      x = Math.max(-4, Math.min(4, (event.clientX - rect.left) / rect.width * 8 - 4));
      y = Math.max(-3, Math.min(3, (event.clientY - rect.top) / rect.height * 6 - 3));
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const invalidate = () => { rect = null; };
    const visibility = () => { if (document.hidden) reset(); };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting; if (!visible) reset();
    });
    const size = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(invalidate);
    observer?.observe(element); size?.observe(element);
    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", reset);
    enabled.addEventListener("change", reset);
    window.addEventListener("scroll", invalidate, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame); observer?.disconnect(); size?.disconnect();
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", reset);
      enabled.removeEventListener("change", reset);
      window.removeEventListener("scroll", invalidate);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [ref]);
}
