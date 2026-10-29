export const C = {
  pages: "get_api_v1_admin_content_pages",
  createPage: "post_api_v1_admin_content_pages",
  page: "get_api_v1_admin_content_pages_by_id",
  updatePage: "put_api_v1_admin_content_pages_by_id",
  archivePage: "post_api_v1_admin_content_pages_by_id_archive",
  restoreDraft: "post_api_v1_admin_content_pages_by_id_restore_draft",
  preview: "get_api_v1_admin_content_pages_by_id_preview",
  addSection: "post_api_v1_admin_content_pages_by_pageId_sections",
  updateSection: "put_api_v1_admin_content_sections_by_sectionId",
  deleteSection: "delete_api_v1_admin_content_sections_by_sectionId",
  duplicateSection: "post_api_v1_admin_content_sections_by_sectionId_duplicate",
  reorderSections: "put_api_v1_admin_content_pages_by_pageId_sections_reorder",
  addBlock: "post_api_v1_admin_content_sections_by_sectionId_blocks",
  updateBlock: "put_api_v1_admin_content_blocks_by_blockId",
  deleteBlock: "delete_api_v1_admin_content_blocks_by_blockId",
  duplicateBlock: "post_api_v1_admin_content_blocks_by_blockId_duplicate",
  reorderBlocks:
    "put_api_v1_admin_content_sections_by_sectionId_blocks_reorder",
  schemas: "get_api_v1_admin_content_block_schemas",
  autosave: "post_api_v1_admin_content_pages_by_pageId_autosave",
  checkpoint: "post_api_v1_admin_content_pages_by_pageId_draft_checkpoints",
  draftRevisions: "get_api_v1_admin_content_pages_by_pageId_draft_revisions",
  draftRevision:
    "get_api_v1_admin_content_pages_by_pageId_draft_revisions_by_revisionId",
  restoreDraftRevision:
    "post_api_v1_admin_content_pages_by_pageId_draft_revisions_by_revisionId_restore",
  publish: "post_api_v1_admin_content_pages_by_pageId_publish",
  unpublish: "post_api_v1_admin_content_pages_by_pageId_unpublish",
  addSchedule: "post_api_v1_admin_content_pages_by_pageId_schedules",
  schedules: "get_api_v1_admin_content_pages_by_pageId_schedules",
  updateSchedule:
    "put_api_v1_admin_content_pages_by_pageId_schedules_by_scheduleId",
  deleteSchedule:
    "delete_api_v1_admin_content_pages_by_pageId_schedules_by_scheduleId",
  versions: "get_api_v1_admin_content_pages_by_pageId_versions",
  version: "get_api_v1_admin_content_pages_by_pageId_versions_by_versionId",
  compare: "get_api_v1_admin_content_pages_by_pageId_versions_compare",
  restoreVersion:
    "post_api_v1_admin_content_pages_by_pageId_versions_by_versionId_restore",
  visibility:
    "get_api_v1_admin_content_by_targetType_by_targetId_visibility_rules",
  putVisibility:
    "put_api_v1_admin_content_by_targetType_by_targetId_visibility_rules",
  clone: "post_api_v1_admin_content_pages_by_pageId_clone",
  cloneOffering: "post_api_v1_admin_content_pages_by_pageId_clone_to_offering",
  cloneOperation: "get_api_v1_admin_content_clone_operations_by_operationId",
  reusables: "get_api_v1_admin_content_reusable_blocks",
  addReusable: "post_api_v1_admin_content_reusable_blocks",
  reusable: "get_api_v1_admin_content_reusable_blocks_by_id",
  updateReusable: "put_api_v1_admin_content_reusable_blocks_by_id",
  publishReusable: "post_api_v1_admin_content_reusable_blocks_by_id_publish",
  disableReusable:
    "post_api_v1_admin_content_reusable_blocks_by_id_security_policy",
  archiveReusable: "post_api_v1_admin_content_reusable_blocks_by_id_archive",
  reusableVersions: "get_api_v1_admin_content_reusable_blocks_by_id_versions",
  reusableImpact: "get_api_v1_admin_content_reusable_blocks_by_id_impact",
  restoreReusable:
    "post_api_v1_admin_content_reusable_blocks_by_id_versions_by_versionId_restore",
  embeds: "get_api_v1_admin_content_embed_providers",
  updateEmbed: "put_api_v1_admin_content_embed_providers_by_id",
  reviews: "get_api_v1_admin_content_review",
  review: "get_api_v1_admin_content_review_by_id",
  history: "get_api_v1_admin_content_review_by_id_history",
  reviewAction: "post_api_v1_admin_content_review_actions",
  editorial: "get_api_v1_content_editorial_by_kind",
  artwork: "get_api_v1_content_artwork_by_section",
  homepage: "get_api_v1_content_homepage",
  publicPage: "get_api_v1_content_pages_by_slug",
  offeringPage: "get_api_v1_content_subjects_offerings_by_offeringId_page",
  resourceVersions:
    "get_api_v1_admin_content_by_resourceType_by_resourceId_versions",
  resourceCompare:
    "get_api_v1_admin_content_by_resourceType_by_resourceId_versions_compare",
  rollbackPreview:
    "post_api_v1_admin_content_by_resourceType_by_resourceId_versions_by_versionId_restore_preview",
  rollback:
    "post_api_v1_admin_content_by_resourceType_by_resourceId_versions_by_versionId_restore",
  reviewSchedules: "get_api_v1_admin_content_review_schedules",
  addReviewSchedule: "post_api_v1_admin_content_review_schedules",
  updateReviewSchedule: "put_api_v1_admin_content_review_schedules_by_id",
  markReviewed:
    "post_api_v1_admin_content_review_schedules_by_id_mark_reviewed",
} as const;
