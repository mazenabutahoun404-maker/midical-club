import { useLayoutEffect, useRef } from "react";
import { arrivalPlayed, rememberArrival } from "../lib/arrival";

/** One shell entrance for this page load, shared by public, personal and admin. */
export function useShellArrival(space: string, enabled = true) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = root.current;
    if (!node || !enabled || arrivalPlayed("shell")) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (document.hidden || reduced.matches) {
      rememberArrival("shell");
      return;
    }
    node.dataset.shellEnter = "true";
    // StrictMode's rehearsal cleans up before paint and does not consume the entrance.
    const commit = requestAnimationFrame(() => rememberArrival("shell"));
    const finish = () => {
      rememberArrival("shell");
      node.removeAttribute("data-shell-enter");
      node.removeEventListener("pointerdown", interact, true);
      node.removeEventListener("focusin", interact, true);
    };
    const interact = (event: Event) => {
      if (
        (event.target as Element | null)?.closest(
          ".desktop-navigation, .utility-header, .phone-navigation",
        )
      )
        finish();
    };
    const stop = () => {
      if (document.hidden || reduced.matches) finish();
    };
    const timer = setTimeout(finish, 2300);
    node.addEventListener("pointerdown", interact, true);
    node.addEventListener("focusin", interact, true);
    reduced.addEventListener("change", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(commit);
      node.removeAttribute("data-shell-enter");
      node.removeEventListener("pointerdown", interact, true);
      node.removeEventListener("focusin", interact, true);
      reduced.removeEventListener("change", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [space, enabled]);
  return root;
}
