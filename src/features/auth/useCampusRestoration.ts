import { useEffect, useRef, useState } from "react";
import { prepareRestorationImage } from "./restoration-art";

export type CampusArrival = { id: string; token: number };

/** Only valid fields restore buildings. Each route arrives before the crisp photo changes. */
export function useCampusRestoration(progress: string[], enabled: boolean, final: boolean, assets: string[], waitForRoute: (id: string, signal: AbortSignal) => Promise<void>) {
  const [repaired, setRepaired] = useState<string[]>([]);
  const current = useRef<string[]>([]);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [lit, setLit] = useState<string | null>(null);
  const [arrival, setArrival] = useState<CampusArrival | null>(null);
  const arrivalToken = useRef(0);
  const key = progress.join("|");
  const assetKey = assets.join("|");
  useEffect(() => {
    let active = true;
    const abort = new AbortController();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const retain = current.current.filter((id) => progress.includes(id));
    current.current = retain;
    setRepaired(retain);
    setRevealed(retain);
    setLit(null);
    setArrival(null);
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const order = ["learning", "media", "community", "mentorship", "contribution", "journals"];
    const sleep = (ms: number) => new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)));
    void (async () => {
      for (const id of progress.filter((id) => !retain.includes(id))) {
        try { await prepareRestorationImage(assets[order.indexOf(id)]); } catch { continue; }
        if (!active) return;
        setRevealed((values) => values.includes(id) ? values : [...values, id]);
        if (!reduce && !document.hidden) await waitForRoute(id, abort.signal);
        if (!active) return;
        current.current = [...current.current, id];
        setRepaired(current.current);
        setLit(id);
        if (!reduce && !document.hidden) setArrival({ id, token: ++arrivalToken.current });
        if (!reduce && !final && !document.hidden) await sleep(240);
        if (!active) return;
        setLit(null);
      }
    })();
    return () => { active = false; abort.abort(); timers.forEach(clearTimeout); };
  }, [key, enabled, final, assetKey, waitForRoute]);
  return { repaired: repaired.filter((id) => progress.includes(id)), revealed: revealed.filter((id) => progress.includes(id)), lit, arrival, running: !!lit };
}
