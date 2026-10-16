import { useCallback, useEffect, useRef, useState } from "react";
import type { ExamAttempt, ExamProgress, ExamService } from "../../types/exams";
import { normalizeProgress } from "./exam-model";
const draftKey = (a: ExamAttempt) =>
  `medclub.exam-draft.${encodeURIComponent(a.ownerId)}.${encodeURIComponent(a.id)}`;
const fingerprint = (a: ExamAttempt) =>
  a.questions.map((q) => `${q.id}:${q.version}`).join("|");
function readDraft(a: ExamAttempt) {
  const prepare = (raw: unknown) => {
    const value = normalizeProgress(raw, a.questions);
    const current = a.questions[value.current];
    if (current) value.viewed = [...new Set([...value.viewed, current.id])];
    return value;
  };
  try {
    const raw = JSON.parse(localStorage.getItem(draftKey(a)) || "null");
    return raw?.revision === a.version && raw?.questions === fingerprint(a)
      ? prepare(raw.progress)
      : prepare(a.progress);
  } catch {
    return prepare(a.progress);
  }
}
/** Synchronous private recovery draft + one ordered, debounced save queue. Timer ticks never render the question tree. */
export function useAttemptSession(initial: ExamAttempt, service: ExamService) {
  const [progress, setProgress] = useState(() => readDraft(initial)),
    [status, setStatus] = useState<"saved" | "saving" | "unsaved" | "error">(
      "saved",
    ),
    [error, setError] = useState<unknown>(null),
    [draftPersistent, setDraftPersistent] = useState(true);
  const latest = useRef(progress),
    version = useRef(initial.version),
    lastSaved = useRef(initial),
    queue = useRef(Promise.resolve(initial)),
    debounce = useRef<ReturnType<typeof setTimeout> | null>(null),
    disposed = useRef(false),
    locked = useRef(false);
  const clock = useRef({
    start: Date.now(),
    elapsed: progress.elapsedSeconds,
    stopped: null as number | null,
  });
  const elapsed = useCallback(
    () =>
      Math.min(
        604800,
        clock.current.elapsed +
          Math.max(
            0,
            Math.floor(
              ((clock.current.stopped ?? Date.now()) - clock.current.start) /
                1000,
            ),
          ),
      ),
    [],
  );
  const snapshot = useCallback(
    (): ExamProgress => ({ ...latest.current, elapsedSeconds: elapsed() }),
    [elapsed],
  );
  const cache = useCallback(() => {
    try {
      localStorage.setItem(
        draftKey(initial),
        JSON.stringify({
          revision: version.current,
          questions: fingerprint(initial),
          progress: snapshot(),
        }),
      );
      if (!disposed.current) setDraftPersistent(true);
    } catch {
      if (!disposed.current) setDraftPersistent(false);
    }
  }, [initial.id, snapshot]);
  const flush = useCallback(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const job = queue.current
      .catch(() => lastSaved.current)
      .then(async () => {
        if (locked.current) return lastSaved.current;
        const value = snapshot();
        if (!disposed.current) {
          setStatus("saving");
          setError(null);
        }
        try {
          const saved = await service.save(initial.id, value, version.current);
          version.current = saved.version;
          lastSaved.current = saved;
          cache();
          if (!disposed.current)
            setStatus(
              JSON.stringify(value.answers) ===
                JSON.stringify(latest.current.answers) &&
                value.current === latest.current.current &&
                JSON.stringify(value.flagged) ===
                  JSON.stringify(latest.current.flagged) &&
                JSON.stringify(value.confidence) ===
                  JSON.stringify(latest.current.confidence) &&
                JSON.stringify(value.pendingAnswers) ===
                  JSON.stringify(latest.current.pendingAnswers)
                ? "saved"
                : "unsaved",
            );
          return saved;
        } catch (e) {
          if (!disposed.current) {
            setStatus("error");
            setError(e);
          }
          throw e;
        }
      });
    queue.current = job;
    return job;
  }, [service, initial.id, snapshot, cache]);
  const commit = useCallback(
    (update: (previous: ExamProgress) => ExamProgress) => {
      if (locked.current) return;
      const next = normalizeProgress(update(snapshot()), initial.questions);
      latest.current = next;
      setProgress(next);
      setStatus("unsaved");
      cache();
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => {
        void flush().catch(() => {});
      }, 350);
    },
    [initial.questions, snapshot, cache, flush],
  );
  useEffect(() => {
    disposed.current = false;
    const visibility = () => {
      if (document.hidden) {
        cache();
        void flush().catch(() => {});
      }
    };
    const pageHide = () => cache();
    const interval = setInterval(() => {
      if (!document.hidden && !locked.current) void flush().catch(() => {});
    }, 30_000);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", pageHide);
    return () => {
      disposed.current = true;
      clearInterval(interval);
      if (debounce.current) clearTimeout(debounce.current);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", pageHide);
      if (!locked.current) {
        cache();
        void flush().catch(() => {});
      }
    };
  }, [cache, flush]);
  async function finish() {
    locked.current = true;
    clock.current.stopped = Date.now();
    if (debounce.current) clearTimeout(debounce.current);
    setStatus("saving");
    setError(null);
    try {
      await queue.current.catch(() => lastSaved.current);
      const saved = await service.finish(
        initial.id,
        snapshot(),
        version.current,
      );
      version.current = saved.version;
      lastSaved.current = saved;
      try {
        localStorage.removeItem(draftKey(initial));
      } catch {}
      setStatus("saved");
      return saved;
    } catch (e) {
      locked.current = false;
      clock.current = { start: Date.now(), elapsed: elapsed(), stopped: null };
      setStatus("error");
      setError(e);
      throw e;
    }
  }
  async function saveAndExit() {
    const saved = await flush();
    locked.current = true;
    clock.current.stopped = Date.now();
    return saved;
  }
  return {
    saveAndExit,
    progress,
    commit,
    flush,
    finish,
    elapsed,
    status,
    error,
    draftPersistent,
  };
}
