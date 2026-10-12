import type {
  PackManifest,
  MarginNote,
  RecallCard,
} from "../../types/study-hub";
import { StudyError } from "../../types/study-hub";
import type { Resource } from "../../types/content";
export interface PackFile {
  resource: Resource;
  blob: Blob;
  sha256: string;
}
export interface OfflinePack {
  key: string;
  ownerId: string;
  courseId: string;
  manifest: PackManifest;
  files: PackFile[];
  margins: MarginNote[];
  recall: RecallCard[];
  downloadedAt: string;
  bytes: number;
}
export interface PackStorage {
  list(owner: string): Promise<OfflinePack[]>;
  put(pack: OfflinePack): Promise<void>;
  remove(key: string): Promise<void>;
}
function database(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined")
    return Promise.reject(new StudyError("STORAGE", 507));
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("medclub-offline-packs-v1", 1);
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore("packs", { keyPath: "key" });
      store.createIndex("ownerId", "ownerId");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(new StudyError("STORAGE", 507));
    req.onblocked = () => reject(new StudyError("STORAGE", 507));
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await database();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction("packs", mode);
      const req = fn(tx.objectStore("packs"));
      let value: T;
      req.onsuccess = () => {
        value = req.result;
      };
      tx.oncomplete = () => resolve(value);
      tx.onerror = tx.onabort = () => reject(new StudyError("STORAGE", 507));
    });
  } finally {
    db.close();
  }
}
export const indexedPackStorage: PackStorage = {
  list: (owner) =>
    transaction("readonly", (s) => s.index("ownerId").getAll(owner)),
  put: async (pack) => {
    await transaction("readwrite", (s) => s.put(pack));
  },
  remove: async (key) => {
    await transaction("readwrite", (s) => s.delete(key));
  },
};
export interface PackProgress {
  file: string;
  completed: number;
  total: number;
  bytes: number;
}
export async function downloadCoursePack({
  ownerId,
  manifest,
  margins = [],
  recall = [],
  storage = indexedPackStorage,
  signal,
  report,
  fetchFile = fetch,
  stillOwner = () => true,
}: {
  ownerId: string;
  manifest: PackManifest;
  margins?: MarginNote[];
  recall?: RecallCard[];
  storage?: PackStorage;
  signal?: AbortSignal;
  report?: (p: PackProgress) => void;
  fetchFile?: typeof fetch;
  stillOwner?: () => boolean;
}): Promise<OfflinePack> {
  if (!Number.isFinite(Date.parse(manifest.expiresAt)))
    throw new StudyError("INVALID");
  if (
    !ownerId ||
    !manifest.allowedOffline ||
    Date.parse(manifest.expiresAt) <= Date.now()
  )
    throw new StudyError("FORBIDDEN", 403);
  if (!manifest.resources.length || manifest.resources.length > 80)
    throw new StudyError("INVALID");
  const ids = new Set<string>();
  const files: PackFile[] = [];
  let bytes = 0;
  for (const resource of manifest.resources) {
    signal?.throwIfAborted();
    if (!stillOwner()) throw new StudyError("UNAUTHORIZED", 401);
    if (
      resource.courseId !== manifest.course.id ||
      !resource.fileUrl ||
      ids.has(resource.id) ||
      resource.mediaType !== "pdf" ||
      resource.offline?.allowed === false
    )
      throw new StudyError("INVALID");
    ids.add(resource.id);
    const url = new URL(resource.fileUrl, location.origin);
    if (
      !["https:", "blob:"].includes(url.protocol) &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      )
    )
      throw new StudyError("INVALID");
    const response = await fetchFile(url.href, {
      signal,
      credentials: url.origin === location.origin ? "same-origin" : "omit",
    });
    if (!response.ok) throw new StudyError("NETWORK", response.status);
    const length = Number(response.headers.get("content-length"));
    if (length > 80 * 1024 * 1024) throw new StudyError("CAPACITY", 413);
    const chunks: Uint8Array[] = [];
    let size = 0;
    const reader = response.body?.getReader();
    if (reader) {
      try {
        while (true) {
          signal?.throwIfAborted();
          const next = await reader.read();
          if (next.done) break;
          size += next.value.byteLength;
          bytes += next.value.byteLength;
          if (size > 80 * 1024 * 1024 || bytes > 300 * 1024 * 1024)
            throw new StudyError("CAPACITY", 413);
          chunks.push(next.value);
          report?.({
            file: resource.title.en,
            completed: files.length,
            total: manifest.resources.length,
            bytes,
          });
        }
      } catch (e) {
        await reader.cancel().catch(() => {});
        throw e;
      } finally {
        reader.releaseLock();
      }
    } else {
      const buffer = new Uint8Array(await response.arrayBuffer());
      size = buffer.length;
      bytes += size;
      if (size > 80 * 1024 * 1024 || bytes > 300 * 1024 * 1024)
        throw new StudyError("CAPACITY", 413);
      chunks.push(buffer);
    }
    const blob = new Blob(chunks as BlobPart[], { type: "application/pdf" });
    if (
      new TextDecoder().decode(await blob.slice(0, 5).arrayBuffer()) !== "%PDF-"
    )
      throw new StudyError("INVALID");
    const digest = await crypto.subtle.digest(
      "SHA-256",
      await blob.arrayBuffer(),
    );
    const sha256 = Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    if (resource.offline?.sha256 && sha256 !== resource.offline.sha256)
      throw new StudyError("CONFLICT", 409);
    const { fileUrl: _, ...safe } = resource;
    files.push({ resource: { ...safe, fileUrl: null }, blob, sha256 });
    report?.({
      file: resource.title.en,
      completed: files.length,
      total: manifest.resources.length,
      bytes,
    });
  }
  signal?.throwIfAborted();
  if (!stillOwner()) throw new StudyError("UNAUTHORIZED", 401);
  const pack: OfflinePack = {
    key: ownerId + ":" + manifest.course.id,
    ownerId,
    courseId: manifest.course.id,
    manifest: { ...manifest, resources: files.map((f) => f.resource) },
    files,
    margins: margins.filter(
      (n) => n.ownerId === ownerId && ids.has(n.anchor.resourceId),
    ),
    recall: recall.filter(
      (c) => c.ownerId === ownerId && c.courseId === manifest.course.id,
    ),
    downloadedAt: new Date().toISOString(),
    bytes,
  };
  await storage.put(pack);
  return pack;
}
export async function requestOfflineShell() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return false;
  try {
    const response = await fetch("/medclub-sw.js", { cache: "no-store" });
    if (
      !response.ok ||
      !response.headers.get("content-type")?.includes("javascript")
    )
      return false;
    const registration = await navigator.serviceWorker.register(
      "/medclub-sw.js",
      { scope: "/" },
    );
    await navigator.serviceWorker.ready;
    return !!(
      registration.active ||
      registration.waiting ||
      registration.installing
    );
  } catch {
    return false;
  }
}
