import type { Resource } from "../types/content";
/** Device PDFs retain their local identifiers; API assets use server UUIDs. */
export const resourceId = (item: Resource) => item.assetId || item.id;
export const resourceRevision = (item: Resource) =>
  item.sourceRevision || item.updatedAt;
