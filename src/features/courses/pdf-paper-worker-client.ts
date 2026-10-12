import type { PdfPaperColors } from "./pdf-display-raster";

export interface PaperWorkerRequest extends PdfPaperColors { id: number; bitmap: ImageBitmap }
export type PaperWorkerResponse = { id: number; bitmap: ImageBitmap } | { id: number; error: string };

/** One worker per reader. It owns pixel conversion; transferred bitmaps have explicit cleanup. */
export class PdfPaperWorkerClient {
  private worker: Worker | null = null;
  private sequence = 0;
  private failed = false;
  private pending = new Map<number, { resolve: (bitmap: ImageBitmap) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  constructor(private createWorker = () => new Worker(new URL("./pdf-paper.worker.ts", import.meta.url), { type: "module" })) {}
  get available() { return !this.failed; }
  async prepare(source: HTMLCanvasElement, colors: PdfPaperColors, cancelled: () => boolean): Promise<HTMLCanvasElement> {
    const bitmap = await createImageBitmap(source);
    if (cancelled() || this.failed) { bitmap.close(); throw new Error("PDF closed"); }
    let converted: ImageBitmap;
    try { converted = await this.convert(bitmap, colors); }
    catch (error) { bitmap.close(); throw error; }
    let target: HTMLCanvasElement | undefined;
    try {
      if (cancelled()) throw new Error("PDF closed");
      target = document.createElement("canvas");
      target.width = converted.width;
      target.height = converted.height;
      const context = target.getContext("bitmaprenderer");
      if (context) context.transferFromImageBitmap(converted);
      else {
        const fallback = target.getContext("2d");
        if (!fallback) { target.width = target.height = 0; throw new Error("Canvas is unavailable"); }
        fallback.drawImage(converted, 0, 0);
      }
      return target;
    } catch (error) {
      if (target) target.width = target.height = 0;
      throw error;
    } finally { converted.close(); }
  }
  private convert(bitmap: ImageBitmap, colors: PdfPaperColors): Promise<ImageBitmap> {
    try {
      if (!this.worker) {
        this.worker = this.createWorker();
        this.worker.onmessage = (event: MessageEvent<PaperWorkerResponse>) => {
          const response = event.data;
          const request = this.pending.get(response.id);
          if (!request) { if ("bitmap" in response) response.bitmap.close(); return; }
          clearTimeout(request.timer);
          this.pending.delete(response.id);
          if ("bitmap" in response) request.resolve(response.bitmap);
          else request.reject(new Error(response.error));
        };
        this.worker.onerror = () => this.stop(new Error("PDF color worker is unavailable"));
        this.worker.onmessageerror = () => this.stop(new Error("PDF color worker response failed"));
      }
    } catch (error) {
      this.stop(new Error("PDF color worker is unavailable"));
      return Promise.reject(error);
    }
    const id = ++this.sequence;
    return new Promise<ImageBitmap>((resolve, reject) => {
      const timer = setTimeout(() => this.stop(new Error("PDF color worker timed out")), 2000);
      this.pending.set(id, { resolve, reject, timer });
      try { this.worker!.postMessage({ id, bitmap, ...colors } satisfies PaperWorkerRequest, [bitmap]); }
      catch (error) { this.stop(error instanceof Error ? error : new Error("PDF color transfer failed")); }
    });
  }
  private stop(error: Error) {
    this.failed = true;
    this.worker?.terminate();
    this.worker = null;
    for (const request of this.pending.values()) { clearTimeout(request.timer); request.reject(error); }
    this.pending.clear();
  }
  dispose() { this.stop(new Error("PDF closed")); }
}
