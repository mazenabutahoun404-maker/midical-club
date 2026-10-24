import { useEffect, useState, type RefObject } from "react";
import { arrivalPlayed, rememberArrival } from "../../lib/arrival";

/** The image opens once; path illumination starts after the reveal, never behind it. */
export function useHeroArrival(
  root: RefObject<HTMLElement | null>,
  ready: boolean,
) {
  const [available, setAvailable] = useState(false),
    [entered, setEntered] = useState(false);
  useEffect(() => {
    if (ready) setAvailable(true);
  }, [ready]);
  useEffect(() => {
    const node = root.current;
    if (!available || !node) return;
    if (arrivalPlayed("campus")) {
      setEntered(true);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || document.hidden) {
      rememberArrival("campus");
      setEntered(true);
      return;
    }
    node.dataset.medicalArrival = "true";
    const commit = requestAnimationFrame(() => rememberArrival("campus"));
    const finish = () => {
      rememberArrival("campus");
      node.removeAttribute("data-medical-arrival");
      setEntered(true);
    };
    const stop = () => {
      if (reduced.matches || document.hidden) finish();
    };
    const timer = setTimeout(finish, 760);
    reduced.addEventListener("change", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(commit);
      node.removeAttribute("data-medical-arrival");
      reduced.removeEventListener("change", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [available, root]);
  return entered;
}
