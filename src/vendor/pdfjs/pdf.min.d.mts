/** Narrow application contract for the unmodified PDF.js 6.4.299 distribution. */
export interface TextContent { items: Array<{ str?: string }>; styles: Record<string, unknown>; lang?: string | null }
export interface PageViewport { width: number; height: number; scale: number; userUnit?: number; rotation: number; rawDims: { pageWidth: number; pageHeight: number; pageX: number; pageY: number }; transform: number[] }
export interface RenderTask { promise: Promise<void>; cancel: () => void }
export interface PDFPageProxy {
  getViewport(options: { scale: number; rotation?: number }): PageViewport;
  getTextContent(): Promise<TextContent>;
  render(options: { canvas: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D; viewport: PageViewport; transform?: number[]; background?: string }): RenderTask;
}
export interface PDFDocumentProxy { numPages: number; getPage(page: number): Promise<PDFPageProxy>; destroy(): Promise<void> }
export interface PDFDocumentLoadingTask { promise: Promise<PDFDocumentProxy>; onPassword: ((update: (password: string) => void, reason: number) => void) | null; destroy(): Promise<void> }
export const GlobalWorkerOptions: { workerSrc: string };
export function getDocument(options: Record<string, unknown>): PDFDocumentLoadingTask;
export class TextLayer {
  constructor(options: { textContentSource: TextContent; container: HTMLDivElement; viewport: PageViewport });
  render(): Promise<void>;
  cancel(): void;
}
