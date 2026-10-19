import type { AuthFeedback } from "../AuthJourney";
export interface AnatomyState {
  progress: number;
  registering: boolean;
  feedback: AuthFeedback;
  focused: boolean;
  dark: boolean;
  accent: string;
}
export const clampProgress = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(6, value)) : 0;
export function automaticAnatomy3D({
  reduced,
  saveData,
  memory,
  cores,
}: {
  reduced: boolean;
  saveData?: boolean;
  memory?: number;
  cores?: number;
}) {
  return (
    !reduced &&
    !saveData &&
    (memory === undefined || memory > 2) &&
    (cores === undefined || cores > 2)
  );
}
