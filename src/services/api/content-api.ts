import { requireId } from "./mapping";
import type { Schemas } from "./schema.generated";
import type { ApiClient, ApiInput } from "./client";
import { ApiError } from "./client";
import { requireVersion } from "./accounts";
import { createRecordId } from "../../lib/record-id";
function guard(body: unknown, version: boolean, explanation: boolean) {
  const value =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (version)
    requireVersion(
      typeof value.version === "string" ? value.version : undefined,
    );
  if (explanation && (typeof value.reason !== "string" || !value.reason.trim()))
    throw new ApiError(
      "Enter a reason for this action.",
      422,
      "REASON_REQUIRED",
    );
}
function checkedReview(row: Schemas["ContentReviewSummary"]) {
  return {
    ...row,
    id: requireId(row.id),
    itemId: requireId(row.itemId),
    version: requireId(row.version),
    sourceVersion: requireId(row.sourceVersion),
    revisionId: requireId(row.revisionId),
  };
}
function checkedPage<T>(page: { items?: T[]; totalPages?: number }) {
  if (
    !Array.isArray(page.items) ||
    !Number.isInteger(page.totalPages) ||
    Number(page.totalPages) < 0
  )
    throw new ApiError(
      "The server returned an invalid page.",
      502,
      "INVALID_RESPONSE",
    );
  return { items: page.items, totalPages: page.totalPages! };
}
export function createHttpContentApi(
  api: ApiClient,
  invalidate: () => void = () => {},
) {
  const changed = async <T>(work: Promise<T>) => {
    const result = await work;
    invalidate();
    return result;
  };
  return {
    get_api_v1_content_electronic_examination: (
      input: ApiInput<"get_api_v1_content_electronic_examination">,
    ) => api.call("get_api_v1_content_electronic_examination", input),
    get_api_v1_admin_content_pages: (
      input: ApiInput<"get_api_v1_admin_content_pages">,
    ) => api.call("get_api_v1_admin_content_pages", input),
    post_api_v1_admin_content_pages: (
      input: ApiInput<"post_api_v1_admin_content_pages">,
    ) => {
      guard(input.body, false, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(api.call("post_api_v1_admin_content_pages", command));
    },
    get_api_v1_admin_content_pages_by_id: (
      input: ApiInput<"get_api_v1_admin_content_pages_by_id">,
    ) => api.call("get_api_v1_admin_content_pages_by_id", input),
    put_api_v1_admin_content_pages_by_id: (
      input: ApiInput<"put_api_v1_admin_content_pages_by_id">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(api.call("put_api_v1_admin_content_pages_by_id", command));
    },
    post_api_v1_admin_content_pages_by_id_archive: (
      input: ApiInput<"post_api_v1_admin_content_pages_by_id_archive">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("post_api_v1_admin_content_pages_by_id_archive", command),
      );
    },
    post_api_v1_admin_content_pages_by_id_restore_draft: (
      input: ApiInput<"post_api_v1_admin_content_pages_by_id_restore_draft">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_pages_by_id_restore_draft",
          command,
        ),
      );
    },
    get_api_v1_admin_content_pages_by_id_preview: (
      input: ApiInput<"get_api_v1_admin_content_pages_by_id_preview">,
    ) => api.call("get_api_v1_admin_content_pages_by_id_preview", input),
    post_api_v1_admin_content_pages_by_pageId_sections: (
      input: ApiInput<"post_api_v1_admin_content_pages_by_pageId_sections">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("post_api_v1_admin_content_pages_by_pageId_sections", command),
      );
    },
    put_api_v1_admin_content_sections_by_sectionId: (
      input: ApiInput<"put_api_v1_admin_content_sections_by_sectionId">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("put_api_v1_admin_content_sections_by_sectionId", command),
      );
    },
    delete_api_v1_admin_content_sections_by_sectionId: (
      input: ApiInput<"delete_api_v1_admin_content_sections_by_sectionId">,
    ) => {
      requireVersion(input.query?.version);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("delete_api_v1_admin_content_sections_by_sectionId", command),
      );
    },
    post_api_v1_admin_content_sections_by_sectionId_duplicate: (
      input: ApiInput<"post_api_v1_admin_content_sections_by_sectionId_duplicate">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_sections_by_sectionId_duplicate",
          command,
        ),
      );
    },
    put_api_v1_admin_content_pages_by_pageId_sections_reorder: (
      input: ApiInput<"put_api_v1_admin_content_pages_by_pageId_sections_reorder">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "put_api_v1_admin_content_pages_by_pageId_sections_reorder",
          command,
        ),
      );
    },
    post_api_v1_admin_content_sections_by_sectionId_blocks: (
      input: ApiInput<"post_api_v1_admin_content_sections_by_sectionId_blocks">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_sections_by_sectionId_blocks",
          command,
        ),
      );
    },
    put_api_v1_admin_content_blocks_by_blockId: (
      input: ApiInput<"put_api_v1_admin_content_blocks_by_blockId">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("put_api_v1_admin_content_blocks_by_blockId", command),
      );
    },
    delete_api_v1_admin_content_blocks_by_blockId: (
      input: ApiInput<"delete_api_v1_admin_content_blocks_by_blockId">,
    ) => {
      requireVersion(input.query?.version);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("delete_api_v1_admin_content_blocks_by_blockId", command),
      );
    },
    post_api_v1_admin_content_blocks_by_blockId_duplicate: (
      input: ApiInput<"post_api_v1_admin_content_blocks_by_blockId_duplicate">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_blocks_by_blockId_duplicate",
          command,
        ),
      );
    },
    put_api_v1_admin_content_sections_by_sectionId_blocks_reorder: (
      input: ApiInput<"put_api_v1_admin_content_sections_by_sectionId_blocks_reorder">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "put_api_v1_admin_content_sections_by_sectionId_blocks_reorder",
          command,
        ),
      );
    },
    get_api_v1_admin_content_block_schemas: (
      input: ApiInput<"get_api_v1_admin_content_block_schemas">,
    ) => api.call("get_api_v1_admin_content_block_schemas", input),
    post_api_v1_admin_content_pages_by_pageId_autosave: (
      input: ApiInput<"post_api_v1_admin_content_pages_by_pageId_autosave">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("post_api_v1_admin_content_pages_by_pageId_autosave", command),
      );
    },
    post_api_v1_admin_content_pages_by_pageId_draft_checkpoints: (
      input: ApiInput<"post_api_v1_admin_content_pages_by_pageId_draft_checkpoints">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_pages_by_pageId_draft_checkpoints",
          command,
        ),
      );
    },
    get_api_v1_admin_content_pages_by_pageId_draft_revisions: (
      input: ApiInput<"get_api_v1_admin_content_pages_by_pageId_draft_revisions">,
    ) =>
      api.call(
        "get_api_v1_admin_content_pages_by_pageId_draft_revisions",
        input,
      ),
    get_api_v1_admin_content_pages_by_pageId_draft_revisions_by_revisionId: (
      input: ApiInput<"get_api_v1_admin_content_pages_by_pageId_draft_revisions_by_revisionId">,
    ) =>
      api.call(
        "get_api_v1_admin_content_pages_by_pageId_draft_revisions_by_revisionId",
        input,
      ),
    post_api_v1_admin_content_pages_by_pageId_draft_revisions_by_revisionId_restore:
      (
        input: ApiInput<"post_api_v1_admin_content_pages_by_pageId_draft_revisions_by_revisionId_restore">,
      ) => {
        guard(input.body, true, true);
        const command = {
          ...input,
          idempotencyKey: input.idempotencyKey || createRecordId(),
        };
        return changed(
          api.call(
            "post_api_v1_admin_content_pages_by_pageId_draft_revisions_by_revisionId_restore",
            command,
          ),
        );
      },
    post_api_v1_admin_content_pages_by_pageId_publish: (
      input: ApiInput<"post_api_v1_admin_content_pages_by_pageId_publish">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("post_api_v1_admin_content_pages_by_pageId_publish", command),
      );
    },
    post_api_v1_admin_content_pages_by_pageId_unpublish: (
      input: ApiInput<"post_api_v1_admin_content_pages_by_pageId_unpublish">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_pages_by_pageId_unpublish",
          command,
        ),
      );
    },
    post_api_v1_admin_content_pages_by_pageId_schedules: (
      input: ApiInput<"post_api_v1_admin_content_pages_by_pageId_schedules">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_pages_by_pageId_schedules",
          command,
        ),
      );
    },
    get_api_v1_admin_content_pages_by_pageId_schedules: (
      input: ApiInput<"get_api_v1_admin_content_pages_by_pageId_schedules">,
    ) => api.call("get_api_v1_admin_content_pages_by_pageId_schedules", input),
    put_api_v1_admin_content_pages_by_pageId_schedules_by_scheduleId: (
      input: ApiInput<"put_api_v1_admin_content_pages_by_pageId_schedules_by_scheduleId">,
    ) => {
      requireVersion(input.body.scheduleVersion);
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "put_api_v1_admin_content_pages_by_pageId_schedules_by_scheduleId",
          command,
        ),
      );
    },
    delete_api_v1_admin_content_pages_by_pageId_schedules_by_scheduleId: (
      input: ApiInput<"delete_api_v1_admin_content_pages_by_pageId_schedules_by_scheduleId">,
    ) => {
      requireVersion(input.query?.version);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "delete_api_v1_admin_content_pages_by_pageId_schedules_by_scheduleId",
          command,
        ),
      );
    },
    get_api_v1_admin_content_pages_by_pageId_versions: (
      input: ApiInput<"get_api_v1_admin_content_pages_by_pageId_versions">,
    ) => api.call("get_api_v1_admin_content_pages_by_pageId_versions", input),
    get_api_v1_admin_content_pages_by_pageId_versions_by_versionId: (
      input: ApiInput<"get_api_v1_admin_content_pages_by_pageId_versions_by_versionId">,
    ) =>
      api.call(
        "get_api_v1_admin_content_pages_by_pageId_versions_by_versionId",
        input,
      ),
    get_api_v1_admin_content_pages_by_pageId_versions_compare: (
      input: ApiInput<"get_api_v1_admin_content_pages_by_pageId_versions_compare">,
    ) =>
      api.call(
        "get_api_v1_admin_content_pages_by_pageId_versions_compare",
        input,
      ),
    post_api_v1_admin_content_pages_by_pageId_versions_by_versionId_restore: (
      input: ApiInput<"post_api_v1_admin_content_pages_by_pageId_versions_by_versionId_restore">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_pages_by_pageId_versions_by_versionId_restore",
          command,
        ),
      );
    },
    get_api_v1_admin_content_by_targetType_by_targetId_visibility_rules: (
      input: ApiInput<"get_api_v1_admin_content_by_targetType_by_targetId_visibility_rules">,
    ) =>
      api.call(
        "get_api_v1_admin_content_by_targetType_by_targetId_visibility_rules",
        input,
      ),
    put_api_v1_admin_content_by_targetType_by_targetId_visibility_rules: (
      input: ApiInput<"put_api_v1_admin_content_by_targetType_by_targetId_visibility_rules">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "put_api_v1_admin_content_by_targetType_by_targetId_visibility_rules",
          command,
        ),
      );
    },
    post_api_v1_admin_content_pages_by_pageId_clone: (
      input: ApiInput<"post_api_v1_admin_content_pages_by_pageId_clone">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("post_api_v1_admin_content_pages_by_pageId_clone", command),
      );
    },
    post_api_v1_admin_content_pages_by_pageId_clone_to_offering: (
      input: ApiInput<"post_api_v1_admin_content_pages_by_pageId_clone_to_offering">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_pages_by_pageId_clone_to_offering",
          command,
        ),
      );
    },
    get_api_v1_admin_content_clone_operations_by_operationId: (
      input: ApiInput<"get_api_v1_admin_content_clone_operations_by_operationId">,
    ) =>
      api.call(
        "get_api_v1_admin_content_clone_operations_by_operationId",
        input,
      ),
    get_api_v1_admin_content_reusable_blocks: (
      input: ApiInput<"get_api_v1_admin_content_reusable_blocks">,
    ) => api.call("get_api_v1_admin_content_reusable_blocks", input),
    post_api_v1_admin_content_reusable_blocks: (
      input: ApiInput<"post_api_v1_admin_content_reusable_blocks">,
    ) => {
      guard(input.body, false, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("post_api_v1_admin_content_reusable_blocks", command),
      );
    },
    get_api_v1_admin_content_reusable_blocks_by_id: (
      input: ApiInput<"get_api_v1_admin_content_reusable_blocks_by_id">,
    ) =>
      api
        .call("get_api_v1_admin_content_reusable_blocks_by_id", input)
        .then((row) => ({
          ...row,
          id: requireId(row.id),
          version: requireId(row.version),
        })),
    put_api_v1_admin_content_reusable_blocks_by_id: (
      input: ApiInput<"put_api_v1_admin_content_reusable_blocks_by_id">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("put_api_v1_admin_content_reusable_blocks_by_id", command),
      );
    },
    post_api_v1_admin_content_reusable_blocks_by_id_publish: (
      input: ApiInput<"post_api_v1_admin_content_reusable_blocks_by_id_publish">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_reusable_blocks_by_id_publish",
          command,
        ),
      );
    },
    post_api_v1_admin_content_reusable_blocks_by_id_security_policy: (
      input: ApiInput<"post_api_v1_admin_content_reusable_blocks_by_id_security_policy">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_reusable_blocks_by_id_security_policy",
          command,
        ),
      );
    },
    post_api_v1_admin_content_reusable_blocks_by_id_archive: (
      input: ApiInput<"post_api_v1_admin_content_reusable_blocks_by_id_archive">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_reusable_blocks_by_id_archive",
          command,
        ),
      );
    },
    get_api_v1_admin_content_reusable_blocks_by_id_versions: (
      input: ApiInput<"get_api_v1_admin_content_reusable_blocks_by_id_versions">,
    ) =>
      api.call(
        "get_api_v1_admin_content_reusable_blocks_by_id_versions",
        input,
      ),
    get_api_v1_admin_content_reusable_blocks_by_id_impact: (
      input: ApiInput<"get_api_v1_admin_content_reusable_blocks_by_id_impact">,
    ) =>
      api.call("get_api_v1_admin_content_reusable_blocks_by_id_impact", input),
    post_api_v1_admin_content_reusable_blocks_by_id_versions_by_versionId_restore:
      (
        input: ApiInput<"post_api_v1_admin_content_reusable_blocks_by_id_versions_by_versionId_restore">,
      ) => {
        guard(input.body, true, true);
        const command = {
          ...input,
          idempotencyKey: input.idempotencyKey || createRecordId(),
        };
        return changed(
          api.call(
            "post_api_v1_admin_content_reusable_blocks_by_id_versions_by_versionId_restore",
            command,
          ),
        );
      },
    get_api_v1_admin_content_embed_providers: (
      input: ApiInput<"get_api_v1_admin_content_embed_providers">,
    ) => api.call("get_api_v1_admin_content_embed_providers", input),
    put_api_v1_admin_content_embed_providers_by_id: (
      input: ApiInput<"put_api_v1_admin_content_embed_providers_by_id">,
    ) => {
      guard(input.body, true, true);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("put_api_v1_admin_content_embed_providers_by_id", command),
      );
    },
    get_api_v1_admin_content_review: (
      input: ApiInput<"get_api_v1_admin_content_review">,
    ) =>
      api.call("get_api_v1_admin_content_review", input).then((page) => ({
        ...page,
        ...checkedPage(page),
        items: checkedPage(page).items.map(checkedReview),
      })),
    get_api_v1_admin_content_review_by_id: (
      input: ApiInput<"get_api_v1_admin_content_review_by_id">,
    ) =>
      api
        .call("get_api_v1_admin_content_review_by_id", input)
        .then(checkedReview),
    get_api_v1_admin_content_review_by_id_history: (
      input: ApiInput<"get_api_v1_admin_content_review_by_id_history">,
    ) =>
      api
        .call("get_api_v1_admin_content_review_by_id_history", input)
        .then((page) => ({ ...page, ...checkedPage(page) })),
    post_api_v1_admin_content_review_actions: (
      input: ApiInput<"post_api_v1_admin_content_review_actions">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("post_api_v1_admin_content_review_actions", command),
      );
    },
    get_api_v1_content_editorial_by_kind: (
      input: ApiInput<"get_api_v1_content_editorial_by_kind">,
    ) => api.call("get_api_v1_content_editorial_by_kind", input),
    get_api_v1_content_artwork_by_section: (
      input: ApiInput<"get_api_v1_content_artwork_by_section">,
    ) => api.call("get_api_v1_content_artwork_by_section", input),
    get_api_v1_content_homepage: (
      input: ApiInput<"get_api_v1_content_homepage">,
    ) => api.call("get_api_v1_content_homepage", input),
    get_api_v1_content_pages_by_slug: (
      input: ApiInput<"get_api_v1_content_pages_by_slug">,
    ) => api.call("get_api_v1_content_pages_by_slug", input),
    get_api_v1_content_subjects_offerings_by_offeringId_page: (
      input: ApiInput<"get_api_v1_content_subjects_offerings_by_offeringId_page">,
    ) =>
      api.call(
        "get_api_v1_content_subjects_offerings_by_offeringId_page",
        input,
      ),
    get_api_v1_admin_content_by_resourceType_by_resourceId_versions: (
      input: ApiInput<"get_api_v1_admin_content_by_resourceType_by_resourceId_versions">,
    ) =>
      api.call(
        "get_api_v1_admin_content_by_resourceType_by_resourceId_versions",
        input,
      ),
    get_api_v1_admin_content_by_resourceType_by_resourceId_versions_compare: (
      input: ApiInput<"get_api_v1_admin_content_by_resourceType_by_resourceId_versions_compare">,
    ) =>
      api.call(
        "get_api_v1_admin_content_by_resourceType_by_resourceId_versions_compare",
        input,
      ),
    post_api_v1_admin_content_by_resourceType_by_resourceId_versions_by_versionId_restore_preview:
      (
        input: ApiInput<"post_api_v1_admin_content_by_resourceType_by_resourceId_versions_by_versionId_restore_preview">,
      ) => {
        const command = {
          ...input,
          idempotencyKey: input.idempotencyKey || createRecordId(),
        };
        return changed(
          api.call(
            "post_api_v1_admin_content_by_resourceType_by_resourceId_versions_by_versionId_restore_preview",
            command,
          ),
        );
      },
    post_api_v1_admin_content_by_resourceType_by_resourceId_versions_by_versionId_restore:
      (
        input: ApiInput<"post_api_v1_admin_content_by_resourceType_by_resourceId_versions_by_versionId_restore">,
      ) => {
        guard(input.body, true, true);
        const command = {
          ...input,
          idempotencyKey: input.idempotencyKey || createRecordId(),
        };
        return changed(
          api.call(
            "post_api_v1_admin_content_by_resourceType_by_resourceId_versions_by_versionId_restore",
            command,
          ),
        );
      },
    get_api_v1_admin_content_review_schedules: (
      input: ApiInput<"get_api_v1_admin_content_review_schedules">,
    ) => api.call("get_api_v1_admin_content_review_schedules", input),
    post_api_v1_admin_content_review_schedules: (
      input: ApiInput<"post_api_v1_admin_content_review_schedules">,
    ) => {
      guard(input.body, false, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("post_api_v1_admin_content_review_schedules", command),
      );
    },
    put_api_v1_admin_content_review_schedules_by_id: (
      input: ApiInput<"put_api_v1_admin_content_review_schedules_by_id">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call("put_api_v1_admin_content_review_schedules_by_id", command),
      );
    },
    post_api_v1_admin_content_review_schedules_by_id_mark_reviewed: (
      input: ApiInput<"post_api_v1_admin_content_review_schedules_by_id_mark_reviewed">,
    ) => {
      guard(input.body, true, false);
      const command = {
        ...input,
        idempotencyKey: input.idempotencyKey || createRecordId(),
      };
      return changed(
        api.call(
          "post_api_v1_admin_content_review_schedules_by_id_mark_reviewed",
          command,
        ),
      );
    },
  };
}
export type ContentApi = ReturnType<typeof createHttpContentApi>;
