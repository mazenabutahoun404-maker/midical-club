import { useEffect, useState } from "react";
import type { Resource } from "../../types/content";
import type { PDFDocumentLoadingTask } from "../courses/pdf-engine";
import { safeResourceUrl } from "../courses/study-state";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { resourceRevision } from "../../lib/resource-identity";

/** Reuse an open reader's count; another PDF is parsed without rendering any pages. */
export function useNotePdfCount(resource: Resource | undefined, knownCount?: number) {
  const services = useServices(), owner = useAuth().snapshot.user?.id;
  const identity = resource ? `${owner}:${resource.id}:${resourceRevision(resource)}:${resource.fileUrl}` : "";
  const [result, setResult] = useState<{ identity: string; count?: number; error?: boolean }>({ identity: "" });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!resource || knownCount) return;
    let alive = true;
    let task: PDFDocumentLoadingTask | undefined;
    setResult({ identity });
    const session = services.api?.session.get()?.sessionId;
    void (async () => {
      const signed = resource.assetId && services.files ? await services.files.previewUrl(resource.assetId) : null;
      if (!alive || services.api?.session.get()?.sessionId !== session) return;
      const url = safeResourceUrl(signed?.url || resource.fileUrl);
      if (!url) throw new Error("PDF_UNAVAILABLE");
      const engine = await import("../courses/pdf-engine");
      const opened = await engine.openPdf(url, () => {
        if (alive) setResult({ identity, error: true });
        void task?.destroy().catch(() => {});
      });
      task = opened.task;
      if (!alive) { await task.destroy(); return; }
      const document = await task.promise;
      if (alive) setResult({ identity, count: document.numPages });
      await task.destroy().catch(() => {});
    })().catch(() => { if (alive) setResult({ identity, error: true }); });
    return () => { alive = false; void task?.destroy().catch(() => {}); };
  }, [identity, knownCount, retry]);
  const matching = result.identity === identity ? result : undefined;
  return {
    count: knownCount || matching?.count,
    pending: !!resource && !knownCount && !matching?.count && !matching?.error,
    error: !knownCount && !!matching?.error,
    retry: () => setRetry((value) => value + 1),
  };
}
