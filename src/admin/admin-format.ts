import type { MessageKey } from "../constants/messages";
import type { AdminContentKind, AdminWorkflowStatus } from "../types/admin";

export function adminStatusKey(status: AdminWorkflowStatus): MessageKey {
  if (status === "under-review") return "underReview";
  if (status === "changes-requested") return "changesRequested";
  if (status === "published") return "publishedStatus";
  return status;
}

export function adminKindKey(kind: AdminContentKind): MessageKey {
  if (kind === "contribution") return "adminKindContribution";
  if (kind === "resource") return "adminKindResource";
  if (kind === "article") return "adminKindArticle";
  if (kind === "homepage") return "adminKindHomepage";
  if (kind === "event") return "adminKindEvent";
  return "adminKindOpportunity";
}
