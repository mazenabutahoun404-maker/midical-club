/** Trace shaped text once; SVG interpolates the geometry without frame-by-frame JS.
 * Arabic is rendered as a complete string, so its joining and counters survive. */
export type VitalContour = { from: string; to: string; delay: number };
export type VitalDrawing = {
  width: number;
  height: number;
  wave: string;
  contours: VitalContour[];
};
type Point = [number, number];
const cache = new Map<string, VitalDrawing>();
const pulse: Point[] = [
  [0, 0],
  [0.2, 0],
  [0.235, -0.08],
  [0.26, 0.1],
  [0.29, -0.35],
  [0.325, 0.38],
  [0.355, -0.13],
  [0.39, 0],
  [1, 0],
];
const n = (v: number) => Math.round(v * 10) / 10;
function pulseY(t: number, height: number) {
  const i = Math.max(
    1,
    pulse.findIndex((p) => p[0] >= t),
  );
  const a = pulse[i - 1],
    b = pulse[i];
  return height * (0.55 + a[1] + ((b[1] - a[1]) * (t - a[0])) / (b[0] - a[0]));
}
function resample(points: Point[], count: number): Point[] {
  const lengths = [0];
  for (let i = 1; i <= points.length; i++) {
    const a = points[i - 1],
      b = points[i % points.length];
    lengths.push(lengths[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  let edge = 1;
  return Array.from({ length: count }, (_, i) => {
    const at = (lengths.at(-1)! * i) / count;
    while (edge < lengths.length - 1 && lengths[edge] < at) edge++;
    const a = points[edge - 1],
      b = points[edge % points.length];
    const t =
      (at - lengths[edge - 1]) / (lengths[edge] - lengths[edge - 1] || 1);
    return [n(a[0] + (b[0] - a[0]) * t), n(a[1] + (b[1] - a[1]) * t)];
  });
}
const path = (points: Point[]) =>
  points.map((p, i) => (i ? "L" : "M") + n(p[0]) + " " + n(p[1])).join("") +
  "Z";

export function traceWelcome(
  ink: HTMLElement,
  dir: string,
  index: number,
): VitalDrawing | null {
  const rect = ink.getBoundingClientRect(),
    css = getComputedStyle(ink);
  const size = parseFloat(css.fontSize),
    scale = Math.min(2, 100 / size);
  if (!rect.width || rect.height > parseFloat(css.lineHeight) * 1.4)
    return null;
  const width = Math.ceil(rect.width * scale),
    height = Math.ceil(rect.height * scale);
  if (width * height > 240_000) return null;
  const text = ink.querySelector("[data-vital-text]")?.textContent || "";
  const key = [
    text,
    dir,
    css.fontFamily,
    css.fontWeight,
    width,
    height,
    index,
  ].join(":");
  if (cache.has(key)) return cache.get(key)!;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.font =
    css.fontStyle +
    " " +
    css.fontWeight +
    " " +
    size * scale +
    "px " +
    css.fontFamily;
  ctx.direction = dir === "rtl" ? "rtl" : "ltr";
  ctx.textAlign = dir === "rtl" ? "right" : "left";
  ctx.fillStyle = "#fff";
  const probe = ink.querySelector<HTMLElement>(".vital-baseline")!;
  const baseline = (probe.getBoundingClientRect().top - rect.top) * scale;
  ctx.fillText(text, dir === "rtl" ? width : 0, baseline);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const filled = (x: number, y: number) =>
    x >= 0 &&
    y >= 0 &&
    x < width &&
    y < height &&
    pixels[(y * width + x) * 4 + 3] > 110;
  const stride = width + 1,
    edges = new Map<number, number[]>();
  const edge = (x: number, y: number, a: number, b: number) => {
    const start = y * stride + x,
      end = b * stride + a;
    const found = edges.get(start);
    if (found) found.push(end);
    else edges.set(start, [end]);
  };
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      if (!filled(x, y)) continue;
      if (!filled(x, y - 1)) edge(x, y, x + 1, y);
      if (!filled(x + 1, y)) edge(x + 1, y, x + 1, y + 1);
      if (!filled(x, y + 1)) edge(x + 1, y + 1, x, y + 1);
      if (!filled(x - 1, y)) edge(x, y + 1, x, y);
    }
  const contours: VitalContour[] = [];
  let total = 0;
  while (edges.size && total < 5200) {
    const first = edges.keys().next().value!;
    const raw: Point[] = [];
    let current = first;
    do {
      raw.push([current % stride, Math.floor(current / stride)]);
      const next = edges.get(current);
      if (!next?.length) break;
      const end = next.pop()!;
      if (!next.length) edges.delete(current);
      current = end;
    } while (current !== first && raw.length < 8000);
    if (raw.length < 8) continue;
    const min = Math.min(...raw.map((p) => p[0])),
      max = Math.max(...raw.map((p) => p[0]));
    const points = resample(
      raw,
      Math.min(240, Math.max(20, Math.round(raw.length * 0.6))),
    );
    total += points.length;
    const original = points.map((_, i): Point => {
      const t = i / points.length;
      const x = min + (max - min) * (t <= 0.5 ? t * 2 : 2 - t * 2);
      return [x, pulseY(dir === "rtl" ? 1 - x / width : x / width, height)];
    });
    const position =
      dir === "rtl" ? 1 - (min + max) / 2 / width : (min + max) / 2 / width;
    contours.push({
      from: path(original),
      to: path(points),
      delay: 0.5 + index * 0.32 + position * 0.7,
    });
  }
  if (!contours.length) return null;
  const wave = pulse
    .map(
      ([t], i) =>
        (i ? "L" : "M") +
        n((dir === "rtl" ? 1 - t : t) * width) +
        " " +
        n(pulseY(t, height)),
    )
    .join("");
  const drawing = { width, height, wave, contours };
  cache.set(key, drawing);
  if (cache.size > 12) cache.delete(cache.keys().next().value!);
  return drawing;
}
