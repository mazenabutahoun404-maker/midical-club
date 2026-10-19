export const MAX_PDF_ZOOM = 1.75;
export const MIN_PDF_ZOOM = 0.25;
/** PDF points convert to CSS pixels at 96/72. 100% is independent of the screen. */
export function pdfFitZoom(
  width: number,
  twoPages: boolean,
  naturalWidth: number,
) {
  const available = (width - (twoPages ? 26 : 0) - 4) / (twoPages ? 2 : 1);
  return Math.max(0.01, Math.min(1, available / Math.max(1, naturalWidth)));
}
/** Fit the actual page proportions in both axes; short screens may need <25%. */
export function pdfFitPageZoom(
  width: number,
  height: number,
  twoPages: boolean,
  naturalWidth: number,
  normalizedHeight: number,
) {
  const across =
    (width - (twoPages ? 26 : 0) - 4) /
    (twoPages ? 2 : 1) /
    Math.max(1, naturalWidth);
  return Math.max(
    0.01,
    Math.min(1, across, (height - 4) / Math.max(1, normalizedHeight)),
  );
}
export function pdfViewGeometry(
  _width: number,
  twoPages: boolean,
  zoom: number,
  naturalWidth = (595.28 * 96) / 72,
) {
  const paperWidth = Math.round(naturalWidth * zoom);
  return {
    paperWidth,
    // A fixed source raster survives zoom, fitting, page layout and window resizing.
    rasterWidth: Math.min(
      4096,
      Math.round((naturalWidth * MAX_PDF_ZOOM) / 8) * 8,
    ),
    spreadWidth: paperWidth * (twoPages ? 2 : 1) + (twoPages ? 26 : 0),
  };
}
