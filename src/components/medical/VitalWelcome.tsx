import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { arrivalPlayed, rememberArrival } from "../../lib/arrival";
import { useLocale } from "../../app/providers/LocaleProvider";
import { traceWelcome, type VitalDrawing } from "./welcome-contours";
type Line = { text: string; className?: string };

/** ECG path points reshape into the browser's real, joined glyph contours. */
export function VitalWelcome({
  identity,
  lines,
}: {
  identity: string;
  lines: Line[];
}) {
  const { dir } = useLocale();
  const root = useRef<HTMLSpanElement>(null);
  const [drawings, setDrawings] = useState<(VitalDrawing | null)[]>([]);
  const id = useId().replace(/:/g, "");
  const content = lines.map((l) => l.text).join("\n");
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    if (arrivalPlayed("welcome")) {
      setDrawings([]);
      return;
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || document.hidden) {
      rememberArrival("welcome");
      return;
    }
    let cancelled = false,
      frame = 0,
      timer = 0;
    node.dataset.vitalEnter = "true";
    node.dataset.vitalPhase = "preparing";
    const finish = () => {
      if (cancelled) return;
      rememberArrival("welcome");
      node.removeAttribute("data-vital-enter");
      node.removeAttribute("data-vital-phase");
      setDrawings([]);
    };
    const stop = () => {
      if (document.hidden || reduced.matches) finish();
    };
    const fallback = window.setTimeout(finish, 1000);
    void document.fonts.ready
      .then(() => {
        if (cancelled || !node.hasAttribute("data-vital-enter")) return;
        frame = requestAnimationFrame(() => {
          if (cancelled || !node.hasAttribute("data-vital-enter")) return;
          clearTimeout(fallback);
          let next: (VitalDrawing | null)[];
          try {
            next = Array.from(
              node.querySelectorAll<HTMLElement>(".vital-line-ink"),
            ).map((ink, i) => traceWelcome(ink, dir, i));
          } catch {
            finish();
            return;
          }
          if (!next.some(Boolean)) {
            finish();
            return;
          }
          setDrawings(next);
          timer = window.setTimeout(finish, 2850);
        });
      })
      .catch(finish);
    reduced.addEventListener("change", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      cancelled = true;
      clearTimeout(fallback);
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      node.removeAttribute("data-vital-enter");
      node.removeAttribute("data-vital-phase");
      reduced.removeEventListener("change", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [identity, content, dir]);
  useLayoutEffect(() => {
    const node = root.current;
    if (!drawings.length || !node?.hasAttribute("data-vital-enter")) return;
    rememberArrival("welcome");
    node.dataset.vitalPhase = "morph";
    const animations = node.querySelectorAll<SVGAnimationElement>(
      "animate, animateMotion",
    );
    if (
      !animations.length ||
      typeof animations[0].beginElementAt !== "function"
    ) {
      node.removeAttribute("data-vital-enter");
      node.removeAttribute("data-vital-phase");
      setDrawings([]);
      return;
    }
    animations.forEach((a) => a.beginElementAt(Number(a.dataset.delay || 0)));
  }, [drawings]);
  return (
    <span className="vital-welcome" ref={root} data-vital-identity={identity}>
      <span className="sr-only">{lines.map((l) => l.text).join(" ")}</span>
      <span className="vital-typeset" aria-hidden="true">
        {lines.map((line, i) => {
          const art = drawings[i],
            mask = id + "-wave-" + i;
          return (
            <span
              className={"vital-line " + (line.className || "")}
              data-vital-drawing={!!art || undefined}
              key={i}
              style={{ "--vital-line-index": i } as CSSProperties}
            >
              <span className="vital-line-ink">
                <span className="vital-native">
                  <span data-vital-text>{line.text}</span>
                  <i className="vital-baseline" />
                </span>
                {art && (
                  <svg
                    className="vital-morph"
                    viewBox={"0 0 " + art.width + " " + art.height}
                    preserveAspectRatio="none"
                    fill="none"
                    data-contours={art.contours.length}
                  >
                    <defs>
                      <mask id={mask}>
                        <rect
                          width={art.width}
                          height={art.height}
                          fill="white"
                        >
                          <animate
                            attributeName={dir === "rtl" ? "width" : "x"}
                            from={dir === "rtl" ? art.width : 0}
                            to={dir === "rtl" ? 0 : art.width}
                            dur="1.1s"
                            begin="indefinite"
                            data-delay={0.5 + i * 0.32}
                            fill="freeze"
                          />
                        </rect>
                      </mask>
                    </defs>
                    <path
                      className="vital-carrier"
                      d={art.wave}
                      mask={"url(#" + mask + ")"}
                      pathLength={1}
                      style={
                        {
                          "--vital-wave-delay": i * 320 + "ms",
                        } as CSSProperties
                      }
                    />
                    {art.contours.map((c, ci) => (
                      <path
                        className="vital-morph-contour"
                        d={c.from}
                        key={ci}
                        fill="none"
                        style={
                          { "--contour-delay": c.delay + "s" } as CSSProperties
                        }
                      >
                        <animate
                          attributeName="d"
                          from={c.from}
                          to={c.to}
                          dur=".78s"
                          begin="indefinite"
                          data-delay={c.delay}
                          calcMode="spline"
                          keyTimes="0;1"
                          keySplines=".25 .1 .2 1"
                          fill="freeze"
                        />
                      </path>
                    ))}
                    <circle className="vital-pulse-head" r="2.5">
                      <animateMotion
                        path={art.wave}
                        dur="1.35s"
                        begin="indefinite"
                        data-delay={i * 0.32}
                        fill="freeze"
                      />
                      <animate
                        attributeName="opacity"
                        values="0;1;1;0"
                        keyTimes="0;.08;.85;1"
                        dur="1.4s"
                        begin="indefinite"
                        data-delay={i * 0.32}
                        fill="freeze"
                      />
                    </circle>
                  </svg>
                )}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
