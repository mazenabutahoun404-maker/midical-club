import workerUrl from "../../vendor/pdfjs/pdf.worker.min.mjs?url";
import type {
  PDFDocumentProxy,
  PDFDocumentLoadingTask,
  PageViewport,
  RenderTask,
  TextContent,
} from "../../vendor/pdfjs/pdf.min.mjs";

const assets = import.meta.glob<string>(
  "../../vendor/pdfjs/{cmaps,standard_fonts,wasm}/*",
  { query: "?url", eager: true, import: "default" },
);
class LocalBinaryDataFactory {
  async fetch({ kind, filename }: { kind: string; filename: string }) {
    const folder =
      kind === "cMapUrl"
        ? "cmaps"
        : kind === "standardFontDataUrl"
          ? "standard_fonts"
          : kind === "wasmUrl"
            ? "wasm"
            : undefined;
    const url =
      folder && assets["../../vendor/pdfjs/" + folder + "/" + filename];
    if (!url) throw new Error("Missing PDF rendering asset");
    const response = await fetch(url);
    if (!response.ok) throw new Error("Unable to load PDF rendering asset");
    return new Uint8Array(await response.arrayBuffer());
  }
}
export async function openPdf(
  url: string,
  password: (update: (password: string) => void, incorrect: boolean) => void,
) {
  const api = await import("../../vendor/pdfjs/pdf.min.mjs");
  api.GlobalWorkerOptions.workerSrc = workerUrl;
  const task = api.getDocument({
    url,
    cMapPacked: true,
    useWorkerFetch: false,
    useSystemFonts: false,
    BinaryDataFactory: LocalBinaryDataFactory,
    canvasMaxAreaInBytes: 32 * 1024 * 1024,
    enableXfa: false,
  });
  task.onPassword = (update, reason) => password(update, reason === 2);
  return { task, api };
}
export type PdfApi = Awaited<ReturnType<typeof openPdf>>["api"];
export type { PDFDocumentProxy, PDFDocumentLoadingTask };
export interface PageRaster {
  canvas: HTMLCanvasElement;
  viewport: PageViewport;
  text: TextContent;
}

/** Only nearby pages are rasterized. At most two jobs and eight cached pages. */
export class PdfRasterPool {
  private entries = new Map<string, Promise<PageRaster>>();
  private tasks = new Set<RenderTask>();
  private waiting: Array<() => void> = [];
  private active = 0;
  private disposed = false;
  constructor(
    readonly document: PDFDocumentProxy,
    readonly api: PdfApi,
  ) {}
  get(pageNumber: number, cssWidth: number): Promise<PageRaster> {
    const width = Math.max(120, Math.round(cssWidth / 8) * 8);
    const key = pageNumber + ":" + width;
    const existing = this.entries.get(key);
    if (existing) {
      this.entries.delete(key);
      this.entries.set(key, existing);
      return existing;
    }
    const promise = new Promise<PageRaster>((resolve, reject) => {
      this.waiting.push(() => {
        if (this.disposed) {
          reject(new Error("PDF closed"));
          return;
        }
        this.active++;
        this.render(pageNumber, width)
          .then(resolve, reject)
          .finally(() => {
            this.active--;
            this.pump();
          });
      });
      this.pump();
    });
    this.entries.set(key, promise);
    void promise.catch(() => {
      if (this.entries.get(key) === promise) this.entries.delete(key);
    });
    while (this.entries.size > 8) {
      const oldest = this.entries.keys().next().value!;
      const released = this.entries.get(oldest)!;
      this.entries.delete(oldest);
      void released.then(
        (raster) => {
          if (!this.entries.has(oldest)) {
            raster.canvas.width = 0;
            raster.canvas.height = 0;
          }
        },
        () => {},
      );
    }
    return promise;
  }
  private pump() {
    while (this.active < 2 && this.waiting.length) this.waiting.shift()!();
  }
  private async render(pageNumber: number, width: number): Promise<PageRaster> {
    const page = await this.document.getPage(pageNumber);
    if (this.disposed) throw new Error("PDF closed");
    const natural = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: width / natural.width });
    const pixelBudget = window.innerWidth < 768 ? 1_200_000 : 2_000_000;
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      2,
      Math.sqrt(pixelBudget / (viewport.width * viewport.height)),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width * ratio));
    canvas.height = Math.max(1, Math.floor(viewport.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable");
    const task = page.render({
      canvas,
      canvasContext: context,
      viewport,
      transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
      background: "#ffffff",
    });
    this.tasks.add(task);
    try {
      await task.promise;
      const text = await page.getTextContent();
      if (this.disposed) throw new Error("PDF closed");
      return { canvas, viewport, text };
    } catch (error) {
      canvas.width = 0;
      canvas.height = 0;
      throw error;
    } finally {
      this.tasks.delete(task);
    }
  }
  dispose() {
    this.disposed = true;
    this.tasks.forEach((task) => task.cancel());
    this.tasks.clear();
    const waiting = this.waiting.splice(0);
    waiting.forEach((run) => run());
    this.entries.forEach((promise) => {
      void promise.then(
        (raster) => {
          raster.canvas.width = 0;
          raster.canvas.height = 0;
        },
        () => {},
      );
    });
    this.entries.clear();
  }
}
