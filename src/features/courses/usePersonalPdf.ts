import { useEffect, useRef, useState } from "react";
import type {
  CourseSectionKind,
  Resource,
  ResourceKind,
} from "../../types/content";
export async function validatePersonalPdf(file: File) {
  if (
    !file.size ||
    file.size > 30 * 1024 * 1024 ||
    !(file.type === "application/pdf" || /\.pdf$/i.test(file.name))
  )
    throw new Error("PDF_INVALID");
  if (
    new TextDecoder().decode(await file.slice(0, 5).arrayBuffer()) !== "%PDF-"
  )
    throw new Error("PDF_INVALID");
}
/** Temporary personal reading file; never writes to course storage or publishing APIs. */
export function usePersonalPdf(courseId: string, owner = "guest") {
  const [resources, setResources] = useState<Resource[]>([]),
    [pending, setPending] = useState(false),
    [error, setError] = useState(false);
  const urls = useRef(new Map<string, string>()),
    alive = useRef(true);
  const scope = courseId + ":" + owner;
  const currentScope = useRef(scope);
  currentScope.current = scope;
  useEffect(() => {
    alive.current = true;
    setResources([]);
    setError(false);
    setPending(false);
    return () => {
      alive.current = false;
      for (const url of urls.current.values()) URL.revokeObjectURL(url);
      urls.current.clear();
    };
  }, [scope]);
  async function open(kind: CourseSectionKind, file: File) {
    setPending(true);
    setError(false);
    try {
      await validatePersonalPdf(file);
      if (!alive.current || currentScope.current !== scope) return null;
      const id = "personal-pdf-" + crypto.randomUUID(),
        url = URL.createObjectURL(file);
      urls.current.set(id, url);
      const title = file.name.replace(/\.pdf$/i, "");
      const section: ResourceKind = [
        "overview",
        "recording",
        "external",
      ].includes(kind)
        ? "notes"
        : (kind as ResourceKind);
      setResources((previous) => [
        ...previous,
        {
          id,
          courseId,
          kind: section,
          title: { en: title, ar: title },
          description: {
            en: "Your personal PDF, open only in this study session. It is not a published course material.",
            ar: "ملفك الشخصي متاح في جلسة الدراسة الحالية فقط. ليس مادة منشورة للمساق.",
          },
          contributor: { en: "Personal study file", ar: "ملف دراسة شخصي" },
          updatedAt: new Date().toISOString(),
          pages: 1,
          keywords: ["pdf"],
          audience: "batch",
          batchIds: [],
          fileUrl: url,
          mediaType: "pdf",
          format: { en: "PDF", ar: "PDF" },
          localFile: { name: file.name, sizeBytes: file.size },
        },
      ]);
      return id;
    } catch {
      if (alive.current && currentScope.current === scope) setError(true);
      return null;
    } finally {
      if (alive.current && currentScope.current === scope) setPending(false);
    }
  }
  function remove(id: string) {
    const url = urls.current.get(id);
    if (url) URL.revokeObjectURL(url);
    urls.current.delete(id);
    setResources((previous) => previous.filter((item) => item.id !== id));
  }
  return { resources, pending, error, open, remove };
}
