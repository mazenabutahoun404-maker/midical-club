export type TurnDirection = 1 | -1;
export function spreadStart(page: number, twoPages: boolean) {
  return twoPages
    ? Math.floor((Math.max(1, page) - 1) / 2) * 2 + 1
    : Math.max(1, page);
}
export function nextSpread(
  page: number,
  count: number,
  twoPages: boolean,
  direction: TurnDirection,
) {
  const next = spreadStart(page, twoPages) + direction * (twoPages ? 2 : 1);
  return next >= 1 && next <= count ? next : null;
}
export function dragProgress(
  start: number,
  current: number,
  width: number,
  direction: TurnDirection,
  rtl: boolean,
) {
  const sign = direction * (rtl ? -1 : 1);
  return Math.max(
    0,
    Math.min(1, ((start - current) * sign) / Math.max(80, width * 0.65)),
  );
}
export function shouldCommitTurn(progress: number, inwardVelocity: number) {
  return progress >= 0.24 || (progress >= 0.06 && inwardVelocity > 0.35);
}
