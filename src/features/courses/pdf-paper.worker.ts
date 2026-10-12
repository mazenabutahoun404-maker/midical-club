import { recolorPdfPaper } from "./pdf-paper-colors";
import type { PaperWorkerRequest, PaperWorkerResponse } from "./pdf-paper-worker-client";

const scope = self as unknown as {
  onmessage: (event: MessageEvent<PaperWorkerRequest>) => void;
  postMessage: (message: PaperWorkerResponse, transfer?: Transferable[]) => void;
};
scope.onmessage = (event) => {
  const { id, bitmap, paper, ink } = event.data;
  let canvas: OffscreenCanvas | undefined;
  let output: ImageBitmap | undefined;
  try {
    canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("PDF color canvas is unavailable");
    context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    recolorPdfPaper(pixels.data, paper, ink);
    context.putImageData(pixels, 0, 0);
    output = canvas.transferToImageBitmap();
    scope.postMessage({ id, bitmap: output }, [output]);
    output = undefined;
  } catch (error) {
    scope.postMessage({ id, error: error instanceof Error ? error.message : "PDF color preparation failed" });
  } finally {
    bitmap.close();
    output?.close();
    if (canvas) canvas.width = canvas.height = 0;
  }
};
