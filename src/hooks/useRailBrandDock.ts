import { useLayoutEffect, type RefObject } from "react";

/** Dock once on leaving the page top; release only on reaching the top again. */
export function useRailBrandDock(
  ref: RefObject<HTMLAnchorElement | null>,
  enabled: boolean,
) {
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const desktop = matchMedia("(min-width: 768px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let docked = false,
      frame = 0;
    let settling: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      clearTimeout(settling);
      delete node.dataset.brandMotion;
    };
    const setDocked = (next: boolean, animate = true) => {
      if (next === docked) return;
      docked = next;
      node.toggleAttribute("data-brand-docked", next);
      finish();
      if (animate && !reduced.matches && !document.hidden) {
        node.dataset.brandMotion = next ? "catch" : "release";
        settling = setTimeout(finish, 850);
      }
    };
    const sync = () => {
      finish();
      setDocked(enabled && desktop.matches && window.scrollY > 4, false);
    };
    const update = () => {
      frame = 0;
      const next = Math.max(0, window.scrollY);
      if (!enabled || !desktop.matches || document.hidden) return;
      // A small dead band ignores elastic overscroll and trackpad noise at the top.
      if (next <= 4) setDocked(false);
      else if (next > 32) setDocked(true);
    };
    const scroll = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(update);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      sync();
    };
    sync();
    window.addEventListener("scroll", scroll, { passive: true });
    desktop.addEventListener("change", sync);
    reduced.addEventListener("change", finish);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("scroll", scroll);
      desktop.removeEventListener("change", sync);
      reduced.removeEventListener("change", finish);
      document.removeEventListener("visibilitychange", visibility);
      cancelAnimationFrame(frame);
      finish();
      node.removeAttribute("data-brand-docked");
    };
  }, [ref, enabled]);
}
