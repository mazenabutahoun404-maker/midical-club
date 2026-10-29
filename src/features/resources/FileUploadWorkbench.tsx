import { useEffect, useRef, useState } from "react";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { ApiError } from "../../services/api/client";
import { assertOwner } from "../../services/api/mapping";
import { createRecordId } from "../../lib/record-id";
import { hashFile } from "../../services/files/file-hash";
import {
  transferFile,
  type UploadDescriptor,
} from "../../services/files/upload-transfer";
import type { Schemas } from "../../services/api/schema.generated";
import "../../styles/account-access.css";
type Task = {
  file: File;
  sha256: string;
  session: UploadDescriptor;
  completionKey: string;
  done: boolean;
};
export function FileUploadWorkbench({
  scope = "admin",
  offeringId,
  teamId,
  purpose = "Content",
  importItemId,
  onQueued,
  expected,
  initialFiles = [],
}: {
  scope?: "admin" | "study";
  offeringId?: string;
  teamId?: string;
  purpose?: string;
  importItemId?: string;
  expected?: { sizeBytes: number; sha256: string };
  initialFiles?: File[];
  onQueued?: () => void;
}) {
  const services = useServices(),
    assets = services.assets!,
    api = services.api!,
    { t } = useLocale();
  const [files, setFiles] = useState<File[]>(initialFiles),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null),
    [status, setStatus] = useState(""),
    [progress, setProgress] = useState(0),
    [started, setStarted] = useState(false),
    [queued, setQueued] = useState(false);
  const tasks = useRef<Task[]>([]),
    batch = useRef(""),
    owner = useRef<string | undefined>(undefined),
    controller = useRef<AbortController | null>(null),
    live = useRef(true),
    commandKey = useRef(createRecordId()),
    lockedContext = useRef<string | null>(null);
  const context = JSON.stringify([
    scope,
    offeringId,
    teamId,
    purpose,
    importItemId,
    expected?.sizeBytes,
    expected?.sha256,
  ]);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      controller.current?.abort();
    };
  }, []);
  const reset = () => {
    tasks.current = [];
    lockedContext.current = null;
    batch.current = "";
    setStarted(false);
    setQueued(false);
    setStatus("");
    setProgress(0);
    setError(null);
    commandKey.current = createRecordId();
  };
  const upload = async () => {
    if (busy || !files.length) return;
    setBusy(true);
    setError(null);
    setStarted(true);
    controller.current = new AbortController();
    const signal = controller.current.signal;
    owner.current = owner.current || api.session.get()?.sessionId;
    const check = () => {
      signal.throwIfAborted();
      assertOwner(api, owner.current);
    };
    try {
      check();
      if (lockedContext.current && lockedContext.current !== context)
        throw new ApiError(
          "The upload context changed. Review the file and start a new session.",
          409,
          "UPLOAD_CONTEXT_CHANGED",
        );
      lockedContext.current = context;
      if (tasks.current.length < files.length) {
        const prepared: { file: File; sha256: string }[] = [];
        const unique = new Set<string>();
        for (const file of files) {
          if (!file.size)
            throw new ApiError("Select nonempty files.", 422, "EMPTY_FILE");
          if (scope === "study") {
            if (
              file.size > 50 * 1024 * 1024 ||
              !(file.type === "application/pdf" || /\.pdf$/i.test(file.name)) ||
              new TextDecoder().decode(await file.slice(0, 5).arrayBuffer()) !==
                "%PDF-"
            )
              throw new ApiError(
                "Private study files must be PDF files of at most 50 MB.",
                422,
                "PDF_INVALID",
              );
            if (!offeringId)
              throw new ApiError(
                "Select a course offering.",
                422,
                "OFFERING_REQUIRED",
              );
          }
          const id = `${file.name}:${file.size}`;
          if (unique.has(id))
            throw new ApiError(
              "Upload files with duplicate names and sizes separately.",
              422,
              "AMBIGUOUS_BULK_FILE",
            );
          unique.add(id);
          setStatus(
            t({ en: "Calculating file checksum", ar: "حساب بصمة الملف" }) +
              ": " +
              file.name,
          );
          const sha256 = await hashFile(file, signal, (fraction) => {
            if (live.current) setProgress(fraction);
          });
          check();
          if (
            expected &&
            (file.size !== expected.sizeBytes ||
              sha256.toLowerCase() !== expected.sha256.toLowerCase())
          )
            throw new ApiError(
              "This file does not match the reviewed manifest.",
              422,
              "IMPORT_FILE_MISMATCH",
            );
          prepared.push({ file, sha256 });
        }
        const request = (
          file: File,
          sha256: string,
          index: number,
        ): Schemas["UploadRequest"] => ({
          originalFileName: file.name,
          declaredContentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          sha256,
          purpose,
          multipartPreferred: true,
          idempotencyKey: `${commandKey.current}-${index}`,
          teamId: teamId || null,
          learningOfferingId: offeringId || null,
          importItemId: importItemId || null,
        });
        if (scope === "admin" && files.length > 1) {
          const result = batch.current
            ? await assets.uploads.bulkGet(batch.current)
            : await assets.uploads.bulkStart(
                {
                  files: prepared.map((p, i) => request(p.file, p.sha256, i)),
                  idempotencyKey: commandKey.current,
                },
                commandKey.current,
              );
          check();
          batch.current = "batchId" in result ? result.batchId : result.id;
          const matches = new Map<string, UploadDescriptor>();
          for (const entry of result.files) {
            const metadata = await assets.get(entry.assetId);
            check();
            const identity = `${metadata.originalFileName}:${metadata.sizeBytes}`;
            if (matches.has(identity))
              throw new ApiError(
                "The bulk response contains ambiguous file identities.",
                502,
                "BULK_FILE_MISMATCH",
              );
            matches.set(
              identity,
              "uploadUrl" in entry ? entry : await assets.uploads.get(entry.id),
            );
            check();
          }
          tasks.current = prepared.map((p) => {
            const session = matches.get(`${p.file.name}:${p.file.size}`);
            if (!session)
              throw new ApiError(
                "The bulk response did not identify the selected file.",
                502,
                "BULK_FILE_MISMATCH",
              );
            return {
              ...p,
              session,
              completionKey: createRecordId(),
              done: false,
            };
          });
        } else {
          for (const p of prepared.slice(tasks.current.length)) {
            const session =
              scope === "study"
                ? await assets.study.start(
                    {
                      offeringId: offeringId!,
                      originalFileName: p.file.name,
                      declaredContentType: "application/pdf",
                      sizeBytes: p.file.size,
                      sha256: p.sha256,
                      multipartPreferred: true,
                    },
                    `${commandKey.current}-${tasks.current.length}`,
                  )
                : await assets.uploads.start(
                    request(p.file, p.sha256, tasks.current.length),
                  );
            check();
            tasks.current.push({
              ...p,
              session,
              completionKey: createRecordId(),
              done: false,
            });
          }
        }
      }
      for (const task of tasks.current) {
        if (task.done) continue;
        check();
        setStatus(
          t({ en: "Uploading", ar: "جارٍ الرفع" }) + ": " + task.file.name,
        );
        await transferFile({
          api,
          service: assets,
          scope,
          file: task.file,
          session: task.session,
          owner: owner.current,
          completionKey: task.completionKey,
          signal,
          onProgress: (value) => {
            if (live.current) setProgress(value.uploaded / value.total);
          },
        });
        task.done = true;
        check();
      }
      if (batch.current)
        await assets.uploads.bulkComplete(
          batch.current,
          `${commandKey.current}-complete`,
        );
      check();
      if (live.current) {
        setQueued(true);
        setStatus(
          t({
            en: "Upload accepted. Scanning and processing must finish before the file can be opened.",
            ar: "تم قبول الرفع. يجب اكتمال الفحص والمعالجة قبل فتح الملف.",
          }),
        );
        onQueued?.();
      }
    } catch (caught) {
      if (live.current) setError(caught);
    } finally {
      if (live.current) setBusy(false);
    }
  };
  return (
    <div className="account-api-form">
      <label>
        {scope === "study"
          ? t({
              en: "Private PDF files (50 MB per file)",
              ar: "ملفات PDF خاصة (50 ميغابايت لكل ملف)",
            })
          : t({ en: "Files to upload", ar: "الملفات المراد رفعها" })}
        <input
          type="file"
          accept={scope === "study" ? "application/pdf,.pdf" : undefined}
          multiple={!importItemId}
          disabled={busy || started}
          onChange={(e) => {
            reset();
            setFiles(Array.from(e.target.files || []));
            owner.current = undefined;
          }}
        />
      </label>
      {scope === "study" && (
        <small>
          {t({
            en: "These files are private to your account. They are not published course material.",
            ar: "هذه الملفات خاصة بحسابك ولا تُنشر ضمن مواد المساق.",
          })}
        </small>
      )}
      {files.length > 0 && (
        <small>{files.map((file) => file.name).join(" · ")}</small>
      )}
      <div className="account-security-actions">
        <Button
          disabled={busy || !files.length || queued}
          onClick={() => void upload()}
        >
          {t({
            en: started ? "Continue upload" : "Upload selected files",
            ar: started ? "متابعة الرفع" : "رفع الملفات المختارة",
          })}
        </Button>
        {busy && (
          <Button variant="outline" onClick={() => controller.current?.abort()}>
            {t({ en: "Pause transfer", ar: "إيقاف النقل مؤقتًا" })}
          </Button>
        )}
        {!busy && started && (
          <Button
            variant="outline"
            onClick={() => {
              reset();
              owner.current = undefined;
            }}
          >
            {t({ en: "Select different files", ar: "اختيار ملفات أخرى" })}
          </Button>
        )}
        {!busy && (tasks.current.length > 0 || batch.current) && (
          <Button
            variant="outline"
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                assertOwner(api, owner.current);
                const states = batch.current
                  ? [(await assets.uploads.bulkGet(batch.current)).status]
                  : await Promise.all(
                      tasks.current.map(
                        async (task) =>
                          (
                            await (
                              scope === "admin" ? assets.uploads : assets.study
                            ).get(task.session.id)
                          ).status,
                      ),
                    );
                assertOwner(api, owner.current);
                setStatus(
                  t({
                    en: "Reported session state",
                    ar: "حالة الجلسة المُبلّغ عنها",
                  }) +
                    ": " +
                    states.join(" · "),
                );
                onQueued?.();
              } catch (caught) {
                setError(caught);
              } finally {
                setBusy(false);
              }
            }}
          >
            {t({ en: "Refresh session state", ar: "تحديث حالة الجلسة" })}
          </Button>
        )}
        {!busy && tasks.current.some((task) => !task.done) && (
          <Button
            variant="outline"
            onClick={async () => {
              setBusy(true);
              try {
                assertOwner(api, owner.current);
                for (const task of tasks.current.filter((task) => !task.done)) {
                  await (
                    scope === "admin" ? assets.uploads : assets.study
                  ).abort(task.session.id);
                  assertOwner(api, owner.current);
                }
                reset();
                setFiles([]);
              } catch (caught) {
                setError(caught);
              } finally {
                setBusy(false);
              }
            }}
          >
            {t({
              en: "Abort unfinished sessions",
              ar: "إلغاء جلسات الرفع غير المكتملة",
            })}
          </Button>
        )}
      </div>
      {status && <p role="status">{status}</p>}
      {busy && <progress max={1} value={progress} aria-label={status} />}
      <ApiActionError
        error={error}
        onReload={() => {
          reset();
          onQueued?.();
        }}
      />
      {batch.current && (
        <small>
          {t({ en: "Batch reference", ar: "معرّف مجموعة الرفع" })}:{" "}
          {batch.current}
        </small>
      )}
      {tasks.current.map((task) => (
        <small key={task.session.id}>
          {task.file.name} · {task.session.assetId} ·{" "}
          {task.done
            ? t({ en: "Queued for verification", ar: "بانتظار التحقق" })
            : task.session.id}
        </small>
      ))}
    </div>
  );
}
