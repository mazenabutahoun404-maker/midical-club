import { useEffect, useRef, useState, type RefObject } from "react";
import { campusDestinations } from "./living-campus";

/** One short sequence per visible minute. A welcome burst is explicitly triggered by the form. */
export function useCampusLife(
  stage: RefObject<HTMLElement | null>,
  kind: "entrance" | "ambient" | "welcome",
  enabled = true,
  trigger = 0,
) {
  const [lit, setLit] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const cursor = useRef(0);
  const lastStart = useRef(0);
  const finished = useRef(false);
  const lastTrigger = useRef(0);
  useEffect(() => {
    if (kind === "welcome" && lastTrigger.current !== trigger) {
      cursor.current = 0;
      finished.current = false;
      lastTrigger.current = trigger;
    }
    const element = stage.current;
    if (!element || !enabled || (kind === "welcome" && !trigger)) {
      cursor.current = 0;
      setLit(null);
      setRevealed([]);
      setRunning(false);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = typeof IntersectionObserver === "undefined";
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const speed = kind === "welcome" ? 110 : kind === "ambient" ? 900 : 850;
    const allowed = () =>
      !disposed &&
      inView &&
      !document.hidden &&
      !reduced.matches &&
      !(kind === "welcome" && finished.current);
    const stop = () => {
      clearTimeout(timer);
      timer = undefined;
      cursor.current = 0;
      lastStart.current = 0;
      setLit(null);
      setRevealed([]);
      setRunning(false);
    };
    const tick = () => {
      timer = undefined;
      if (!allowed()) return;
      if (cursor.current >= campusDestinations.length) {
        cursor.current = 0;
        setLit(null);
        setRevealed([]);
        setRunning(false);
        if (kind === "welcome") {
          finished.current = true;
          return;
        }
        timer = setTimeout(
          tick,
          Math.max(350, lastStart.current + 60_000 - Date.now()),
        );
        return;
      }
      if (cursor.current === 0) lastStart.current = Date.now();
      const id = campusDestinations[cursor.current++].id;
      setLit(id);
      setRunning(true);
      setRevealed((current) => [...current, id]);
      timer = setTimeout(tick, speed);
    };
    const sync = () => {
      if (!allowed()) {
        stop();
        return;
      }
      if (timer === undefined) {
        const wait =
          kind === "welcome"
            ? 0
            : cursor.current
              ? 100
              : Math.max(
                  350,
                  lastStart.current
                    ? lastStart.current + 60_000 - Date.now()
                    : 350,
                );
        timer = setTimeout(tick, wait);
      }
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              inView = entries[0]?.isIntersecting ?? false;
              sync();
            },
            { threshold: 0.08 },
          );
    observer?.observe(element);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      disposed = true;
      clearTimeout(timer);
      observer?.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [stage, kind, enabled, trigger]);
  return { lit, revealed, running };
}
