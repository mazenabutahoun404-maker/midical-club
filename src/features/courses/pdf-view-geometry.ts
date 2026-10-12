export const MAX_PDF_ZOOM = 1.75;
/** Zoom scales the display and text stage; the prepared raster identity stays fixed. */
export function pdfViewGeometry(width: number, twoPages: boolean, zoom: number) {
  const gutter = twoPages ? 26 : 0;
  const base = Math.max(160, Math.floor(((width - gutter - 4) / (twoPages ? 2 : 1)) / 8) * 8);
  return {
    paperWidth: Math.round(base * zoom),
    rasterWidth: Math.round(base * MAX_PDF_ZOOM / 8) * 8,
    spreadWidth: Math.round(base * zoom) * (twoPages ? 2 : 1) + gutter,
  };
}
