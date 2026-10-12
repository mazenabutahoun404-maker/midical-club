/** Only the visual leaf subscribes to animation frames, never the reader tree. */
export function createTurnMotion() {
  let progress = 0;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => progress,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    setProgress(value: number) {
      if (progress === value) return;
      progress = value;
      listeners.forEach((listener) => listener());
    },
  };
}
export type TurnMotion = ReturnType<typeof createTurnMotion>;
export function turnStageChanged(
  previous: { direction: number; progress: number; settling: boolean } | null,
  next: { direction: number; progress: number; settling: boolean } | null,
) {
  return !previous || !next || previous.direction !== next.direction ||
    previous.settling !== next.settling || (previous.progress >= .5) !== (next.progress >= .5);
}
