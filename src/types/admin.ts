import type { Text } from "./content";

export type AdminContentKind =
  | "contribution"
  | "resource"
  | "article"
  | "homepage"
  | "event"
  | "opportunity";

export type AdminWorkflowStatus =
  "draft" | "under-review" | "changes-requested" | "approved" | "published";

export type AdminReviewAction =
  "request-changes" | "approve" | "publish" | "return-to-review";

export interface AdminStatusEntry {
  id: string;
  status: AdminWorkflowStatus;
  at: string;
  actor: Text;
  note: Text;
}

export interface AdminContentItem {
  id: string;
  kind: AdminContentKind;
  title: Text;
  topic: Text;
  contributor: Text;
  status: AdminWorkflowStatus;
  summary: Text;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
  reviewer?: Text;
  reviewerNote?: Text;
  rightsConfirmed: boolean;
  referenceCount: number;
  versionNumber: number;
  staleAfter?: string;
  history: AdminStatusEntry[];
}

export interface AdminReviewInput {
  itemId: string;
  action: AdminReviewAction;
  note: string;
}

export interface AdminActivityRecord {
  id: string;
  actor: Text;
  role: Text;
  action: Text;
  resource: Text;
  resourceId: string;
  at: string;
  result: "success" | "blocked";
  risk: "normal" | "attention" | "high";
  before?: Record<string, string>;
  after?: Record<string, string>;
}

export interface AdminContentSnapshot {
  title: Text;
  status: AdminWorkflowStatus;
  reviewerNote?: Text;
}

export interface AdminContentVersion {
  id: string;
  itemId: string;
  versionNumber: number;
  createdAt: string;
  createdBy: Text;
  reason: Text;
  snapshot: AdminContentSnapshot;
}

export interface AdminOverview {
  pendingReviews: number;
  approvedWaiting: number;
  publishedThisWeek: number;
  staleContent: number;
  openRecruitmentRoles: number;
  upcomingEvents: number;
  generatedAt: string;
}

export interface AdminService {
  getOverview: () => Promise<AdminOverview>;
  listContent: () => Promise<AdminContentItem[]>;
  reviewContent: (input: AdminReviewInput) => Promise<AdminContentItem>;
  listActivity: () => Promise<AdminActivityRecord[]>;
  listVersions: (itemId?: string) => Promise<AdminContentVersion[]>;
  restoreVersion: (
    itemId: string,
    versionId: string,
  ) => Promise<AdminContentItem>;
}
