import { useCallback, useEffect, useRef, useState } from "react";

export function useNavigationScrollCues(refreshKey: string) {
  const scrollArea = useRef<HTMLDivElement>(null);
  const [scrollCues, setScrollCues] = useState({
    before: false,
    after: false,
  });

  const updateScrollCues = useCallback(() => {
    const node = scrollArea.current;
    if (!node) return;

    const horizontal = node.scrollWidth > node.clientWidth + 2;
    const position = horizontal ? Math.abs(node.scrollLeft) : node.scrollTop;
    const maximum = horizontal
      ? node.scrollWidth - node.clientWidth
      : node.scrollHeight - node.clientHeight;

    setScrollCues({
      before: position > 2,
      after: maximum - position > 2,
    });
  }, []);

  useEffect(() => {
    const node = scrollArea.current;
    if (!node) return;

    let frame = requestAnimationFrame(updateScrollCues);
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateScrollCues);
    };

    node.addEventListener("scroll", updateScrollCues, { passive: true });
    window.addEventListener("resize", refresh);
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(refresh);
    observer?.observe(node);
    if (node.firstElementChild) observer?.observe(node.firstElementChild);

    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("scroll", updateScrollCues);
      window.removeEventListener("resize", refresh);
      observer?.disconnect();
    };
  }, [refreshKey, updateScrollCues]);

  return { scrollArea, scrollCues, updateScrollCues };
}
