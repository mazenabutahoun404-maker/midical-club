import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useCourses } from "../../hooks/useContent";
import { flyDeletedRecord, useStudyHub, useStudyError } from "./useStudyHub";
import { useLocalCoursePdfs } from "../courses/useLocalCoursePdfs";
import {
  validateCoursePdf,
  type PdfImportReporter,
} from "../courses/pdf-import";
import { CoursePdfImporter } from "../courses/CoursePdfImporter";
import { OfflinePdfReader } from "./OfflinePdfReader";
import {
  downloadCoursePack,
  indexedPackStorage,
  requestOfflineShell,
  type OfflinePack,
  type PackProgress,
} from "./offline-packs";
import { AppLink } from "../../components/navigation/AppLink";
import { Download, Trash2, FileText, WifiOff } from "lucide-react";
import { offerUndo } from "../../components/feedback/undo-action";
import type { Resource } from "../../types/content";
import "./study-hub.css";
import "../../styles/notebook-reader.css";
import "../../styles/study-environment.css";
export default function OfflinePacksPage() {
  const { t } = useLocale(),
    errorText = useStudyError(),
    { owner, service } = useStudyHub(),
    courses = useCourses();
  const [courseId, setCourseId] = useState(""),
    [packs, setPacks] = useState<OfflinePack[]>([]),
    [error, setError] = useState(false),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState<PackProgress | null>(null),
    [shell, setShell] = useState<boolean | null>(null),
    [personal, setPersonal] = useState<Resource[]>([]),
    [opened, setOpened] = useState<Resource | null>(null),
    [downloadState, setDownloadState] = useState<"idle" | "success" | "error">(
      "idle",
    );
  const local = useLocalCoursePdfs(courseId);
  const controller = useRef<AbortController | null>(null),
    urls = useRef<string[]>([]),
    ownerRef = useRef(owner),
    resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    stagingUrls = useRef<string[]>([]),
    currentCourse = useRef(courseId);
  currentCourse.current = courseId;
  ownerRef.current = owner;
  const [quota, setQuota] = useState<string>("");
  async function load() {
    if (!owner) return;
    try {
      const rows = await indexedPackStorage.list(owner);
      if (ownerRef.current === owner) {
        setPacks(rows);
        setError(false);
      }
    } catch {
      setError(true);
    }
  }
  useEffect(() => {
    setPacks([]);
    setCourseId("");
    setProgress(null);
    setShell(null);
    setDownloadState("idle");
    setOpened(null);
    setPersonal([]);
    void load();
    void navigator.storage
      ?.estimate()
      .then((s) =>
        setQuota(
          s.quota
            ? Math.round((s.quota - (s.usage || 0)) / 1048576) + " MB"
            : "",
        ),
      );
    return () => {
      controller.current?.abort();
      if (resetTimer.current) clearTimeout(resetTimer.current);
      for (const url of urls.current) URL.revokeObjectURL(url);
      urls.current = [];
      stagingUrls.current = [];
    };
  }, [owner]);
  useEffect(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    for (const url of stagingUrls.current) {
      URL.revokeObjectURL(url);
      urls.current = urls.current.filter((value) => value !== url);
    }
    stagingUrls.current = [];
    setPersonal([]);
    setProgress(null);
    setDownloadState("idle");
  }, [courseId]);
  useEffect(() => {
    const url = opened?.fileUrl;
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
        urls.current = urls.current.filter((value) => value !== url);
      }
    };
  }, [opened?.fileUrl]);
  async function savePack() {
    if (!owner || !courseId) return;
    const account = owner;
    setBusy(true);
    setProgress(null);
    setDownloadState("idle");
    const abort = new AbortController();
    controller.current = abort;
    try {
      const manifest = await service.packManifest(courseId, {
        signal: abort.signal,
      });
      const all = [...manifest.resources, ...local.resources, ...personal];
      manifest.resources = Array.from(
        new Map(all.map((r) => [r.id, r])).values(),
      );
      const margins = (
        await Promise.all(
          manifest.resources.map((r) =>
            service.listMargins(r.id, { signal: abort.signal }),
          ),
        )
      ).flat();
      const recall = await service.listRecall(courseId, {
        signal: abort.signal,
      });
      await downloadCoursePack({
        ownerId: account,
        manifest,
        margins,
        recall,
        signal: abort.signal,
        report: setProgress,
        stillOwner: () => ownerRef.current === account,
      });
      if (ownerRef.current !== account) return;
      await load();
      setDownloadState("success");
      // Saved packs own their Blobs. Discard only the staging files, not the downloaded pack.
      resetTimer.current = setTimeout(() => {
        if (ownerRef.current !== account) return;
        setPersonal([]);
        setCourseId("");
        setProgress(null);
        setDownloadState("idle");
      }, 1400);
      setShell(await requestOfflineShell());
      toast.success(
        t({
          en: "Course pack ready on this device",
          ar: "الحزمة جاهزة على هذا الجهاز",
        }),
      );
    } catch (e) {
      if (!abort.signal.aborted) {
        setDownloadState("error");
        toast.error(errorText(e));
      }
    } finally {
      setBusy(false);
      controller.current = null;
    }
  }
  async function personalFiles(files: File[], report?: PdfImportReporter) {
    const account = owner,
      course = courseId;
    if (!account || !course || personal.length + files.length > 80)
      throw new Error("PDF_INVALID");
    // Validate the whole batch before adding any file. Partial batches never appear ready.
    for (const file of files) await validateCoursePdf(file);
    if (ownerRef.current !== account || currentCourse.current !== course)
      throw new Error("AUTHENTICATION_REQUIRED");
    const records: Resource[] = files.map((file, i) => {
      const url = URL.createObjectURL(file);
      urls.current.push(url);
      stagingUrls.current.push(url);
      const title = file.name.replace(/\.pdf$/i, "");
      report?.({
        completed: i + 1,
        total: files.length,
        fileName: file.name,
        storage: "session",
      });
      return {
        id: "personal-pdf-" + crypto.randomUUID(),
        courseId: course,
        kind: "notes",
        title: { en: title, ar: title },
        description: { en: "Private pack file", ar: "ملف حزمة خاص" },
        contributor: { en: "You", ar: "أنت" },
        updatedAt: new Date().toISOString(),
        pages: 1,
        keywords: [],
        audience: "batch",
        batchIds: [],
        format: { en: "PDF", ar: "PDF" },
        mediaType: "pdf",
        fileUrl: url,
        localFile: { name: file.name, sizeBytes: file.size },
      };
    });
    setPersonal((previous) => [...previous, ...records]);
    return records.map((file) => file.id);
  }
  function openFile(pack: OfflinePack, index: number) {
    if (
      pack.ownerId !== owner ||
      Date.parse(pack.manifest.expiresAt) <= Date.now()
    ) {
      toast.error(
        t({
          en: "Reconnect to refresh this expired pack.",
          ar: "اتصل لتحديث الحزمة المنتهية.",
        }),
      );
      return;
    }
    const file = pack.files[index];
    const url = URL.createObjectURL(file.blob);
    urls.current.push(url);
    setOpened({ ...file.resource, fileUrl: url });
  }
  return (
    <main className="container study-hub">
      <header className="study-hub-heading">
        <AppLink href="/my/study" className="text-link">
          ← {t({ en: "Study desk", ar: "مكتب الدراسة" })}
        </AppLink>
        <h1 data-page-heading tabIndex={-1}>
          {t({ en: "Offline course packs", ar: "حزم المساقات دون اتصال" })}
        </h1>
        <p>
          {t({
            en: "Download a complete set of real PDFs. A pack is ready only when every file has been saved.",
            ar: "نزّل مجموعة ملفات كاملة. لا تصبح الحزمة جاهزة إلا بعد حفظ جميع الملفات.",
          })}
        </p>
        {quota && (
          <small>
            {t({
              en: "Estimated device space available",
              ar: "المساحة المتاحة تقديرياً",
            })}
            : {quota}
          </small>
        )}
      </header>
      <section
        className="study-editor pack-download-editor"
        data-download-state={downloadState}
      >
        <label>
          {t({ en: "Choose a course", ar: "اختر المساق" })}
          <select
            disabled={busy}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">—</option>
            {courses.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {t(c.title)}
              </option>
            ))}
          </select>
        </label>
        {courseId && (
          <>
            <CoursePdfImporter
              key={courseId}
              section="notes"
              pending={busy}
              onImport={personalFiles}
              copy={{
                title: {
                  en: "Add private PDFs to this pack",
                  ar: "أضف ملفات PDF خاصة للحزمة",
                },
                idle: {
                  en: "Drop PDFs here or choose files. Download the pack to keep them on this device.",
                  ar: "أسقط الملفات أو اخترها. نزّل الحزمة لحفظها على هذا الجهاز.",
                },
                dragging: {
                  en: "Release to add PDFs to the pack",
                  ar: "أفلت لإضافة الملفات إلى الحزمة",
                },
                working: {
                  en: "Checking your PDFs…",
                  ar: "جار التحقق من ملفاتك…",
                },
                success: {
                  en: "PDFs added. Download the pack to save them.",
                  ar: "أضيفت الملفات. نزّل الحزمة لحفظها.",
                },
                receipt: { en: "added", ar: "مضاف" },
                boundary: {
                  en: "Private staging files. A pack is saved only after its download completes.",
                  ar: "ملفات خاصة قيد التجهيز. تحفظ الحزمة بعد اكتمال تنزيلها فقط.",
                },
              }}
            />
            <small>
              {t({
                en: "This is private storage, not course publishing.",
                ar: "تخزين خاص وليس نشر مواد المساق.",
              })}
            </small>
            <ul>
              {personal.map((p) => (
                <li key={p.id}>{t(p.title)}</li>
              ))}
            </ul>
          </>
        )}
        <div className="study-hub-actions">
          <button
            className="button button-primary"
            disabled={!courseId || busy || downloadState === "success"}
            onClick={() => void savePack()}
          >
            <Download size={17} />
            {t({ en: "Download pack", ar: "تنزيل الحزمة" })}
          </button>
          {busy && (
            <button
              className="button"
              onClick={() => controller.current?.abort()}
            >
              {t({ en: "Cancel download", ar: "إلغاء التنزيل" })}
            </button>
          )}
          <button
            className="button"
            onClick={() =>
              void navigator.storage?.persist().then((yes) =>
                toast(
                  yes
                    ? t({
                        en: "Persistent storage granted",
                        ar: "أُتيح التخزين الدائم",
                      })
                    : t({
                        en: "The browser may reclaim downloaded storage.",
                        ar: "قد يستعيد المتصفح مساحة الملفات.",
                      }),
                ),
              )
            }
          >
            {t({ en: "Keep downloads", ar: "الاحتفاظ بالتنزيلات" })}
          </button>
        </div>
        {(busy || downloadState === "success") && (
          <div className="pack-progress" role="status">
            <progress
              max={progress?.total || 1}
              value={progress?.completed || 0}
            />
            <span>
              {downloadState === "success"
                ? t({ en: "✓ Your pack is ready", ar: "✓ حزمتك جاهزة" })
                : progress?.file ||
                  t({
                    en: "Preparing manifest…",
                    ar: "جار تجهيز الحزمة…",
                  })}{" "}
              · {((progress?.bytes || 0) / 1048576).toFixed(1)} MB
            </span>
          </div>
        )}
      </section>
      {shell === false && (
        <p className="study-source-note">
          {t({
            en: "Files are saved for offline reading in an open app. Offline launch requires the included service-worker build step to be installed on the server.",
            ar: "الملفات محفوظة للقراءة دون اتصال في التطبيق المفتوح. بدء التطبيق دون اتصال يحتاج تثبيت عامل الخدمة المرفق على الخادم.",
          })}
        </p>
      )}
      {shell === true && (
        <p role="status">
          {t({
            en: "Offline app shell installed.",
            ar: "ثُبت التطبيق للعمل دون اتصال.",
          })}
        </p>
      )}
      {error ? (
        <p role="alert">
          {t({
            en: "Persistent device storage is unavailable. No pack has been marked downloaded.",
            ar: "التخزين الدائم غير متاح. لم تُحدد أي حزمة كمُنزلة.",
          })}
        </p>
      ) : packs.length === 0 ? (
        <p className="study-empty">
          <WifiOff size={25} />
          {t({
            en: "Your downloaded courses will appear here.",
            ar: "تظهر مساقاتك المُنزلة هنا.",
          })}
        </p>
      ) : (
        <div className="pack-grid">
          {packs.map((pack) => (
            <article
              className="study-editor"
              data-pack-key={pack.key}
              key={pack.key}
            >
              <h2>{t(pack.manifest.course.title)}</h2>
              <p>
                {pack.files.length} {t({ en: "PDFs", ar: "ملفات" })} ·{" "}
                {(pack.bytes / 1048576).toFixed(1)} MB
              </p>
              <small>
                {t({ en: "Expires", ar: "تنتهي" })}{" "}
                {new Date(pack.manifest.expiresAt).toLocaleDateString()}
              </small>
              <div className="study-record-list">
                {pack.files.map((f, i) => (
                  <button key={f.resource.id} onClick={() => openFile(pack, i)}>
                    <FileText size={18} />
                    {t(f.resource.title)}
                  </button>
                ))}
              </div>
              <details>
                <summary>
                  {t({
                    en: "Saved notes and recall cards",
                    ar: "الملاحظات وبطاقات الاسترجاع المحفوظة",
                  })}
                </summary>
                <small>
                  {t({
                    en: "Read-only snapshot from the download date.",
                    ar: "لقطة للقراءة فقط بتاريخ التنزيل.",
                  })}
                </small>
                {pack.margins.map((n) => (
                  <p key={n.id}>
                    {t({ en: "Page", ar: "صفحة" })} {n.anchor.page} · {n.body}
                  </p>
                ))}
                {pack.recall.map((c) => (
                  <details key={c.id}>
                    <summary>{c.prompt}</summary>
                    <p>{c.answer}</p>
                  </details>
                ))}
              </details>
              <button
                className="button"
                onClick={() =>
                  void indexedPackStorage
                    .remove(pack.key)
                    .then(() => {
                      flyDeletedRecord(
                        "data-pack-key",
                        pack.key,
                        pack.manifest.course.title.en,
                      );
                      void load();
                      offerUndo({
                        message: t({ en: "Pack removed", ar: "حُذفت الحزمة" }),
                        label: t({ en: "Undo", ar: "تراجع" }),
                        restored: t({
                          en: "Pack restored",
                          ar: "استعيدت الحزمة",
                        }),
                        failed: t({
                          en: "Could not restore pack",
                          ar: "تعذرت الاستعادة",
                        }),
                        canRestore: () => ownerRef.current === pack.ownerId,
                        undo: async () => {
                          await indexedPackStorage.put(pack);
                          await load();
                        },
                      });
                    })
                    .catch((e) => toast.error(errorText(e)))
                }
              >
                <Trash2 size={17} />
                {t({ en: "Remove pack", ar: "حذف الحزمة" })}
              </button>
            </article>
          ))}
        </div>
      )}
      {opened && (
        <OfflinePdfReader
          key={opened.id}
          item={opened}
          onClose={() => setOpened(null)}
        />
      )}
    </main>
  );
}
