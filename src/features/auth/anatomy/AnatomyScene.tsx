import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useAuthJourney } from "../AuthJourney";
import { authMilestones } from "../auth-progress";
import { useLocale } from "../../../app/providers/LocaleProvider";
import { useAppearance } from "../../../app/providers/AppearanceProvider";
import { appearancePreviewColors } from "../../../app/providers/appearance-preview-colors";
import poster from "../../../assets/medical/heart-study-poster.webp";
import { automaticAnatomy3D, type AnatomyState } from "./anatomy-state";
import type { AnatomyController } from "./anatomy-renderer";
const routes = [
  {
    d: "M 124 160 C 188 126 222 176 260 218",
    x: 124,
    y: 160,
    ax: 260,
    ay: 218,
  },
  {
    d: "M 514 173 C 462 150 430 182 397 234",
    x: 514,
    y: 173,
    ax: 397,
    ay: 234,
  },
  {
    d: "M 104 310 C 152 285 193 301 224 323",
    x: 104,
    y: 310,
    ax: 224,
    ay: 323,
  },
  {
    d: "M 540 324 C 490 290 458 322 418 344",
    x: 540,
    y: 324,
    ax: 418,
    ay: 344,
  },
  {
    d: "M 168 483 C 208 487 251 452 278 424",
    x: 168,
    y: 483,
    ax: 278,
    ay: 424,
  },
  {
    d: "M 483 486 C 434 482 400 448 369 428",
    x: 483,
    y: 486,
    ax: 369,
    ay: 428,
  },
];
export function AnatomyScene({
  registering,
  verifying,
}: {
  registering: boolean;
  verifying: boolean;
}) {
  const journey = useAuthJourney(),
    { t } = useLocale(),
    { resolvedTheme, palette } = useAppearance();
  const stage = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    controller = useRef<AnatomyController | null>(null);
  const [ready, setReady] = useState(false),
    [running, setRunning] = useState(true),
    [arrivals, setArrivals] = useState<string[]>([]);
  const previous = useRef(journey.progress),
    [posterFailed, setPosterFailed] = useState(false);
  const registeringScene = registering || verifying;
  const state: AnatomyState = {
    progress: journey.progress.length,
    registering: registeringScene,
    feedback: journey.feedback,
    focused: !!journey.focused,
    dark: resolvedTheme === "dark",
    accent:
      appearancePreviewColors[`${palette}-${resolvedTheme}`]?.primary ||
      "#9d2730",
  };
  const latest = useRef(state);
  latest.current = state;
  useEffect(() => {
    controller.current?.update(latest.current);
  }, [
    state.progress,
    state.registering,
    state.feedback,
    state.focused,
    state.dark,
    state.accent,
  ]);
  useEffect(() => {
    const added = journey.progress.filter(
      (id) => !previous.current.includes(id),
    );
    previous.current = journey.progress;
    if (!added.length || !registering) {
      setArrivals([]);
      return;
    }
    setArrivals(added);
    const timeout = setTimeout(() => setArrivals([]), 1500);
    return () => clearTimeout(timeout);
  }, [journey.progress, registering]);
  useEffect(() => {
    let active = true,
      intersecting = true,
      attempted = false,
      abort: AbortController | null = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
      deviceMemory?: number;
    };
    const allowed = () =>
      automaticAnatomy3D({
        reduced: reduced.matches,
        saveData: nav.connection?.saveData,
        memory: nav.deviceMemory,
        cores: nav.hardwareConcurrency,
      }) &&
      typeof WebGL2RenderingContext !== "undefined" &&
      typeof ResizeObserver !== "undefined";
    const fail = () => {
      if (active) {
        controller.current?.dispose();
        controller.current = null;
        setReady(false);
      }
    };
    async function start() {
      if (
        !active ||
        attempted ||
        !allowed() ||
        !intersecting ||
        document.hidden ||
        !canvas.current
      )
        return;
      attempted = true;
      const request = new AbortController();
      abort = request;
      try {
        const { mountAnatomy } = await import("./anatomy-renderer");
        if (!active || request.signal.aborted) return;
        const instance = await mountAnatomy(canvas.current!, {
          signal: request.signal,
          state: latest.current,
          onFailure: fail,
        });
        if (!active || request.signal.aborted) {
          instance.dispose();
          return;
        }
        controller.current = instance;
        instance.update(latest.current);
        instance.setVisible(intersecting && !document.hidden);
        setReady(true);
      } catch {
        if (!request.signal.aborted) fail();
      }
    }
    function visibility() {
      const visible = intersecting && !document.hidden;
      setRunning(visible && !reduced.matches);
      controller.current?.setVisible(visible);
      void start();
    }
    function motion() {
      if (reduced.matches) {
        abort?.abort();
        controller.current?.dispose();
        controller.current = null;
        setReady(false);
        attempted = false;
      }
      visibility();
    }
    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              intersecting = entries[0]?.isIntersecting ?? false;
              visibility();
            },
            { threshold: 0.05 },
          )
        : null;
    if (stage.current) observer?.observe(stage.current);
    document.addEventListener("visibilitychange", visibility);
    reduced.addEventListener("change", motion);
    const frame = requestAnimationFrame(visibility);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      abort?.abort();
      controller.current?.dispose();
      controller.current = null;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", motion);
    };
  }, []);
  return (
    <div
      className="auth-anatomy"
      data-scene-ready={ready}
      data-scene-running={running}
      data-progress={journey.progress.length}
      data-feedback={journey.feedback}
    >
      <div className="auth-anatomy-stage" ref={stage} aria-hidden="true">
        <span className="anatomy-halo" />
        {!posterFailed ? (
          <img
            className="anatomy-poster"
            src={poster}
            alt=""
            width={720}
            height={720}
            decoding="async"
            onError={() => setPosterFailed(true)}
          />
        ) : (
          <svg className="anatomy-emblem" viewBox="0 0 120 120">
            <path d="M60 101C42 87 18 67 18 42C18 18 49 14 60 35C73 13 103 20 103 44C103 69 80 89 60 101Z" />
            <path d="M12 60H36L45 43L57 77L69 48L78 60H110" />
          </svg>
        )}
        <canvas ref={canvas} className="anatomy-canvas" />
        <svg className="anatomy-paths" viewBox="0 0 640 640" focusable="false">
          {routes.map((route, index) => {
            const id = authMilestones[index],
              complete = !registeringScene || journey.progress.includes(id),
              arriving = arrivals.includes(id);
            const focused =
              journey.focused ===
              (id === "fullName" ? "register-name" : `register-${id}`);
            return (
              <g
                key={id}
                data-milestone={id}
                style={{ "--path-order": index } as CSSProperties}
                data-complete={complete}
                data-focused={focused}
              >
                <path className="anatomy-path-guide" d={route.d} />
                <path
                  className="anatomy-path-light"
                  d={route.d}
                  pathLength={1}
                />
                <circle
                  className="anatomy-node-ring"
                  cx={route.x}
                  cy={route.y}
                  r={11}
                />
                <circle
                  className="anatomy-node"
                  cx={route.x}
                  cy={route.y}
                  r={3.5}
                />
                {(arriving ||
                  (!registeringScene && journey.feedback === "success")) && (
                  <g
                    className={`anatomy-arrival${!registeringScene && journey.feedback === "success" ? " anatomy-welcome-arrival" : ""}`}
                    transform={`translate(${route.ax} ${route.ay})`}
                  >
                    <circle r={13} />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                      <path key={a} d="M0 -16V-24" transform={`rotate(${a})`} />
                    ))}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        <span className="anatomy-scene-index">
          {t({ en: "01 / HUMAN HEART", ar: "01 / القلب البشري" })}
        </span>
      </div>
      <div className="anatomy-caption">
        {registeringScene ? (
          <>
            <span className="anatomy-progress-track" aria-hidden="true">
              {authMilestones.map((id) => (
                <i key={id} data-complete={journey.progress.includes(id)} />
              ))}
            </span>
            <p role="status" aria-live="polite" aria-atomic="true">
              {t({
                en: `${journey.progress.length} of 6 details ready`,
                ar: `${journey.progress.length} من 6 بيانات مكتملة`,
              })}
            </p>
          </>
        ) : (
          <>
            <span className="anatomy-caption-line" aria-hidden="true" />
            <p>
              {t({
                en: "A shared passion. A world of possibility.",
                ar: "شغف واحد. وآفاق لا تنتهي.",
              })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
