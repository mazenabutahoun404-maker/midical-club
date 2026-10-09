export interface PdfImportProgress {
  completed: number;
  total: number;
  fileName: string;
  storage: "device" | "session";
}
export type PdfImportReporter = (progress: PdfImportProgress) => void;
export type ImportCoursePdfs = (
  files: File[],
  report?: PdfImportReporter,
) => Promise<string[]>;
export async function validateCoursePdf(file: File) {
  if (
    !file.size ||
    file.size > 30 * 1024 * 1024 ||
    !(file.type === "application/pdf" || /\.pdf$/i.test(file.name))
  )
    throw new Error("PDF_INVALID");
  const head = file.slice(0, 5);
  const bytes =
    typeof head.arrayBuffer === "function"
      ? await head.arrayBuffer()
      : await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as ArrayBuffer);
          reader.onerror = () => reject(new Error("PDF_INVALID"));
          reader.readAsArrayBuffer(head);
        });
  if (new TextDecoder().decode(bytes) !== "%PDF-")
    throw new Error("PDF_INVALID");
}
