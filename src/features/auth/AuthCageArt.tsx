import { useEffect, useRef } from "react";
import cage from "../../assets/medical/auth-ribcage-v1390.webp";

/** Decorative thoracic frame. Neither layer owns focus or intercepts input. */
export function AuthCageArt({ foreground = false }: { foreground?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const sync = () =>
      node.toggleAttribute(
        "data-running",
        visible && !document.hidden && !reduced.matches,
      );
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) => {
            visible = entries[0]?.isIntersecting ?? false;
            sync();
          });
    observer?.observe(node);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer?.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return (
    <div
      ref={root}
      className={"auth-cage-art" + (foreground ? " auth-cage-art-front" : "")}
      aria-hidden="true"
    >
      <img
        src={cage}
        width={1122}
        height={1402}
        alt=""
        fetchPriority={foreground ? "auto" : "high"}
        decoding="async"
        draggable={false}
      />
    </div>
  );
}
