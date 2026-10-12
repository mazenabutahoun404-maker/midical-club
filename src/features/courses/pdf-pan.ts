/** The pan canvas always uses physical LTR scrolling; page order keeps the locale. */
export function pdfPanLimit(contentWidth: number, viewportWidth: number) {
  return Math.max(0, contentWidth - Math.max(0, viewportWidth));
}
export function pdfPanOffset(value: number, limit: number) {
  return Math.max(0, Math.min(limit, Number.isFinite(value) ? value : 0));
}
