import { useEffect, useRef } from "react";
import "../../styles/empty-scene-v1358.css";
export function EmptyScene() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              node.dataset.visible = String(
                entries[0]?.isIntersecting ?? false,
              );
            },
            { threshold: 0.1 },
          )
        : null;
    node.dataset.visible = String(!observer);
    observer?.observe(node);
    return () => observer?.disconnect();
  }, []);
  return (
    <div
      className="empty-scene"
      ref={root}
      aria-hidden="true"
      data-visible="false"
    >
      <svg viewBox="0 0 240 180" fill="none" focusable="false">
        <ellipse
          cx="120"
          cy="160"
          rx="70"
          ry="8"
          className="empty-scene-shadow"
        />
        <circle cx="120" cy="86" r="72" className="empty-scene-aura" />
        <g className="empty-scene-float">
          <g transform="rotate(-13 91 94)">
            <rect
              x="38"
              y="45"
              width="83"
              height="107"
              rx="12"
              className="empty-scene-teal"
            />
            <path d="M55 68H99M55 81H87" className="empty-scene-paper-line" />
          </g>
          <g transform="rotate(13 160 96)">
            <rect
              x="132"
              y="46"
              width="70"
              height="105"
              rx="12"
              className="empty-scene-gold"
            />
            <circle
              cx="166"
              cy="79"
              r="13"
              className="empty-scene-paper-line"
            />
            <path
              d="M148 110H182M148 121H174"
              className="empty-scene-paper-line"
            />
          </g>
          <rect
            x="72"
            y="25"
            width="100"
            height="124"
            rx="14"
            className="empty-scene-paper"
          />
          <path
            d="M88 48H130M88 61H147M88 119H135M88 130H117"
            className="empty-scene-rule"
          />
          <path
            d="M95 88H108L113 77L123 100L130 86L135 88H148"
            className="empty-scene-pulse"
          />
          <path
            d="M145 25V42C145 46 148 49 152 49H172"
            className="empty-scene-fold"
          />
        </g>
        <g className="empty-scene-spark">
          <path d="M38 22V36M31 29H45M203 107V119M197 113H209" />
          <circle cx="206" cy="37" r="4" />
          <circle cx="27" cy="118" r="3" />
        </g>
      </svg>
    </div>
  );
}
