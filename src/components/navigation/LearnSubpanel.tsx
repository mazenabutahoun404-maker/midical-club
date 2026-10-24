import { useLayoutEffect, useRef, type RefObject } from "react";
import type { SiteContent } from "../../types/content";
import { MegaMenu } from "./MegaMenu";

/** Keep the disclosure outside the rail's scrolling/clipping surface. */
export function LearnSubpanel({
  navigation,
  anchor,
  rail,
  horizontal,
  onNavigate,
  onPointerEnter,
  onPointerLeave,
}: {
  navigation: SiteContent["navigation"];
  anchor: RefObject<HTMLAnchorElement | null>;
  rail: RefObject<HTMLElement | null>;
  horizontal: boolean;
  onNavigate: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = panel.current,
      trigger = anchor.current,
      surface = rail.current;
    if (!node || !trigger || !surface) return;
    // The native top layer also escapes the temporary entrance transform.
    node.showPopover?.();
    let frame = 0;
    const position = () => {
      frame = 0;
      const a = trigger.getBoundingClientRect(),
        r = surface.getBoundingClientRect();
      if (innerWidth < 768 || a.bottom < r.top || a.top > r.bottom) {
        onNavigate();
        return;
      }
      const rtl = getComputedStyle(surface).direction === "rtl";
      const room = rtl ? r.left - 24 : innerWidth - r.right - 24;
      const width = Math.min(
        480,
        horizontal ? innerWidth - 24 : Math.max(240, room),
      );
      node.style.width = `${width}px`;
      node.style.maxHeight = `${Math.max(120, innerHeight - 24)}px`;
      const height = node.offsetHeight;
      const left = horizontal
        ? rtl
          ? a.right - width
          : a.left
        : rtl
          ? r.left - width - 12
          : r.right + 12;
      node.style.left = `${Math.max(12, Math.min(innerWidth - width - 12, left))}px`;
      node.style.top = `${Math.max(12, Math.min(innerHeight - height - 12, horizontal ? r.bottom + 12 : a.top - 12))}px`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(position);
    };
    const scroll = (event: Event) => {
      // Page scrolling does not move a fixed rail. Only its own scroll area does.
      if (event.target instanceof Element && surface.contains(event.target))
        schedule();
    };
    position();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(schedule);
    observer?.observe(surface);
    observer?.observe(node);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", scroll, true);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", scroll, true);
      if (node.hidePopover && node.matches(":popover-open")) node.hidePopover();
    };
  }, [anchor, rail, horizontal, onNavigate]);
  return (
    <MegaMenu
      ref={panel}
      floating
      navigation={navigation}
      onNavigate={onNavigate}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    />
  );
}
