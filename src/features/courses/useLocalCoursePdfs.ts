import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CourseSectionKind,
  Resource,
  ResourceKind,
} from "../../types/content";
import { validateCoursePdf, type PdfImportReporter } from "./pdf-import";

const databaseName = "medclub-course-files-v1";
const storeName = "pdfs";
const localRecords = new Map<string, StoredPdf>();
const sessionRecords = new Set<string>();

interface StoredPdf {
  id: string;
  courseId: string;
  kind: ResourceKind;
  title: string;
  fileName: string;
  sizeBytes: number;
  updatedAt: string;
  blob: Blob;
}

function request<T>(value: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    value.onsuccess = () => resolve(value.result);
    value.onerror = () =>
      reject(value.error || new Error("PDF_STORAGE_FAILED"));
  });
}

async function database() {
  if (typeof indexedDB === "undefined") return undefined;
  return new Promise<IDBDatabase>((resolve, reject) => {
    const opening = indexedDB.open(databaseName, 1);
    opening.onupgradeneeded = () => {
      const store = opening.result.createObjectStore(storeName, {
        keyPath: "id",
      });
      store.createIndex("courseId", "courseId", { unique: false });
    };
    opening.onsuccess = () => resolve(opening.result);
    opening.onerror = () =>
      reject(opening.error || new Error("PDF_STORAGE_FAILED"));
  });
}

async function readCourse(courseId: string): Promise<StoredPdf[]> {
  try {
    const db = await database();
    if (!db)
      return [...localRecords.values()].filter(
        (item) => item.courseId === courseId,
      );
    const transaction = db.transaction(storeName, "readonly");
    const result = await request(
      transaction.objectStore(storeName).index("courseId").getAll(courseId),
    );
    db.close();
    return result;
  } catch {
    return [...localRecords.values()].filter(
      (item) => item.courseId === courseId,
    );
  }
}

async function writePdf(item: StoredPdf) {
  localRecords.set(item.id, item);
  try {
    const db = await database();
    if (!db) {
      sessionRecords.add(item.id);
      return "session" as const;
    }
    try {
      const transaction = db.transaction(storeName, "readwrite");
      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = transaction.onabort = () =>
          reject(transaction.error || new Error("PDF_STORAGE_FAILED"));
        transaction.objectStore(storeName).put(item);
      });
      sessionRecords.delete(item.id);
      return "device" as const;
    } finally {
      db.close();
    }
  } catch {
    // The in-memory copy remains available when IndexedDB is blocked.
    sessionRecords.add(item.id);
    return "session" as const;
  }
}

async function deletePdf(id: string) {
  if (!sessionRecords.has(id)) {
    const db = await database();
    if (db) {
      try {
        const transaction = db.transaction(storeName, "readwrite");
        await new Promise<void>((resolve, reject) => {
          transaction.oncomplete = () => resolve();
          transaction.onerror = transaction.onabort = () =>
            reject(transaction.error || new Error("PDF_STORAGE_FAILED"));
          transaction.objectStore(storeName).delete(id);
        });
      } finally {
        db.close();
      }
    }
  }
  localRecords.delete(id);
  sessionRecords.delete(id);
}

function titleFromFile(name: string) {
  return (
    name
      .replace(/\.pdf$/i, "")
      .replace(/[-_]+/g, " ")
      .trim() || "Imported PDF"
  );
}

function idFor(file: File) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `local-pdf-${random}-${file.lastModified}`;
}

function resourceFrom(item: StoredPdf, url: string): Resource {
  return {
    id: item.id,
    courseId: item.courseId,
    kind: item.kind,
    title: { en: item.title, ar: item.title },
    updatedAt: item.updatedAt,
    pages: 1,
    description: {
      en: "A PDF imported into this device-local course preview.",
      ar: "ملف PDF مستورد إلى معاينة المساق على هذا الجهاز.",
    },
    contributor: { en: "Local course preview", ar: "معاينة المساق المحلية" },
    fileUrl: url,
    keywords: [item.title.toLowerCase(), item.kind, "pdf"],
    audience: "batch",
    batchIds: [],
    format: { en: "Imported PDF", ar: "ملف PDF مستورد" },
    mediaType: "pdf",
    localFile: { name: item.fileName, sizeBytes: item.sizeBytes },
  };
}

export function useLocalCoursePdfs(courseId: string) {
  const [records, setRecords] = useState<StoredPdf[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const urls = useRef(new Map<string, string>());

  useEffect(() => {
    let alive = true;
    setError(false);
    if (!courseId) {
      setRecords([]);
      return;
    }
    void readCourse(courseId)
      .then((items) => {
        if (alive) setRecords(items);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, [courseId]);

  useEffect(
    () => () => {
      for (const url of urls.current.values())
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      urls.current.clear();
    },
    [],
  );

  const urlFor = useCallback((item: StoredPdf) => {
    const existing = urls.current.get(item.id);
    if (existing) return existing;
    let url = `https://medclub.invalid/local/${encodeURIComponent(item.id)}.pdf`;
    if (typeof URL.createObjectURL === "function") {
      try {
        url = URL.createObjectURL(item.blob);
      } catch {
        // Some preview/test runtimes expose incompatible Blob implementations.
      }
    }
    urls.current.set(item.id, url);
    return url;
  }, []);

  const resources = useMemo(
    () =>
      records
        .filter((item) => item.courseId === courseId)
        .map((item) => resourceFrom(item, urlFor(item))),
    [records, urlFor, courseId],
  );

  const importFiles = useCallback(
    async (
      kind: CourseSectionKind,
      files: File[],
      report?: PdfImportReporter,
    ) => {
      if (
        !courseId ||
        kind === "overview" ||
        kind === "recording" ||
        kind === "external"
      )
        return [];
      setPending(true);
      setError(false);
      try {
        if (!files.length || files.length > 8) throw new Error("PDF_INVALID");
        for (const file of files) await validateCoursePdf(file);
        const added = files.map<StoredPdf>((file) => ({
          id: idFor(file),
          courseId,
          kind,
          title: titleFromFile(file.name),
          fileName: file.name,
          sizeBytes: file.size,
          updatedAt: new Date().toISOString(),
          blob: file,
        }));
        let completed = 0;
        for (const item of added) {
          const storage = await writePdf(item);
          report?.({
            completed: ++completed,
            total: added.length,
            fileName: item.fileName,
            storage,
          });
        }
        setRecords((current) => [...current, ...added]);
        return added.map((item) => item.id);
      } catch {
        setError(true);
        return [];
      } finally {
        setPending(false);
      }
    },
    [courseId],
  );

  const remove = useCallback(async (id: string) => {
    // Preserve the card and its object URL if durable deletion fails.
    await deletePdf(id);
    const url = urls.current.get(id);
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    urls.current.delete(id);
    setRecords((current) => current.filter((item) => item.id !== id));
  }, []);

  return { resources, importFiles, remove, pending, error };
}
