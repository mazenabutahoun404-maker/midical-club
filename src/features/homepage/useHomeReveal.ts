import { useEffect, type RefObject } from "react";

/** Content is visible by default. Observe each reveal once, including asynchronously loaded cards. */
export function useHomeReveal(
  root: RefObject<HTMLElement | null>,
  ready: boolean,
) {
  useEffect(() => {
    const element = root.current;
    if (!element || !ready || typeof IntersectionObserver === "undefined")
      return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observed = new WeakSet<Element>();
    const reveal = (target: Element) => {
      (target as HTMLElement).dataset.homeRevealed = "true";
      observer.unobserve(target);
    };
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal(entry.target);
        }),
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
    );
    const scan = () => {
      element
        .querySelectorAll<HTMLElement>("[data-home-reveal]")
        .forEach((target) => {
          if (observed.has(target)) return;
          observed.add(target);
          if (reduced.matches) target.dataset.homeRevealed = "true";
          else observer.observe(target);
        });
    };
    const sync = () => {
      element.dataset.homeMotion = reduced.matches ? "off" : "ready";
      if (reduced.matches)
        element.querySelectorAll("[data-home-reveal]").forEach(reveal);
      scan();
    };
    const focus = (event: FocusEvent) => {
      let target =
        event.target instanceof Element
          ? event.target.closest("[data-home-reveal]")
          : null;
      while (target && element.contains(target)) {
        reveal(target);
        target = target.parentElement?.closest("[data-home-reveal]") ?? null;
      }
    };
    const mutations = new MutationObserver(scan);
    mutations.observe(element, { subtree: true, childList: true });
    reduced.addEventListener("change", sync);
    element.addEventListener("focusin", focus);
    sync();
    return () => {
      observer.disconnect();
      mutations.disconnect();
      reduced.removeEventListener("change", sync);
      element.removeEventListener("focusin", focus);
      delete element.dataset.homeMotion;
    };
  }, [root, ready]);
}
