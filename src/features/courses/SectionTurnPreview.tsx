import { useEffect, useRef, useState } from "react";
import { BookOpen, FileText } from "lucide-react";
import type { Course, CourseSection, Resource } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { safeResourceUrl } from "./study-state";
import { resourceMediaType } from "./StudyResourceViewer";

/** Two low-resolution saved-page previews at most; original PDFs remain the source. */
const previews = new Map<string, Promise<HTMLCanvasElement>>();
async function previewPdfPage(url: string, page: number) {
  const key = url + ":" + page;
  const existing = previews.get(key);
  if (existing) return existing;
  const work = (async () => {
    const engine = await import("./pdf-engine");
    const { task, api } = await engine.openPdf(url, () => {
      void task.destroy();
    });
    let pool: InstanceType<typeof engine.PdfRasterPool> | undefined;
    try {
      const document = await task.promise;
      pool = new engine.PdfRasterPool(document, api);
      const raster = await pool.get(
          Math.min(document.numPages, Math.max(1, Math.floor(page))),
          384,
        ),
        canvas = window.document.createElement("canvas");
      canvas.width = raster.canvas.width;
      canvas.height = raster.canvas.height;
      canvas.getContext("2d")?.drawImage(raster.canvas, 0, 0);
      return canvas;
    } finally {
      pool?.dispose();
      await task.destroy();
    }
  })();
  previews.set(key, work);
  while (previews.size > 2) previews.delete(previews.keys().next().value!);
  work.catch(() => {
    if (previews.get(key) === work) previews.delete(key);
  });
  return work;
}
function PdfPreviewPage({ url, page }: { url: string; page: number }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    { t } = useLocale();
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    setReady(false);
    setFailed(false);
    void previewPdfPage(url, page)
      .then((pixels) => {
        if (!active || !canvas.current) return;
        canvas.current.width = pixels.width;
        canvas.current.height = pixels.height;
        canvas.current.getContext("2d")?.drawImage(pixels, 0, 0);
        setReady(true);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [url, page]);
  return (
    <div
      className="section-pdf-preview"
      data-preview-ready={ready || undefined}
      data-preview-page={page}
    >
      <canvas ref={canvas} />
      {!ready && (
        <span>
          {t(
            failed
              ? {
                  en: "Open this file to view its pages.",
                  ar: "افتح هذا الملف لعرض صفحاته.",
                }
              : {
                  en: "Loading the next page…",
                  ar: "جارٍ تحميل الصفحة التالية…",
                },
          )}
        </span>
      )}
    </div>
  );
}
export function SectionTurnPreview({
  course,
  section,
  resources,
  preferredResourceId,
  preferredPage = 1,
}: {
  course: Course;
  section: CourseSection;
  resources: Resource[];
  preferredResourceId?: string;
  preferredPage?: number;
}) {
  const { t } = useLocale();
  const files = resources.filter((item) => safeResourceUrl(item.fileUrl));
  const file =
    files.find((item) => item.id === preferredResourceId) ||
    (files.length === 1 ? files[0] : undefined);
  const url = file && safeResourceUrl(file.fileUrl);
  return (
    <div className="section-next-content" aria-hidden="true" inert>
      {file && url && resourceMediaType(file) === "pdf" ? (
        <PdfPreviewPage url={url} page={preferredPage} />
      ) : (
        <>
          <header>
            <BookOpen size={22} />
            <h3>{t(section.title)}</h3>
          </header>
          {section.kind === "overview" ? (
            <>
              <p>{t(course.description)}</p>
              <ol>
                {course.outcomes.map((outcome) => (
                  <li key={outcome.en}>{t(outcome)}</li>
                ))}
              </ol>
            </>
          ) : (
            <>
              {resources.length ? (
                <ul>
                  {resources.map((item) => (
                    <li key={item.id}>
                      <FileText size={17} />
                      <span>
                        <strong>{t(item.title)}</strong>
                        <p>{t(item.preview?.excerpt || item.description)}</p>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {t({
                    en: "No files in this section yet.",
                    ar: "لا توجد ملفات في هذا القسم بعد.",
                  })}
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
