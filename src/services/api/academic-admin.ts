import { createRecordId } from "../../lib/record-id";
import type { ApiClient } from "./client";
import { ApiError } from "./client";
import type { Operations, Schemas } from "./schema.generated";
import { assertOwner } from "./mapping";
import { requireVersion } from "./accounts";

export type AcademicQuery = Operations["get_api_v1_admin_subjects"]["query"];
export type AcademicBody<N extends keyof Schemas> = Schemas[N];
export type AcademicRecord = Record<string, unknown> & {
  id: string;
  version: string;
};
export type CalendarContext = {
  academicYear: Operations["get_api_v1_admin_academic_years_by_id"]["response"];
  semester: Operations["get_api_v1_admin_semesters_by_id"]["response"];
} | null;
const reason = (value: string | undefined) => {
  if (!value?.trim())
    throw new ApiError(
      "Enter a reason for this action.",
      422,
      "REASON_REQUIRED",
    );
};
const key = (value?: string) => value || createRecordId();
export function assertUnexpired(expiresAt: string) {
  const expires = Date.parse(expiresAt);
  if (!Number.isFinite(expires) || expires <= Date.now())
    throw new ApiError(
      "This preview has expired. Create and review a new preview.",
      409,
      "PREVIEW_EXPIRED",
    );
}
export function validateOffering(input: Schemas["OfferingRequest"]) {
  if (
    !Number.isInteger(input.studyYear) ||
    !input.studyYear ||
    input.studyYear < 1 ||
    input.studyYear > 6
  )
    throw new ApiError(
      "Choose a study year from 1 to 6.",
      422,
      "STUDY_YEAR_REQUIRED",
    );
  if (
    input.scopeType === "BasicBatch" &&
    (!input.batchId || input.studyYear > 3)
  )
    throw new ApiError(
      "Basic offerings require a batch and study year 1–3.",
      422,
      "BATCH_SCOPE_REQUIRED",
    );
  if (
    input.scopeType === "ClinicalYear" &&
    (input.studyYear < 4 ||
      (input.batchId && !input.batchExceptionReason?.trim()))
  )
    throw new ApiError(
      "Clinical offerings require year 4–6; a batch exception needs a reason.",
      422,
      "CLINICAL_SCOPE_INVALID",
    );
}

