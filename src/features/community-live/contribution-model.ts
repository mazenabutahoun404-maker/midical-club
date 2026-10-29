import type { Schemas } from "../../services/api/schema.generated";
import { ApiError } from "../../services/api/client";
import { record } from "../../services/api/mapping";
import type { Course } from "../../types/content";
export function contributionCourseTarget(course: Course) {
  return {
    subjectCatalogItemId: course.subjectId!,
    subjectOfferingId: course.offeringId || null,
    targetBatchId: course.batchId || null,
    targetAcademicYearId: course.academicYearId || null,
    semesterId: course.semesterId || null,
  };
}
export function contributionTargetKey(value: ContributionDraft["academic"]) {
  return value?.subjectCatalogItemId
    ? JSON.stringify([
        value.subjectCatalogItemId,
        value.subjectOfferingId || null,
        value.targetBatchId || null,
        value.targetAcademicYearId || null,
        value.semesterId || null,
      ])
    : "";
}
export type ContributionDraft = Schemas["ContributionDraftRequest"];
export function contributionDraft(value: unknown): ContributionDraft {
  const v = record(value),
    d = record(v.draft),
    academic = record(v.academic);
  if (
    !v.draft ||
    typeof d.titleAr !== "string" ||
    !academic.contributionTypeId ||
    !academic.subjectCatalogItemId ||
    !Array.isArray(v.topics)
  )
    throw new ApiError(
      "No editable draft was returned. Reload this contribution.",
      422,
      "DRAFT_UNAVAILABLE",
    );
  return {
    academic: {
      contributionTypeId: String(academic.contributionTypeId),
      subjectCatalogItemId: String(academic.subjectCatalogItemId),
      subjectOfferingId: academic.subjectOfferingId as string | null,
      targetBatchId: academic.targetBatchId as string | null,
      targetAcademicYearId: academic.targetAcademicYearId as string | null,
      semesterId: academic.semesterId as string | null,
    },
    titleAr: d.titleAr,
    titleEn: d.titleEn as string | null,
    summaryAr: d.summaryAr as string | null,
    summaryEn: d.summaryEn as string | null,
    contentNotesAr: d.contentNotesAr as string | null,
    contentNotesEn: d.contentNotesEn as string | null,
    topicText: d.topicText as string | null,
    sourceNotes: d.sourceNotes as string | null,
    rightsDeclarationAccepted: d.rightsDeclarationAccepted === true,
    rightsDeclarationVersion: d.rightsDeclarationVersion as string | null,
    topics: [...v.topics] as string[],
    version: String(v.version),
  };
}
export function emptyContribution(): ContributionDraft {
  return {
    academic: { contributionTypeId: "", subjectCatalogItemId: "" },
    titleAr: "",
    titleEn: "",
    summaryAr: "",
    summaryEn: "",
    contentNotesAr: "",
    contentNotesEn: "",
    topicText: "",
    sourceNotes: "",
    rightsDeclarationAccepted: false,
    rightsDeclarationVersion: null,
    topics: [],
  };
}
export function safeReference(value: unknown): string {
  try {
    const url = new URL(String(value));
    return /^https?:$/.test(url.protocol) && !url.username && !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
}
export function contributionPermissions(status: unknown, hasDraft: boolean) {
  const state = String(status)
    .replace(/[-_\s]/g, "")
    .toLowerCase();
  return {
    edit:
      hasDraft && ["draft", "changesrequested", "withdrawn"].includes(state),
    submit:
      hasDraft && ["draft", "changesrequested", "withdrawn"].includes(state),
    withdraw: ["submitted", "underreview", "inreview"].includes(state),
    remove:
      hasDraft && ["draft", "changesrequested", "withdrawn"].includes(state),
    restore: ["deleted", "draftdeleted", "deletedDraft".toLowerCase()].includes(
      state,
    ),
  };
}

export type ContributionReviewCommand =
  | "claim"
  | "assign"
  | "request-changes"
  | "approve"
  | "reject"
  | "publish"
  | "unpublish"
  | "restart";
export function contributionReviewInput(
  detail: unknown,
  command: ContributionReviewCommand,
  fields: {
    revisionId?: string;
    reason?: string;
    feedback?: string;
    reviewerId?: string;
    internalNotes?: string;
  },
) {
  const item = record(detail),
    revisionId = fields.revisionId;
  const target =
    command === "publish"
      ? item.approvedRevisionId
      : item.latestSubmittedRevisionId;
  if (
    ["approve", "reject", "request-changes", "publish"].includes(command) &&
    (!revisionId || revisionId !== target)
  )
    throw new ApiError(
      "Select and review the applicable submitted revision before continuing.",
      422,
      "REVISION_REQUIRED",
    );
  if (
    ["request-changes", "reject"].includes(command) &&
    !fields.feedback?.trim()
  )
    throw new ApiError(
      "Enter feedback for the student.",
      422,
      "FEEDBACK_REQUIRED",
    );
  if (["unpublish", "restart"].includes(command) && !fields.reason?.trim())
    throw new ApiError(
      "Enter a reason for this action.",
      422,
      "REASON_REQUIRED",
    );
  if (command === "assign" && !fields.reviewerId)
    throw new ApiError("Choose a reviewer.", 422, "REVIEWER_REQUIRED");
  return {
    version: String(item.version),
    reason: fields.reason || undefined,
    feedback: fields.feedback || undefined,
    internalNotes: fields.internalNotes || undefined,
    reviewerId: command === "assign" ? fields.reviewerId : undefined,
    revisionId: ["approve", "reject", "request-changes", "publish"].includes(
      command,
    )
      ? revisionId
      : command === "unpublish"
        ? String(item.publishedRevisionId || "") || undefined
        : undefined,
  };
}

export function hasFullContributionType(value: unknown) {
  const v = record(value);
  return (
    Number.isInteger(v.displayOrder) &&
    Object.hasOwn(v, "descriptionAr") &&
    Object.hasOwn(v, "descriptionEn")
  );
}
