import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { CampusArrival } from "./useCampusRestoration";
import "./campus-arrival-burst.css";

const particles = Array.from({ length: 18 }, (_, index) => {
  const angle = (index / 18) * Math.PI * 2 - Math.PI / 2;
  const distance = 90 + (index % 4) * 22;
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, size: index % 3 === 0 ? 1.45 : .95, delay: (index % 3) * 18 };
});
const star = "M0-5L1.5-1.5L5 0L1.5 1.5L0 5L-1.5 1.5L-5 0L-1.5-1.5Z";

/** Finite SVG fireworks: CSS animates only transforms and opacity, never the photograph. */
export function CampusArrivalBurst({ arrival, points, enabled, repaired }: {
  arrival: CampusArrival | null;
  points: Record<string, readonly [number, number]>;
  enabled: boolean;
  repaired: string[];
}) {
  const [bursts, setBursts] = useState<CampusArrival[]>([]);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const last = useRef(0);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!enabled || reduced) {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
      setBursts([]);
      return;
    }
    if (!arrival || arrival.token === last.current) return;
    last.current = arrival.token;
    setBursts((current) => [...current, arrival].slice(-3));
    const timer = setTimeout(() => {
      timers.current.delete(arrival.token);
      setBursts((current) => current.filter((burst) => burst.token !== arrival.token));
    }, 1250);
    timers.current.set(arrival.token, timer);
  }, [arrival, enabled, reduced]);
  useEffect(() => {
    const stop = () => {
      if (!document.hidden) return;
      timers.current.forEach(clearTimeout);
      timers.current.clear();
      setBursts([]);
    };
    const pending = timers.current;
    document.addEventListener("visibilitychange", stop);
    return () => { pending.forEach(clearTimeout); pending.clear(); document.removeEventListener("visibilitychange", stop); };
  }, []);
  if (!enabled || reduced) return null;
  return <g className="campus-arrival-bursts" aria-hidden="true" pointerEvents="none">
    {bursts.filter((burst) => repaired.includes(burst.id)).map((burst) => {
      const point = points[burst.id];
      if (!point) return null;
      return <g key={burst.token} className="campus-arrival-burst" data-arrival-building={burst.id}
        data-arrival-token={burst.token} transform={`translate(${point[0]} ${point[1]})`}>
        <circle className="campus-arrival-ring" r={16} />
        <circle className="campus-arrival-ring campus-arrival-inner-ring" r={9} />
        <path className="campus-arrival-flash" d={star} />
        {particles.map((particle, index) => <g key={index} className="campus-arrival-particle"
          style={{ "--star-x": `${particle.x}px`, "--star-y": `${particle.y}px`, "--star-size": particle.size, animationDelay: `${particle.delay}ms` } as CSSProperties}>
          <path d={star} transform={`rotate(${index * 29})`} />
          {index % 2 === 0 && <path className="campus-arrival-tail" d={`M0 0L${-particle.x * .065} ${-particle.y * .065}`} />}
        </g>)}
      </g>;
    })}
  </g>;
}