export function createHttpAcademicAdmin(
  api: ApiClient,
  invalidate: () => void = () => {},
) {
  const changed = async <T>(action: Promise<T>) => {
    const result = await action;
    invalidate();
    return result;
  };
  const currentContext = async (): Promise<CalendarContext> => {
    const owner = api.session.get()?.sessionId;
    const [year, semester] = await Promise.all([
      api.call("get_api_v1_academics_academic_years_current"),
      api.call("get_api_v1_academics_semesters_current"),
    ]);
    assertOwner(api, owner);
    if (!year && !semester) return null;
    if (!year || !semester || semester.academicYearId !== year.id)
      throw new ApiError(
        "The current academic calendar is incomplete. Reload or correct it before activation.",
        409,
        "CURRENT_CONTEXT_INCOMPLETE",
      );
    const [academicYear, term] = await Promise.all([
      api.call("get_api_v1_admin_academic_years_by_id", {
        path: { id: year.id },
      }),
      api.call("get_api_v1_admin_semesters_by_id", {
        path: { id: semester.id },
      }),
    ]);
    assertOwner(api, owner);
    if (
      academicYear.status !== "Current" ||
      term.status !== "Current" ||
      term.academicYearId !== academicYear.id
    )
      throw new ApiError(
        "The current academic calendar changed. Reload before activation.",
        409,
        "CURRENT_CONTEXT_CHANGED",
      );
    requireVersion(academicYear.version);
    requireVersion(term.version);
    return { academicYear, semester: term };
  };
  return {
    currentContext,
    invalidateCatalog: invalidate,
    years: {
      list: (query: AcademicQuery = {}) =>
        api.call("get_api_v1_admin_academic_years", { query }),
      get: (id: string) =>
        api.call("get_api_v1_admin_academic_years_by_id", { path: { id } }),
      create: (body: Schemas["AcademicYearRequest"], commandKey?: string) =>
        changed(
          api.call("post_api_v1_admin_academic_years", {
            body: { ...body, version: undefined },
            idempotencyKey: key(commandKey),
          }),
        ),
      update: (
        id: string,
        body: Schemas["AcademicYearRequest"],
        commandKey?: string,
      ) => {
        requireVersion(body.version);
        return changed(
          api.call("put_api_v1_admin_academic_years_by_id", {
            path: { id },
            body,
            idempotencyKey: key(commandKey),
          }),
        );
      },
      activate: (
        id: string,
        version: string,
        nextSemesterId: string,
        explanation: string,
        context: CalendarContext,
        commandKey: string,
      ) => {
        requireVersion(version);
        reason(explanation);
        if (!nextSemesterId)
          throw new ApiError(
            "Choose a Draft semester in the target year.",
            422,
            "TARGET_SEMESTER_REQUIRED",
          );
        if (context) {
          requireVersion(context.academicYear.version);
          requireVersion(context.semester.version);
        }
        return changed(
          api.call("post_api_v1_admin_academic_years_by_id_make_current", {
            path: { id },
            body: {
              version,
              reason: explanation,
              nextSemesterId,
              ...(context
                ? {
                    expectedCurrentAcademicYearId: context.academicYear.id,
                    expectedCurrentAcademicYearVersion:
                      context.academicYear.version,
                    expectedCurrentSemesterId: context.semester.id,
                    expectedCurrentSemesterVersion: context.semester.version,
                  }
                : {}),
            },
            idempotencyKey: commandKey,
          }),
        );
      },
      archive: (
        id: string,
        body: Schemas["AcademicActionRequest"],
        commandKey?: string,
      ) => {
        requireVersion(body.version);
        reason(body.reason);
        return changed(
          api.call("post_api_v1_admin_academic_years_by_id_archive", {
            path: { id },
            body,
            idempotencyKey: key(commandKey),
          }),
        );
      },
    },
    semesters: {
      list: (academicYearId: string, query: AcademicQuery = {}) =>
        api.call(
          "get_api_v1_admin_academic_years_by_academicYearId_semesters",
          { path: { academicYearId }, query },
        ),
      get: (id: string) =>
        api.call("get_api_v1_admin_semesters_by_id", { path: { id } }),
      create: (
        academicYearId: string,
        body: Schemas["SemesterRequest"],
        commandKey?: string,
      ) =>
        changed(
          api.call(
            "post_api_v1_admin_academic_years_by_academicYearId_semesters",
            {
              path: { academicYearId },
              body: { ...body, version: undefined },
              idempotencyKey: key(commandKey),
            },
          ),
        ),
      update: (
        id: string,
        body: Schemas["SemesterRequest"],
        commandKey?: string,
      ) => {
        requireVersion(body.version);
        return changed(
          api.call("put_api_v1_admin_semesters_by_id", {
            path: { id },
            body,
            idempotencyKey: key(commandKey),
          }),
        );
      },
      makeCurrent: (
        id: string,
        body: Schemas["AcademicActionRequest"],
        commandKey?: string,
      ) => {
        requireVersion(body.version);
        reason(body.reason);
        return changed(
          api.call("post_api_v1_admin_semesters_by_id_make_current", {
            path: { id },
            body,
            idempotencyKey: key(commandKey),
          }),
        );
      },
      archive: (
        id: string,
        body: Schemas["AcademicActionRequest"],
        commandKey?: string,
      ) => {
        requireVersion(body.version);
        reason(body.reason);
        return changed(
          api.call("post_api_v1_admin_semesters_by_id_archive", {
            path: { id },
            body,
            idempotencyKey: key(commandKey),
          }),
        );
      },
      reopen: (
        id: string,
        body: Schemas["AcademicActionRequest"],
        commandKey?: string,
      ) => {
        requireVersion(body.version);
        reason(body.reason);
        return changed(
          api.call("post_api_v1_admin_semesters_by_id_reopen", {
            path: { id },
            body,
            idempotencyKey: key(commandKey),
          }),
        );
      },
    },
    batches: {
      list: (query: AcademicQuery = {}) =>
        api.call("get_api_v1_admin_batches", { query }),
      get: (id: string) =>
        api.call("get_api_v1_admin_batches_by_id", { path: { id } }),
      progress: (id: string) =>
        api.call("get_api_v1_admin_batches_by_id_progress", { path: { id } }),
      create: (body: Schemas["BatchAcademicRequest"], commandKey?: string) =>
        changed(
          api.call("post_api_v1_admin_batches", {
            body: { ...body, version: undefined },
            idempotencyKey: key(commandKey),
          }),
        ),
      update: (
        id: string,
        body: Schemas["BatchAcademicRequest"],
        commandKey?: string,
      ) => {
        requireVersion(body.version);
        return changed(
          api.call("put_api_v1_admin_batches_by_id", {
            path: { id },
            body,
            idempotencyKey: key(commandKey),
          }),
        );
      },
    },
    subjects: {
      list: (query: AcademicQuery = {}) =>
        api.call("get_api_v1_admin_subjects", { query }),
      get: (id: string) =>
        api.call("get_api_v1_admin_subjects_by_id", { path: { id } }),
      create: (body: Schemas["SubjectRequest"], commandKey?: string) =>
        changed(
          api.call("post_api_v1_admin_subjects", {
            body: { ...body, version: undefined },
            idempotencyKey: key(commandKey),
          }),
        ),
      update: (
        id: string,
        body: Schemas["SubjectRequest"],
        commandKey?: string,
      ) => {
        requireVersion(body.version);
        return changed(
          api.call("put_api_v1_admin_subjects_by_id", {
            path: { id },
            body,
            idempotencyKey: key(commandKey),
          }),
        );
      },
    },
    offerings: {
      list: (query: AcademicQuery = {}) =>
        api.call("get_api_v1_admin_subject_offerings", { query }),
      get: (id: string) =>
        api.call("get_api_v1_admin_subject_offerings_by_id", { path: { id } }),
      create: (body: Schemas["OfferingRequest"], commandKey?: string) => {
        validateOffering(body);
        return changed(
          api.call("post_api_v1_admin_subject_offerings", {
            body: { ...body, version: undefined },
            idempotencyKey: key(commandKey),
          }),
        );
      },
      update: (
        id: string,
        body: Schemas["OfferingRequest"],
        commandKey?: string,
      ) => {
        requireVersion(body.version);
        validateOffering(body);
        return changed(
          api.call("put_api_v1_admin_subject_offerings_by_id", {
            path: { id },
            body,
            idempotencyKey: key(commandKey),
          }),
        );
      },
    },
    imports: {
      template: (format: string, teamId?: string) =>
        api.call("get_api_v1_admin_academic_imports_templates_by_format", {
          path: { format },
          query: { teamId },
        }),
      preview: (
        file: File,
        mode: Schemas["ImportMode"],
        teamId?: string,
        commandKey?: string,
      ) =>
        api.call("post_api_v1_admin_academic_imports_preview", {
          body: {
            File: file,
            Mode: mode,
            ...(teamId ? { TeamId: teamId } : {}),
          },
          idempotencyKey: key(commandKey),
        }),
      get: (importId: string, query: AcademicQuery = {}) =>
        api.call("get_api_v1_admin_academic_imports_by_importId", {
          path: { importId },
          query,
        }),
      commit: (
        preview: { id: string; version: string; expiresAt: string },
        mode: Schemas["CommitMode"],
        commandKey: string,
      ) => {
        requireVersion(preview.version);
        assertUnexpired(preview.expiresAt);
        return changed(
          api.call("post_api_v1_admin_academic_imports_by_importId_commit", {
            path: { importId: preview.id },
            body: { version: preview.version, mode },
            idempotencyKey: commandKey,
          }),
        );
      },
      report: (importId: string) =>
        api.call("get_api_v1_admin_academic_imports_by_importId_report", {
          path: { importId },
        }),
    },
    students: {
      profile: (userId: string) =>
        api.call("get_api_v1_admin_students_by_userId_academic_profile", {
          path: { userId },
        }),
      history: (userId: string, query: AcademicQuery = {}) =>
        api.call("get_api_v1_admin_students_by_userId_academic_history", {
          path: { userId },
          query,
        }),
      transfer: (
        userId: string,
        body: Schemas["AcademicTransferRequest"],
        commandKey: string,
      ) => {
        requireVersion(body.version);
        reason(body.reason);
        return changed(
          api.call("post_api_v1_admin_students_by_userId_academic_transfer", {
            path: { userId },
            body,
            idempotencyKey: commandKey,
          }),
        );
      },
      automaticPromotion: (
        userId: string,
        body: Schemas["AutomaticPromotionRequest"],
        commandKey: string,
      ) => {
        requireVersion(body.version);
        reason(body.reason);
        return changed(
          api.call(
            "patch_api_v1_admin_students_by_userId_automatic_promotion",
            { path: { userId }, body, idempotencyKey: commandKey },
          ),
        );
      },
    },
    promotions: {
      preview: (
        body: Schemas["PromotionPreviewRequest"],
        commandKey?: string,
      ) => {
        reason(body.reason);
        return api.call("post_api_v1_admin_academic_promotions_preview", {
          body,
          idempotencyKey: key(commandKey),
        });
      },
      previewTransfer: (
        body: Schemas["PromotionPreviewRequest"],
        commandKey?: string,
      ) => {
        reason(body.reason);
        return api.call(
          "post_api_v1_admin_students_academic_transfer_preview",
          { body, idempotencyKey: key(commandKey) },
        );
      },
      execute: (
        preview: { id: string; version: string; expiresAt: string },
        explanation: string,
        commandKey: string,
      ) => {
        requireVersion(preview.version);
        reason(explanation);
        assertUnexpired(preview.expiresAt);
        return changed(
          api.call("post_api_v1_admin_academic_promotions_execute", {
            body: {
              previewId: preview.id,
              version: preview.version,
              reason: explanation,
            },
            idempotencyKey: commandKey,
          }),
        );
      },
      executeTransfer: (
        preview: { id: string; version: string; expiresAt: string },
        explanation: string,
        commandKey: string,
      ) => {
        requireVersion(preview.version);
        reason(explanation);
        assertUnexpired(preview.expiresAt);
        return changed(
          api.call("post_api_v1_admin_students_academic_transfer_execute", {
            body: {
              previewId: preview.id,
              version: preview.version,
              reason: explanation,
            },
            idempotencyKey: commandKey,
          }),
        );
      },
      list: (query: AcademicQuery = {}) =>
        api.call("get_api_v1_admin_academic_promotions", { query }),
      get: (runId: string) =>
        api.call("get_api_v1_admin_academic_promotions_by_runId", {
          path: { runId },
        }),
      report: (runId: string, query: AcademicQuery = {}) =>
        api.call("get_api_v1_admin_academic_promotions_by_runId_report", {
          path: { runId },
          query,
        }),
      retryFailed: (
        runId: string,
        body: Schemas["AcademicActionRequest"],
        commandKey: string,
      ) => {
        requireVersion(body.version);
        reason(body.reason);
        return changed(
          api.call(
            "post_api_v1_admin_academic_promotions_by_runId_retry_failed",
            { path: { runId }, body, idempotencyKey: commandKey },
          ),
        );
      },
    },
  };
}
export type AcademicAdminService = ReturnType<typeof createHttpAcademicAdmin>;
