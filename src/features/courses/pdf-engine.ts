import workerUrl from "../../vendor/pdfjs/pdf.worker.min.mjs?url";
import { PdfDisplayCache, type PdfPaperColors } from "./pdf-display-raster";
import { pdfTextStream } from "./pdf-text-stream";
import type {
  PDFDocumentProxy,
  PDFDocumentLoadingTask,
  PageViewport,
  RenderTask,
  TextContent,
} from "../../vendor/pdfjs/pdf.min.mjs";

const assets = import.meta.glob<string>(
  "../../vendor/pdfjs/{cmaps,standard_fonts,wasm}/*",
  { query: "?url", import: "default" },
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
    const load =
      folder && assets["../../vendor/pdfjs/" + folder + "/" + filename];
    if (!load) throw new Error("Missing PDF rendering asset");
    const url = await load();
    const response = await fetch(url);
    if (!response.ok) throw new Error("Unable to load PDF rendering asset");
    return new Uint8Array(await response.arrayBuffer());
  }
}
export async function openPdf(
  url: string,
  password: (update: (password: string) => void, incorrect: boolean) => void,
  signal?: AbortSignal,
) {
  const api = await import("../../vendor/pdfjs/pdf.min.mjs");
  if (signal?.aborted) throw new DOMException("PDF closed", "AbortError");
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
export type { PDFDocumentProxy, PDFDocumentLoadingTask, TextContent };
export interface PageRaster {
  canvas: HTMLCanvasElement;
  viewport: PageViewport;
}

/** Visible pages precede prefetches. One raster job and eight cached source pages. */
export class PdfRasterPool {
  private entries = new Map<string, Promise<PageRaster>>();
  private tasks = new Set<RenderTask>();
  private waiting: Array<{ key: string; background: boolean; run: () => void; cancel: () => void }> = [];
  private backgroundTimer: ReturnType<typeof setTimeout> | undefined;
  private displays = new PdfDisplayCache();
  private readyDisplays = new Map<string, PageRaster>();
  private text = new Map<number, Promise<TextContent>>();
  private textLayers = new Map<string, { promise: Promise<HTMLDivElement>; layer?: InstanceType<PdfApi["TextLayer"]>; container?: HTMLDivElement; cancelled: boolean }>();
  private active = 0;
  private disposed = false;
  constructor(
    readonly document: PDFDocumentProxy,
    readonly api: PdfApi,
  ) {}
  get(pageNumber: number, cssWidth: number, background = false): Promise<PageRaster> {
    if (this.disposed) return Promise.reject(new Error("PDF closed"));
    const width = Math.max(120, Math.round(cssWidth / 8) * 8);
    const key = pageNumber + ":" + width;
    const existing = this.entries.get(key);
    if (existing) {
      if (!background) {
        const waiting = this.waiting.find((entry) => entry.key === key);
        if (waiting) waiting.background = false;
        this.pump();
      }
      this.entries.delete(key);
      this.entries.set(key, existing);
      return existing;
    }
    const promise = new Promise<PageRaster>((resolve, reject) => {
      this.waiting.push({ key, background, cancel: () => reject(new Error("Page no longer needed")), run: () => {
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
      }});
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
      this.dropTextLayer(oldest);
      for (const key of this.readyDisplays.keys()) if (key.startsWith(oldest + ":")) this.readyDisplays.delete(key);
      const queued = this.waiting.findIndex((entry) => entry.key === oldest);
      if (queued >= 0) this.waiting.splice(queued, 1)[0].cancel();
      void released.then(
        (raster) => {
          if (this.entries.get(oldest) !== released) {
            this.displays.drop(raster.canvas);
            raster.canvas.width = 0;
            raster.canvas.height = 0;
          }
        },
        () => {},
      );
    }
    return promise;
  }
  async getDisplay(pageNumber: number, cssWidth: number, colors?: PdfPaperColors, background = false): Promise<PageRaster> {
    const raster = await this.get(pageNumber, cssWidth, background);
    const canvas = colors ? await this.displays.get(raster.canvas, colors, () => this.disposed) : raster.canvas;
    const display = { ...raster, canvas };
    if (!this.disposed && canvas.width) {
      this.readyDisplays.set(this.displayKey(pageNumber, cssWidth, colors), display);
      while (this.readyDisplays.size > 16) this.readyDisplays.delete(this.readyDisplays.keys().next().value!);
    }
    return display;
  }
  private displayKey(pageNumber: number, cssWidth: number, colors?: PdfPaperColors) {
    return pageNumber + ":" + Math.max(120, Math.round(cssWidth / 8) * 8) + ":" + (colors ? colors.paper + ":" + colors.ink : "original");
  }
  peekDisplay(pageNumber: number, cssWidth: number, colors?: PdfPaperColors): PageRaster | undefined {
    const display = this.readyDisplays.get(this.displayKey(pageNumber, cssWidth, colors));
    return !this.disposed && display?.canvas.width ? display : undefined;
  }
  getText(pageNumber: number): Promise<TextContent> {
    if (this.disposed) return Promise.reject(new Error("PDF closed"));
    const cached = this.text.get(pageNumber);
    if (cached) return cached;
    const work = this.document.getPage(pageNumber).then((page) => page.getTextContent());
    this.text.set(pageNumber, work);
    while (this.text.size > 16) this.text.delete(this.text.keys().next().value!);
    void work.catch(() => { if (this.text.get(pageNumber) === work) this.text.delete(pageNumber); });
    return work;
  }
  getTextLayer(pageNumber: number, cssWidth: number): Promise<HTMLDivElement> {
    if (this.disposed) return Promise.reject(new Error("PDF closed"));
    const key = pageNumber + ":" + Math.max(120, Math.round(cssWidth / 8) * 8);
    const cached = this.textLayers.get(key);
    if (cached) return cached.promise;
    const entry = { cancelled: false } as { promise: Promise<HTMLDivElement>; layer?: InstanceType<PdfApi["TextLayer"]>; container?: HTMLDivElement; cancelled: boolean };
    entry.promise = Promise.all([this.get(pageNumber, cssWidth), this.getText(pageNumber)]).then(async ([raster, text]) => {
      if (this.disposed || entry.cancelled) throw new Error("PDF closed");
      const container = document.createElement("div");
      container.className = "textLayer";
      container.style.setProperty("--total-scale-factor", String(raster.viewport.scale * (raster.viewport.userUnit || 1)));
      container.style.setProperty("--scale-round-x", "1px");
      container.style.setProperty("--scale-round-y", "1px");
      entry.container = container;
      entry.layer = new this.api.TextLayer({ container, viewport: raster.viewport, textContentSource: pdfTextStream(text) });
      await entry.layer.render();
      if (this.disposed || entry.cancelled) throw new Error("PDF closed");
      return container;
    });
    this.textLayers.set(key, entry);
    void entry.promise.catch(() => {
      entry.container?.remove();
      if (this.textLayers.get(key) === entry) this.textLayers.delete(key);
    });
    return entry.promise;
  }
  private dropTextLayer(key: string) {
    const entry = this.textLayers.get(key);
    if (!entry) return;
    entry.cancelled = true;
    entry.layer?.cancel();
    entry.container?.remove();
    this.textLayers.delete(key);
  }
  private pump() {
    if (this.disposed || this.active || !this.waiting.length) return;
    const visible = this.waiting.findIndex((entry) => !entry.background);
    if (visible >= 0) {
      clearTimeout(this.backgroundTimer);
      this.backgroundTimer = undefined;
      this.waiting.splice(visible, 1)[0].run();
    } else if (!this.backgroundTimer) {
      this.backgroundTimer = setTimeout(() => {
        this.backgroundTimer = undefined;
        if (!this.disposed && !this.active) this.waiting.shift()?.run();
      }, 32);
    }
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
      if (this.disposed) throw new Error("PDF closed");
      return { canvas, viewport };
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
    this.displays.dispose();
    clearTimeout(this.backgroundTimer);
    this.tasks.forEach((task) => task.cancel());
    this.tasks.clear();
    const waiting = this.waiting.splice(0);
    waiting.forEach((entry) => entry.run());
    this.entries.forEach((promise) => {
      void promise.then(
        (raster) => {
          this.displays.drop(raster.canvas);
          raster.canvas.width = 0;
          raster.canvas.height = 0;
        },
        () => {},
      );
    });
    this.entries.clear();
    this.readyDisplays.clear();
    for (const key of this.textLayers.keys()) this.dropTextLayer(key);
    this.text.clear();
  }
}
