export interface SearchAnchor {
  left: number;
  top: number;
  width: number;
  height: number;
}
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, Math.max(min, max)));
/** The glyph stays at the clicked control. Only the adjacent input reveals.
 * Header results sit below it; a bottom phone control opens results upward.
 * Visual-viewport offsets keep the input reachable above an on-screen keyboard.
 */
export function searchPlacement(
  anchor: SearchAnchor | null,
  viewport: { width: number; height: number; left?: number; top?: number },
  rtl: boolean,
) {
  const inset = 12,
    gap = 8,
    iconSize = 40,
    barHeight = 48;
  const vx = viewport.left ?? 0,
    vy = viewport.top ?? 0;
  const right = vx + viewport.width - inset,
    bottom = vy + viewport.height - inset;
  const iconLeft = clamp(
    anchor
      ? anchor.left + anchor.width / 2 - iconSize / 2
      : rtl
        ? vx + 20
        : right - iconSize,
    vx + inset,
    right - iconSize,
  );
  const entryTop = clamp(
    anchor ? anchor.top + anchor.height / 2 - barHeight / 2 : vy + 16,
    vy + inset,
    bottom - barHeight,
  );
  const roomLeft = iconLeft - gap - vx - inset;
  const roomRight = right - iconLeft - iconSize - gap;
  const extendsLeft = roomLeft === roomRight ? !rtl : roomLeft > roomRight;
  const barWidth = Math.max(
    0,
    Math.min(480, extendsLeft ? roomLeft : roomRight),
  );
  const barLeft = extendsLeft
    ? iconLeft - gap - barWidth
    : iconLeft + iconSize + gap;
  const width = Math.max(0, Math.min(640, viewport.width - inset * 2));
  const left = clamp(
    extendsLeft ? iconLeft + iconSize - width : iconLeft,
    vx + inset,
    right - width,
  );
  const spaceBelow = Math.max(0, bottom - entryTop - barHeight - gap);
  const spaceAbove = Math.max(0, entryTop - gap - vy - inset);
  const above =
    spaceBelow < Math.min(240, viewport.height * 0.42) &&
    spaceAbove > spaceBelow;
  const resultsHeight = Math.min(540, above ? spaceAbove : spaceBelow);
  const top = above ? entryTop - gap - resultsHeight : entryTop;
  return {
    left,
    top,
    width,
    above,
    extendsLeft,
    barWidth,
    barHeight,
    resultsHeight,
    height: barHeight + gap + resultsHeight,
    barLeft: barLeft - left,
    barTop: entryTop - top,
    iconLeft: iconLeft - left,
    iconTop: entryTop - top + (barHeight - iconSize) / 2,
    resultsTop: above ? 0 : barHeight + gap,
  };
}
