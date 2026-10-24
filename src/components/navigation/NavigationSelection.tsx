import { useEffect, useRef, useState, type CSSProperties } from "react";

export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
/** Offset geometry stays correct while the containing rail folds in 3D. */
export function selectionBox(
  target: HTMLElement,
  host: HTMLElement,
): SelectionBox {
  let x = 0,
    y = 0,
    node: HTMLElement | null = target;
  while (node && node !== host) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  const box = { x, y, width: target.offsetWidth, height: target.offsetHeight };
  // A vertical destination owns the whole link lane, including icon-only rails.
  // Use layout offsets rather than transformed screen bounds during a fold.
  if (
    host.classList.contains("navigation-scroll") &&
    host.closest('.app-shell[data-navigation="vertical"]')
  ) {
    box.x = 0;
    box.width = host.clientWidth;
  }
  return box;
}

export function NavigationSelection() {
  const leaf = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<SelectionBox | null>(null);
  useEffect(() => {
    const host = leaf.current?.parentElement;
    if (!host) return;
    host.classList.add("navigation-selection-host");
    let frame = 0;
    let selected: HTMLElement | null = null;
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(queue);
    function measure() {
      frame = 0;
      const next = host!.querySelector<HTMLElement>(
        '.navigation-item.active, :scope > [aria-current="page"], :scope > [aria-current="location"]',
      );
      if (next !== selected) {
        if (selected) observer?.unobserve(selected);
        selected = next;
        if (next) observer?.observe(next);
      }
      const nextBox = next ? selectionBox(next, host!) : null;
      host!.toggleAttribute("data-selection-ready", !!nextBox?.width);
      setBox((previous) =>
        nextBox &&
        previous &&
        Object.keys(nextBox).every(
          (key) =>
            nextBox[key as keyof SelectionBox] ===
            previous[key as keyof SelectionBox],
        )
          ? previous
          : nextBox,
      );
    }
    function queue() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    const mutations = new MutationObserver(queue);
    mutations.observe(host, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "aria-current"],
    });
    observer?.observe(host);
    window.addEventListener("resize", queue);
    queue();
    return () => {
      observer?.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", queue);
      host.classList.remove("navigation-selection-host");
      host.removeAttribute("data-selection-ready");
    };
  }, []);
  const style = box
    ? {
        transform: "translate3d(" + box.x + "px," + box.y + "px,0)",
        width: box.width,
        height: box.height,
      }
    : {};
  return (
    <span
      ref={leaf}
      className="navigation-travelling-selection"
      style={style as CSSProperties}
      data-visible={!!box?.width || undefined}
      aria-hidden="true"
    />
  );
}
