import { resourceId, resourceRevision } from "../../lib/resource-identity";
import type { Resource } from "../../types/content";
import type { PageAnchor } from "../../types/study-hub";

export interface CourseNoteRequest {
  token: number;
  courseId: string;
  anchor: PageAnchor;
  resource: Resource;
  pageCount?: number;
}
export interface NotesReader {
  id: string;
  title: string;
  page: number;
  resource: Resource;
  pageCount: number;
}
export function isNotePdf(resource: Resource) {
  if (resource.assetId && resource.mediaType === "pdf") return resource.previewAllowed !== false;
  if (!resource.fileUrl) return false;
  return resource.mediaType === "pdf" ||
    (!resource.mediaType && /\.pdf(?:[?#]|$)/i.test(resource.fileUrl || ""));
}
export function courseNoteError(
  courseId: string,
  resource: Resource | undefined,
  page: string | number,
  pageCount: number | undefined,
  expectedRevision?: string,
): "course" | "pdf" | "revision" | "page" | "loading" | "range" | null {
  if (!courseId) return "course";
  if (!resource || resource.courseId !== courseId || !isNotePdf(resource)) return "pdf";
  if (expectedRevision && resourceRevision(resource) !== expectedRevision) return "revision";
  if (!/^\d+$/.test(String(page)) || !Number.isSafeInteger(Number(page)) || Number(page) < 1) return "page";
  if (!pageCount || !Number.isSafeInteger(pageCount) || pageCount < 1) return "loading";
  return Number(page) > Math.min(pageCount, 20000) ? "range" : null;
}
export function noteLocation(slug: string, anchor: PageAnchor, coursePath: (slug: string) => string) {
  const query = new URLSearchParams({
    pdf: anchor.resourceId,
    page: String(anchor.page),
    revision: anchor.resourceRevision,
  });
  return coursePath(slug) + "?" + query.toString();
}
export function sameSimpleNote(a: { title: string; body: string; updatedAt: string; courseId?: string }, b: typeof a) {
  return a.title === b.title && a.body === b.body && a.updatedAt === b.updatedAt && a.courseId === b.courseId;
}
