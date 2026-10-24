import { useEffect, type RefObject } from "react";
/** Recompute on chrome and viewport changes; scroll never reads layout. */
export function useSectionNavOffset(
  root: RefObject<HTMLDivElement | null>,
  studying: boolean,
) {
  useEffect(() => {
    const panel = root.current,
      shell = panel?.closest<HTMLElement>(".app-shell"),
      nav = panel?.querySelector<HTMLElement>(".desktop-navigation");
    if (!shell || !nav || studying) return;
    let frame = 0;
    function measure() {
      frame = 0;
      if (!shell || !nav) return;
      if (
        shell.dataset.navigation !== "horizontal" ||
        !window.matchMedia("(min-width: 768px)").matches
      ) {
        shell.style.removeProperty("--measured-section-top");
        return;
      }
      const top =
        shell.dataset.navHidden === "true"
          ? 6
          : Math.round(
              (parseFloat(getComputedStyle(nav).top) || 0) +
                nav.offsetHeight +
                4,
            );
      const value = `${top}px`;
      if (shell.style.getPropertyValue("--measured-section-top") !== value)
        shell.style.setProperty("--measured-section-top", value);
    }
    const schedule = () => {
        if (!frame) frame = requestAnimationFrame(measure);
      },
      resize =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(schedule)
          : null;
    resize?.observe(nav);
    const changes = new MutationObserver(schedule);
    changes.observe(shell, {
      attributes: true,
      attributeFilter: ["data-navigation", "data-nav-hidden", "data-sidebar"],
    });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize?.disconnect();
      changes.disconnect();
      window.removeEventListener("resize", schedule);
      shell.style.removeProperty("--measured-section-top");
    };
  }, [root, studying]);
}
