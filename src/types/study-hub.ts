import type { Course, Resource } from "./content";
export interface Versioned {
  id: string;
  version: number;
  updatedAt: string;
}
export interface PageAnchor {
  resourceId: string;
  resourceRevision: string;
  page: number;
  x: number;
  y: number;
  quote?: string;
}
export interface MarginNote extends Omit<Versioned, "version"> {
  version: string | number;
  deleted?: boolean;
  ownerId: string;
  courseId: string;
  anchor: PageAnchor;
  body: string;
  color: "amber" | "mint" | "rose";
}
export type MarginInput = Pick<
  MarginNote,
  "courseId" | "anchor" | "body" | "color"
>;
export type RecallGrade = "again" | "hard" | "good" | "easy";
export interface RecallCard extends Versioned {
  ownerId: string;
  courseId: string;
  prompt: string;
  answer: string;
  source?: PageAnchor;
  dueAt: string;
  intervalDays: number;
  reviews: number;
  lastGrade?: RecallGrade;
}
export type RecallInput = Pick<
  RecallCard,
  "courseId" | "prompt" | "answer" | "source"
>;
export interface RecallReview {
  id: string;
  cardId: string;
  grade: RecallGrade;
  reviewedAt: string;
  nextDueAt: string;
}
export interface PackManifest {
  id: string;
  course: Course;
  revision: string;
  resources: Resource[];
  expiresAt: string;
  allowedOffline: boolean;
}
export type PortfolioKind =
  "activity" | "publication" | "leadership" | "volunteering";
export interface PortfolioClaim extends Versioned {
  ownerId: string;
  kind: PortfolioKind;
  title: string;
  description: string;
  occurredAt: string;
  hours?: number;
  evidenceUrl: string;
  status: "draft" | "pending" | "verified" | "rejected" | "revoked";
  review?: {
    actorId: string;
    note: string;
    at: string;
    decision: "verified" | "rejected" | "revoked";
  };
}
export type ClaimInput = Pick<
  PortfolioClaim,
  "kind" | "title" | "description" | "occurredAt" | "hours" | "evidenceUrl"
>;
export interface PortfolioShare {
  enabled: boolean;
  token: string | null;
  displayName: string;
  updatedAt: string;
}
export interface SharedPortfolio {
  displayName: string;
  claims: (Pick<
    PortfolioClaim,
    "id" | "kind" | "title" | "description" | "occurredAt" | "hours" | "status"
  > & { verifiedAt: string })[];
  updatedAt: string;
  source: "device-preview" | "api";
}
export interface RoomMember {
  userId: string;
  displayName: string;
  goal: string;
  joinedAt: string;
  lastSeenAt: string;
}
export interface QuietRoom extends Versioned {
  hostId: string;
  title: string;
  inviteCode: string;
  capacity: number;
  focusMinutes: number;
  restMinutes: number;
  phase: "waiting" | "focus" | "rest" | "finished";
  endsAt: string | null;
  members: RoomMember[];
}
export interface RoomInput {
  title: string;
  capacity: number;
  focusMinutes: number;
  restMinutes: number;
  goal: string;
}
export interface RequestContext {
  signal?: AbortSignal;
}
export interface StudyHubService {
  source: "device-preview" | "api";
  uploadPrivatePdf(
    courseId: string,
    file: File,
    context?: RequestContext,
  ): Promise<Resource>;
  listMargins(
    resourceId?: string,
    context?: RequestContext,
  ): Promise<MarginNote[]>;
  saveMargin(
    input: MarginInput,
    existing?: { id: string; version: string | number },
  ): Promise<MarginNote>;
  deleteMargin(id: string, version: string | number): Promise<void>;
  restoreMargin(note: MarginNote): Promise<MarginNote>;
  listRecall(
    courseId?: string,
    context?: RequestContext,
  ): Promise<RecallCard[]>;
  saveRecall(
    input: RecallInput,
    existing?: { id: string; version: number },
  ): Promise<RecallCard>;
  deleteRecall(id: string, version: number): Promise<void>;
  restoreRecall(card: RecallCard): Promise<RecallCard>;
  reviewRecall(
    id: string,
    version: number,
    grade: RecallGrade,
    requestId: string,
  ): Promise<RecallCard>;
  listReviews(context?: RequestContext): Promise<RecallReview[]>;
  packManifest(
    courseId: string,
    context?: RequestContext,
  ): Promise<PackManifest>;
  listClaims(context?: RequestContext): Promise<PortfolioClaim[]>;
  saveClaim(
    input: ClaimInput,
    existing?: { id: string; version: number },
  ): Promise<PortfolioClaim>;
  deleteClaim(id: string, version: number): Promise<void>;
  restoreClaim(claim: PortfolioClaim): Promise<PortfolioClaim>;
  submitClaim(id: string, version: number): Promise<PortfolioClaim>;
  reviewQueue(context?: RequestContext): Promise<PortfolioClaim[]>;
  reviewClaim(
    id: string,
    version: number,
    decision: "verified" | "rejected",
    note: string,
  ): Promise<PortfolioClaim>;
  revokeClaim(
    id: string,
    version: number,
    note: string,
  ): Promise<PortfolioClaim>;
  getShare(context?: RequestContext): Promise<PortfolioShare>;
  setShare(enabled: boolean): Promise<PortfolioShare>;
  sharedPortfolio(
    token: string,
    context?: RequestContext,
  ): Promise<SharedPortfolio>;
  listRooms(context?: RequestContext): Promise<QuietRoom[]>;
  createRoom(input: RoomInput): Promise<QuietRoom>;
  joinRoom(code: string, goal: string): Promise<QuietRoom>;
  getRoom(id: string, context?: RequestContext): Promise<QuietRoom>;
  heartbeatRoom(id: string): Promise<QuietRoom>;
  leaveRoom(id: string): Promise<void>;
  advanceRoom(
    id: string,
    version: number,
    action: "start" | "rest" | "finish",
  ): Promise<QuietRoom>;
}
export class StudyError extends Error {
  constructor(
    public code:
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "INVALID"
      | "NOT_FOUND"
      | "CONFLICT"
      | "CAPACITY"
      | "STORAGE"
      | "EXPIRED"
      | "NETWORK"
      | "NOT_CONFIGURED",
    public status = 400,
  ) {
    super(code);
    this.name = "StudyError";
  }
}
