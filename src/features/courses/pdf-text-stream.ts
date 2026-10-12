import type { TextContent } from "../../vendor/pdfjs/pdf.min.mjs";

/** Give controls/painting a task between batches, including when PDF text is cached. */
export function yieldPdfTask(): Promise<void> {
  const scheduler = (globalThis as typeof globalThis & { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (scheduler?.yield) return scheduler.yield();
  return new Promise<void>((resolve) => {
    if (typeof MessageChannel === "undefined") { setTimeout(resolve, 0); return; }
    const channel = new MessageChannel();
    channel.port1.onmessage = () => { channel.port1.close(); channel.port2.close(); resolve(); };
    channel.port2.postMessage(null);
  });
}
export const PDF_TEXT_BATCH_SIZE = 80;
export function pdfTextStream(text: TextContent): ReadableStream<TextContent> {
  let offset = 0;
  let cancelled = false;
  return new ReadableStream<TextContent>({
    async pull(controller) {
      await yieldPdfTask();
      if (cancelled) return;
      if (offset >= text.items.length) { controller.close(); return; }
      controller.enqueue({ ...text, items: text.items.slice(offset, offset + PDF_TEXT_BATCH_SIZE) });
      offset += PDF_TEXT_BATCH_SIZE;
    },
    cancel() { cancelled = true; },
  });
}
