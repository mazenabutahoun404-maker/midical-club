import { useEffect, useId, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FileText,
  Upload,
} from "lucide-react";
import type { CourseSectionKind } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import {
  validateCoursePdf,
  type ImportCoursePdfs,
  type PdfImportProgress,
} from "./pdf-import";

type State = "idle" | "dragging" | "landing" | "success" | "error";
export function CoursePdfImporter({
  section,
  pending,
  onImport,
  onRead,
}: {
  section: CourseSectionKind;
  pending: boolean;
  onImport: ImportCoursePdfs;
  onRead?: (id: string) => void;
}) {
  const { t } = useLocale(),
    id = useId();
  const input = useRef<HTMLInputElement>(null),
    depth = useRef(0),
    busy = useRef(false),
    alive = useRef(true);
  const [state, setState] = useState<State>("idle");
  const [files, setFiles] = useState<File[]>([]),
    [added, setAdded] = useState<string[]>([]);
  const [progress, setProgress] = useState<PdfImportProgress | null>(null);
  const [sessionOnly, setSessionOnly] = useState(false);
  useEffect(() => {
    if (state !== "success" || pending) return;
    const reset = window.setTimeout(() => {
      setState("idle");
      setFiles([]);
      setAdded([]);
      setProgress(null);
      depth.current = 0;
    }, 1400);
    return () => window.clearTimeout(reset);
  }, [state, pending]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  async function place(list: FileList | File[]) {
    if (busy.current || pending) return;
    busy.current = true;
    const selected = [...list];
    setFiles(selected.slice(0, 8));
    setProgress(null);
    setAdded([]);
    setSessionOnly(false);
    setState("landing");
    try {
      if (!selected.length || selected.length > 8)
        throw new Error("PDF_INVALID");
      for (const file of selected) await validateCoursePdf(file);
      if (!alive.current) return;
      const ids = await onImport(selected, (value) => {
        if (!alive.current) return;
        setProgress(value);
        if (value.storage === "session") setSessionOnly(true);
      });
      if (alive.current) {
        setAdded(ids);
        setState(ids.length === selected.length ? "success" : "error");
      }
    } catch {
      if (alive.current) setState("error");
    } finally {
      busy.current = false;
      if (input.current) input.current.value = "";
    }
  }
  const working = state === "landing" || pending;
  return (
    <section
      className="course-pdf-importer"
      data-state={state}
      data-section={section}
      aria-labelledby={id}
      aria-busy={working}
      onDragEnter={(event) => {
        if (!event.dataTransfer.types?.includes("Files") || working) return;
        event.preventDefault();
        depth.current++;
        setState("dragging");
      }}
      onDragOver={(event) => {
        if (!event.dataTransfer.types?.includes("Files")) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = working ? "none" : "copy";
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (!depth.current && state === "dragging") setState("idle");
      }}
      onDrop={(event) => {
        event.preventDefault();
        depth.current = 0;
        void place(event.dataTransfer.files);
      }}
    >
      <div className="pdf-import-object" aria-hidden="true">
        <span className="pdf-import-book">
          <BookOpen size={28} />
          <i />
        </span>
        <span className="pdf-import-paper">
          <FileText size={25} />
          <b>PDF</b>
        </span>
        <span className="pdf-import-check">
          <CheckCircle2 size={24} />
        </span>
        <span className="pdf-import-error">
          <AlertTriangle size={24} />
        </span>
      </div>
      <div className="pdf-import-copy">
        <h3 id={id}>{t({ en: "Place PDF material", ar: "إضافة مادة PDF" })}</h3>
        <p role={state === "error" ? "alert" : "status"}>
          {t(
            state === "dragging"
              ? {
                  en: "Release to place the PDF into this section",
                  ar: "أفلت الملف لإضافته إلى هذا القسم",
                }
              : working
                ? {
                    en: "Checking and saving your PDFs…",
                    ar: "جارٍ التحقق من ملفاتك وحفظها…",
                  }
                : state === "success"
                  ? { en: "PDF material added", ar: "أضيفت مادة PDF" }
                  : state === "error"
                    ? {
                        en: "Import failed. Choose valid PDFs under 30 MB, up to 8 at once, and try again.",
                        ar: "تعذّر الاستيراد. اختر ملفات PDF صالحة أصغر من ٣٠ ميجابايت، حتى ٨ ملفات، وحاول مجددًا.",
                      }
                    : {
                        en: "Drop course PDFs here or choose them from your device.",
                        ar: "أسقط ملفات المساق هنا أو اخترها من جهازك.",
                      },
          )}
        </p>
        <small>
          {t({
            en: "PDF only · up to 30 MB each · maximum 8 at once",
            ar: "PDF فقط · حتى ٣٠ ميجابايت للملف · ٨ ملفات كحد أقصى",
          })}
        </small>
      </div>
      <input
        ref={input}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        aria-label={t({ en: "Choose PDF files", ar: "اختر ملفات PDF" })}
        onChange={(event) =>
          event.target.files && void place(event.target.files)
        }
      />
      <button
        type="button"
        className="notebook-button notebook-button-primary"
        disabled={working}
        onClick={() => input.current?.click()}
      >
        <Upload size={17} />
        {t({ en: "Choose PDF files", ar: "اختر ملفات PDF" })}
      </button>
      {!!files.length && state !== "idle" && state !== "dragging" && (
        <div className="pdf-import-receipt">
          <ul
            aria-label={t({
              en: "Selected PDF files",
              ar: "ملفات PDF المختارة",
            })}
          >
            {files.map((file, index) => (
              <li key={index}>
                <FileText size={15} aria-hidden="true" />
                <span>{file.name}</span>
                <small>
                  <bdi>{(file.size / 1024 / 1024).toFixed(1)} MB</bdi>
                </small>
                {index < (progress?.completed || added.length) && (
                  <CheckCircle2 size={16} aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>
          <progress
            max={files.length}
            {...(progress || state === "success"
              ? { value: progress?.completed || added.length }
              : {})}
            aria-label={t({
              en: "PDF import progress",
              ar: "تقدّم استيراد PDF",
            })}
          />
          <small>
            {progress?.completed || added.length} / {files.length}{" "}
            {t({ en: "saved", ar: "محفوظ" })}
          </small>
          {state === "success" && onRead && added[0] && (
            <button
              type="button"
              className="notebook-button notebook-button-primary"
              onClick={() => onRead(added[0])}
            >
              <BookOpen size={17} />
              {t({ en: "Read PDF", ar: "قراءة PDF" })}
            </button>
          )}
        </div>
      )}
      <p className="pdf-import-boundary">
        {t(
          sessionOnly
            ? {
                en: "Available for this session only: device storage is unavailable. Keep your original files.",
                ar: "متاح للجلسة الحالية فقط: تخزين الجهاز غير متاح. احتفظ بملفاتك الأصلية.",
              }
            : {
                en: "Device-local course preview. Shared publishing requires the course API.",
                ar: "معاينة للمساق على جهازك. النشر المشترك يحتاج إلى واجهة المساق البرمجية.",
              },
        )}
      </p>
    </section>
  );
}
