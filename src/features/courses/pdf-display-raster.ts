import { recolorPdfPaper } from "./pdf-paper-colors";
import { PdfPaperWorkerClient } from "./pdf-paper-worker-client";
import { yieldPdfTask } from "./pdf-text-stream";

export interface PdfPaperColors { paper: string; ink: string }
export const PDF_COLOR_CHUNK_PIXELS = 32_768;

/** A separate, cached display copy; PDF bytes and the original raster stay intact. */
export async function preparePdfPaper(
  source: HTMLCanvasElement,
  colors: PdfPaperColors,
  cancelled: () => boolean,
): Promise<HTMLCanvasElement> {
  await yieldPdfTask(); // Fallback for browsers/CSP without the worker path.
  if (cancelled() || !source.width) throw new Error("PDF closed");
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  try {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas is unavailable");
    context.drawImage(source, 0, 0);
    const rows = Math.max(1, Math.floor(PDF_COLOR_CHUNK_PIXELS / canvas.width));
    for (let y = 0; y < canvas.height; y += rows) {
      if (cancelled() || !source.width) throw new Error("PDF closed");
      const pixels = context.getImageData(0, y, canvas.width, Math.min(rows, canvas.height - y));
      recolorPdfPaper(pixels.data, colors.paper, colors.ink);
      context.putImageData(pixels, 0, y);
      if (y + rows < canvas.height) await yieldPdfTask();
    }
    return canvas;
  } catch (error) {
    canvas.width = canvas.height = 0;
    throw error;
  }
}

/** One current tone per source raster, shared by the spread and animated leaf. */
export class PdfDisplayCache {
  private entries = new WeakMap<HTMLCanvasElement, { key: string; promise: Promise<HTMLCanvasElement> }>();
  private worker: PdfPaperWorkerClient | undefined;
  private async prepare(source: HTMLCanvasElement, colors: PdfPaperColors, cancelled: () => boolean) {
    if (typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined" && typeof createImageBitmap === "function") {
      this.worker ??= new PdfPaperWorkerClient();
      if (this.worker.available) {
        try { return await this.worker.prepare(source, colors, cancelled); }
        catch { if (cancelled()) throw new Error("PDF closed"); }
      }
    }
    return preparePdfPaper(source, colors, cancelled);
  }
  get(source: HTMLCanvasElement, colors: PdfPaperColors, cancelled: () => boolean) {
    const key = colors.paper + ":" + colors.ink;
    const previous = this.entries.get(source);
    if (previous?.key === key) return previous.promise;
    const promise = this.prepare(source, colors, cancelled);
    this.entries.set(source, { key, promise });
    // Release an old tone once its consumers have had a chance to copy it.
    if (previous) this.release(previous.promise);
    void promise.catch(() => {
      if (this.entries.get(source)?.promise === promise) this.entries.delete(source);
    });
    return promise;
  }
  drop(source: HTMLCanvasElement) {
    const entry = this.entries.get(source);
    this.entries.delete(source);
    if (entry) this.release(entry.promise);
  }
  private release(promise: Promise<HTMLCanvasElement>) {
    void promise.then((canvas) => {
      setTimeout(() => { canvas.width = canvas.height = 0; }, 0);
    }, () => {});
  }
  dispose() { this.worker?.dispose(); }
}
