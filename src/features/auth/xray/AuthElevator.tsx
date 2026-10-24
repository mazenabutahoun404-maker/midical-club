import {
  Suspense,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type RefObject,
} from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { LoadingState } from "../../../components/feedback/LoadingState";
import {
  authSceneMode,
  elevatorPosition,
  isElevatorSwap,
  XRAY_DURATION,
} from "./xray-state";
type Pane = { path: string; node: ReactElement | null };

/** Keep the previous routed form mounted during the scan, with a stable key and inaccessible ghost. */
export function AuthElevator({
  root,
}: {
  root: RefObject<HTMLDivElement | null>;
}) {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const [panes, setPanes] = useState<Pane[]>(() => [
    { path: pathname, node: outlet },
  ]);
  const previous = useRef(pathname),
    current = useRef(authSceneMode(pathname)),
    frame = useRef(0);
  const mountedPanes = useRef(panes);
  mountedPanes.current = panes;
  const viewport = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const measure = () => {
      const height = node.clientHeight;
      if (!height) return;
      const clearance =
        parseFloat(
          getComputedStyle(node).getPropertyValue("--auth-clearance"),
        ) || 80;
      root.current?.style.setProperty("--auth-viewport-height", `${height}px`);
      root.current?.style.setProperty(
        "--auth-scene-width",
        `${node.clientWidth}px`,
      );
      const frameWidth =
        node.querySelector<HTMLElement>(".auth-panel-frame")?.offsetWidth;
      if (frameWidth)
        root.current?.style.setProperty(
          "--auth-frame-width",
          `${frameWidth}px`,
        );
      node
        .querySelectorAll<HTMLElement>(".auth-elevator-pane")
        .forEach((pane) => {
          const surface = pane.querySelector<HTMLElement>(".auth-form-surface");
          if (!surface) return;
          const panelHeight = Math.min(
            surface.scrollHeight + 2,
            Math.max(0, height - clearance),
          );
          const mode = authSceneMode(pane.dataset.authPath || "");
          root.current?.style.setProperty(
            mode ? "--auth-register-height" : "--auth-signin-height",
            `${panelHeight}px`,
          );
        });
    };
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(node);
    node
      .querySelectorAll(".auth-form-surface")
      .forEach((panel) => observer?.observe(panel));
    measure();
    return () => observer?.disconnect();
  }, [panes, root]);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    cancelAnimationFrame(frame.current);
    const oldPath = previous.current,
      target = authSceneMode(pathname);
    const next = mountedPanes.current.find((p) => p.path === pathname) || {
      path: pathname,
      node: outlet,
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canAnimate =
      isElevatorSwap(oldPath, pathname) && !document.hidden && !reduced.matches;
    previous.current = pathname;
    const paint = (value: number) => {
      current.current = value;
      element.style.setProperty("--auth-travel", String(value));
      element.style.setProperty("--auth-scan", `${value * 100}%`);
      element.style.setProperty(
        "--auth-crossing",
        String(Math.max(0, Math.sin(Math.PI * value))),
      );
    };
    const restoreFocus =
      canAnimate && !!viewport.current?.contains(document.activeElement);
    let complete = false;
    const finish = () => {
      if (complete) return;
      complete = true;
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      paint(target);
      element.removeAttribute("data-auth-transition");
      setPanes([next]);
      if (restoreFocus) {
        const heading = viewport.current?.querySelector<HTMLElement>(
          ".auth-elevator-pane:not([data-outgoing]) h2",
        );
        if (heading) {
          heading.tabIndex = -1;
          heading.focus({ preventScroll: true });
        }
      }
    };
    if (!canAnimate) {
      finish();
      return;
    }
    const outgoing =
      mountedPanes.current.find((p) => p.path === oldPath) ||
      mountedPanes.current.at(-1)!;
    setPanes(outgoing.path === next.path ? [next] : [outgoing, next]);
    element.dataset.authTransition = target ? "down" : "up";
    const from = current.current;
    paint(from);
    let start: number | undefined;
    const tick = (now: number) => {
      // Wait for a lazy form to commit before starting the shared trajectory.
      // The outgoing form stays visible at the boundary on a slow connection.
      if (
        start === undefined &&
        !viewport.current?.querySelector(
          ".auth-elevator-pane:not([data-outgoing]) .auth-panel",
        )
      ) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      start ??= now;
      paint(elevatorPosition(from, target, now - start));
      if (now - start < XRAY_DURATION)
        frame.current = requestAnimationFrame(tick);
      else finish();
    };
    frame.current = requestAnimationFrame(tick);
    const stop = () => {
      if (document.hidden || reduced.matches) finish();
    };
    document.addEventListener("visibilitychange", stop);
    reduced.addEventListener("change", stop);
    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      document.removeEventListener("visibilitychange", stop);
      reduced.removeEventListener("change", stop);
      element.removeAttribute("data-auth-transition");
    };
  }, [pathname, root]);
  return (
    <div className="auth-elevator-viewport" ref={viewport}>
      {panes.map((pane) => {
        const outgoing = pane.path !== pathname;
        return (
          <div
            key={pane.path}
            className="auth-elevator-pane"
            data-auth-path={pane.path}
            data-outgoing={outgoing || undefined}
            aria-hidden={outgoing || undefined}
            inert={outgoing || undefined}
          >
            <div className="auth-panel-frame">
              <div className="auth-form-surface">
                <Suspense fallback={<LoadingState />}>{pane.node}</Suspense>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
