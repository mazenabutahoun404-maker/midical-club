import { useCallback, useEffect, useRef, useState } from "react";
import {
  readStudyState,
  writeStudyState,
  type StudyState,
} from "./study-state";

/** One instance per account/course. CourseNotebook is keyed by this identity. */
export function useStudyState(key: string) {
  const [state, setState] = useState(() => readStudyState(key));
  const [persistent, setPersistent] = useState(true);
  const current = useRef(state);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!dirty.current) return;
    const saved = writeStudyState(key, current.current);
    dirty.current = !saved;
    setPersistent(saved);
  }, [key]);
  const update = useCallback(
    (change: (previous: StudyState) => StudyState, render = true) => {
      current.current = change(current.current);
      dirty.current = true;
      if (render) setState(current.current);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 350);
    },
    [flush],
  );
  useEffect(() => {
    const visibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    const storage = (event: StorageEvent) => {
      if (event.key === key && !dirty.current) {
        current.current = readStudyState(key);
        setState(current.current);
      }
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("storage", storage);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("storage", storage);
      document.removeEventListener("visibilitychange", visibility);
      if (timer.current) clearTimeout(timer.current);
      if (dirty.current) writeStudyState(key, current.current);
    };
  }, [flush, key]);
  return { state, current, update, persistent, flush };
}
