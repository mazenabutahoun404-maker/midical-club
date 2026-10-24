/** Stable, untransformed hit geometry prevents enlarged books changing their own focus target. */
export function bookPlacement(index: number, count: number) {
  const columns = Math.min(count, 4),
    rows = Math.ceil(count / columns);
  const row = Math.floor(index / columns),
    inRow = Math.min(columns, count - row * columns);
  const column = index % columns;
  return {
    x: (column + 0.5) / inRow,
    y: rows === 1 ? 0.5 : row === 0 ? 0.265 : 0.735,
    scale: rows === 1 ? 0.9 : 0.77,
    angle: (column - (inRow - 1) / 2) * 3.2,
  };
}
export function constellationHit(
  x: number,
  y: number,
  width: number,
  height: number,
  count: number,
  rtl: boolean,
  current: number,
) {
  if (!width || !height) return -1;
  const distances = Array.from({ length: count }, (_, i) => {
    const a = bookPlacement(i, count),
      ax = (rtl ? 1 - a.x : a.x) * width;
    return Math.hypot(
      (x - ax) / (width / Math.min(count, 4)),
      (y - a.y * height) / 340,
    );
  });
  const closest = distances.indexOf(Math.min(...distances));
  if (distances[closest] > 0.71) return -1;
  // Hysteresis belongs to the stationary slots, never to transformed DOM bounds.
  return current >= 0 && distances[current] <= distances[closest] + 0.1
    ? current
    : closest;
}
