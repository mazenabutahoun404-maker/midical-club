export const XRAY_DURATION = 1160;
export const authSceneMode = (path: string) =>
  path === "/auth/register" ? 1 : path === "/auth/verify" ? 1 : 0;
export const isElevatorSwap = (from: string, to: string) =>
  from !== to &&
  [from, to].every(
    (path) => path === "/auth/sign-in" || path === "/auth/register",
  );
/** One continuous trajectory drives the form, chest and crossing mask. */
export function elevatorPosition(from: number, to: number, elapsed: number) {
  const t = Math.max(0, Math.min(1, elapsed / XRAY_DURATION));
  const eased = t * t * t * (t * (t * 6 - 15) + 10);
  return from + (to - from) * eased;
}
export type XrayState = {
  dark: boolean;
  progress: number;
  focused: boolean;
  feedback: string;
  reduced: boolean;
};
