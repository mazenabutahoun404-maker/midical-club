export interface HeaderScrollState {
  y: number;
  direction: number;
  distance: number;
  hidden: boolean;
}
export const initialHeaderScroll = (y = 0): HeaderScrollState => ({
  y,
  direction: 0,
  distance: 0,
  hidden: false,
});
/** Directional hysteresis: a deliberate 200px descent hides, a 50px ascent reveals. */
export function advanceHeaderScroll(
  state: HeaderScrollState,
  nextY: number,
  held = false,
): HeaderScrollState {
  const y = Math.max(0, nextY);
  const delta = y - state.y;
  if (held || y === 0 || (y <= 20 && delta < 0))
    return initialHeaderScroll(y);
  if (Math.abs(delta) < 0.5) return { ...state, y };
  const direction = Math.sign(delta);
  let distance =
    direction === state.direction
      ? state.distance + Math.abs(delta)
      : Math.abs(delta);
  let hidden = state.hidden;
  if (
    (!hidden && direction === 1 && y >= 200 && distance >= 200) ||
    (hidden && direction === -1 && distance >= 50)
  ) {
    hidden = !hidden;
    distance = 0;
  }
  return { y, direction, distance, hidden };
}
