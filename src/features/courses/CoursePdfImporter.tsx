import { useEffect, useRef, useState } from "react";
import { AlertTriangle, BookOpen, CheckCircle2, FileText, Upload } from "lucide-react";
import type { CourseSectionKind } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";

const maxBytes = 30 * 1024 * 1024;
const copy = {
  en: {
    title: "Place PDF material",
    body: "Drop course PDFs here or choose them from your device.",
    choose: "Choose PDF files",
    limit: "PDF only · up to 30 MB each · maximum 8 at once",
    ready: "Release to place the PDF into this section",
    importing: "Placing PDF into the notebook…",
    success: "PDF material added to this device",
    invalid: "Choose valid PDF files under 30 MB.",
    storage: "Device-local preview. Publishing and shared storage require the course API.",
  },
  ar: {
    title: "إضافة مادة PDF",
    body: "أسقط ملفات المساق هنا أو اخترها من جهازك.",
    choose: "اختر ملفات PDF",
    limit: "PDF فقط · حتى 30 ميجابايت للملف · 8 ملفات كحد أقصى",
    ready: "أفلت الملف لإضافته إلى هذا القسم",
    importing: "تتم إضافة الملف إلى الدفتر…",
    success: "أضيف ملف PDF إلى هذا الجهاز",
    invalid: "اختر ملفات PDF صالحة بحجم أقل من 30 ميجابايت.",
    storage: "معاينة محلية على الجهاز. النشر والتخزين المشترك يحتاجان إلى واجهة المساق البرمجية.",
  },
} as const;

type State = "idle" | "dragging" | "landing" | "success" | "error";

export function CoursePdfImporter({
  section,
  pending,
  onImport,
}: {
  section: CourseSectionKind;
  pending: boolean;
  onImport: (files: File[]) => Promise<string[]>;
}) {
  const { locale } = useLocale();
  const c = copy[locale];
  const input = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [state, setState] = useState<State>("idle");
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function valid(files: File[]) {
    return files.slice(0, 8).filter((file) =>
      file.size > 0 &&
      file.size <= maxBytes &&
      (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")),
    );
  }

  async function place(list: FileList | File[]) {
    const files = valid([...list]);
    if (!files.length || files.length !== Math.min(8, list.length)) {
      setState("error");
      return;
    }
    setState("landing");
    const ids = await onImport(files);
    setState(ids.length ? "success" : "error");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
    if (input.current) input.current.value = "";
  }

  return (
    <section
      className="course-pdf-importer"
      data-state={pending ? "landing" : state}
      aria-labelledby={`pdf-import-${section}`}
      onDragEnter={(event) => {
        event.preventDefault();
        depth.current += 1;
        setState("dragging");
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (!depth.current) setState("idle");
      }}
      onDrop={(event) => {
        event.preventDefault();
        depth.current = 0;
        void place(event.dataTransfer.files);
      }}
    >
      <div className="pdf-import-object" aria-hidden="true">
        <span className="pdf-import-book"><BookOpen size={28} /><i /></span>
        <span className="pdf-import-paper"><FileText size={25} /><b>PDF</b></span>
        <span className="pdf-import-check"><CheckCircle2 size={24} /></span>
        <span className="pdf-import-error"><AlertTriangle size={24} /></span>
      </div>
      <div className="pdf-import-copy">
        <h3 id={`pdf-import-${section}`}>{c.title}</h3>
        <p aria-live="polite" role={state === "error" ? "alert" : "status"}>{state === "dragging" ? c.ready : state === "landing" || pending ? c.importing : state === "success" ? c.success : state === "error" ? c.invalid : c.body}</p>
        <small>{state === "idle" ? c.limit : c.storage}</small>
      </div>
      <input
        ref={input}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        onChange={(event) => event.target.files && void place(event.target.files)}
      />
      <button type="button" className="notebook-button notebook-button-primary" disabled={pending} onClick={() => input.current?.click()}>
        <Upload size={17} />
        {c.choose}
      </button>
      <p className="pdf-import-boundary">{c.storage}</p>
    </section>
  );
}
