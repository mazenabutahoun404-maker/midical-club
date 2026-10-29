// Generated from the supplied OpenAPI: all 748 operations.
export const apiOperations = {
  "get_api_v1_admin_about": {
    "method": "GET",
    "path": "/api/v1/admin/about",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_about": {
    "method": "PUT",
    "path": "/api/v1/admin/about",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_about_publish": {
    "method": "POST",
    "path": "/api/v1/admin/about/publish",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_about_schedule": {
    "method": "POST",
    "path": "/api/v1/admin/about/schedule",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_about_archive": {
    "method": "POST",
    "path": "/api/v1/admin/about/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_about_versions": {
    "method": "GET",
    "path": "/api/v1/admin/about/versions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_about_versions_by_versionId_restore": {
    "method": "POST",
    "path": "/api/v1/admin/about/versions/{versionId}/restore",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_about_schedules": {
    "method": "GET",
    "path": "/api/v1/admin/about/schedules",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_about_schedules_by_scheduleId_cancel": {
    "method": "POST",
    "path": "/api/v1/admin/about/schedules/{scheduleId}/cancel",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_about_schedules_by_scheduleId_retry": {
    "method": "POST",
    "path": "/api/v1/admin/about/schedules/{scheduleId}/retry",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_about_preview": {
    "method": "GET",
    "path": "/api/v1/admin/about/preview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_about": {
    "method": "GET",
    "path": "/api/v1/about",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academics_resources": {
    "method": "GET",
    "path": "/api/v1/academics/resources",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academics_home": {
    "method": "GET",
    "path": "/api/v1/academics/home",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academics_years": {
    "method": "GET",
    "path": "/api/v1/academics/years",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academics_years_by_studyYear": {
    "method": "GET",
    "path": "/api/v1/academics/years/{studyYear}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academics_batches": {
    "method": "GET",
    "path": "/api/v1/academics/batches",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academics_batches_by_batchId": {
    "method": "GET",
    "path": "/api/v1/academics/batches/{batchId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academics_academic_years_current": {
    "method": "GET",
    "path": "/api/v1/academics/academic-years/current",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academics_semesters_current": {
    "method": "GET",
    "path": "/api/v1/academics/semesters/current",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academics_subjects": {
    "method": "GET",
    "path": "/api/v1/academics/subjects",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academics_subjects_by_subjectId": {
    "method": "GET",
    "path": "/api/v1/academics/subjects/{subjectId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_academic_profile": {
    "method": "GET",
    "path": "/api/v1/me/academic-profile",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_users": {
    "method": "GET",
    "path": "/api/v1/admin/users",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_users_by_id_memberships": {
    "method": "GET",
    "path": "/api/v1/admin/users/{id}/memberships",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_users_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/users/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "patch_api_v1_admin_users_by_id_status": {
    "method": "PATCH",
    "path": "/api/v1/admin/users/{id}/status",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "patch_api_v1_admin_users_by_id_academic_profile": {
    "method": "PATCH",
    "path": "/api/v1/admin/users/{id}/academic-profile",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "put_api_v1_admin_users_by_id_roles": {
    "method": "PUT",
    "path": "/api/v1/admin/users/{id}/roles",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_roles": {
    "method": "GET",
    "path": "/api/v1/admin/roles",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_permissions": {
    "method": "GET",
    "path": "/api/v1/admin/permissions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_roles_by_id_permissions": {
    "method": "PUT",
    "path": "/api/v1/admin/roles/{id}/permissions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_academic_imports_templates_by_format": {
    "method": "GET",
    "path": "/api/v1/admin/academic-imports/templates/{format}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/octet-stream",
    "deprecated": false
  },
  "post_api_v1_admin_academic_imports_preview": {
    "method": "POST",
    "path": "/api/v1/admin/academic-imports/preview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": true,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_academic_imports_by_importId": {
    "method": "GET",
    "path": "/api/v1/admin/academic-imports/{importId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_academic_imports_by_importId_commit": {
    "method": "POST",
    "path": "/api/v1/admin/academic-imports/{importId}/commit",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_academic_imports_by_importId_report": {
    "method": "GET",
    "path": "/api/v1/admin/academic-imports/{importId}/report",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/octet-stream",
    "deprecated": false
  },
  "get_api_v1_admin_students_by_userId_academic_profile": {
    "method": "GET",
    "path": "/api/v1/admin/students/{userId}/academic-profile",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_students_by_userId_academic_history": {
    "method": "GET",
    "path": "/api/v1/admin/students/{userId}/academic-history",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_students_by_userId_academic_transfer": {
    "method": "POST",
    "path": "/api/v1/admin/students/{userId}/academic-transfer",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "patch_api_v1_admin_students_by_userId_automatic_promotion": {
    "method": "PATCH",
    "path": "/api/v1/admin/students/{userId}/automatic-promotion",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_students_academic_transfer_preview": {
    "method": "POST",
    "path": "/api/v1/admin/students/academic-transfer/preview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_students_academic_transfer_execute": {
    "method": "POST",
    "path": "/api/v1/admin/students/academic-transfer/execute",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_academic_promotions_preview": {
    "method": "POST",
    "path": "/api/v1/admin/academic-promotions/preview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_academic_promotions_execute": {
    "method": "POST",
    "path": "/api/v1/admin/academic-promotions/execute",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_academic_promotions": {
    "method": "GET",
    "path": "/api/v1/admin/academic-promotions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_academic_promotions_by_runId": {
    "method": "GET",
    "path": "/api/v1/admin/academic-promotions/{runId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_academic_promotions_by_runId_report": {
    "method": "GET",
    "path": "/api/v1/admin/academic-promotions/{runId}/report",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_academic_promotions_by_runId_retry_failed": {
    "method": "POST",
    "path": "/api/v1/admin/academic-promotions/{runId}/retry-failed",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_academic_years": {
    "method": "GET",
    "path": "/api/v1/admin/academic-years",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_academic_years": {
    "method": "POST",
    "path": "/api/v1/admin/academic-years",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_academic_years_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/academic-years/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_academic_years_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/academic-years/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_academic_years_by_id_make_current": {
    "method": "POST",
    "path": "/api/v1/admin/academic-years/{id}/make-current",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_academic_years_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/academic-years/{id}/archive",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_academic_years_by_academicYearId_semesters": {
    "method": "GET",
    "path": "/api/v1/admin/academic-years/{academicYearId}/semesters",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_academic_years_by_academicYearId_semesters": {
    "method": "POST",
    "path": "/api/v1/admin/academic-years/{academicYearId}/semesters",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_semesters_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/semesters/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_semesters_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/semesters/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_semesters_by_id_make_current": {
    "method": "POST",
    "path": "/api/v1/admin/semesters/{id}/make-current",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_semesters_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/semesters/{id}/archive",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_semesters_by_id_reopen": {
    "method": "POST",
    "path": "/api/v1/admin/semesters/{id}/reopen",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_batches": {
    "method": "GET",
    "path": "/api/v1/admin/batches",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_batches": {
    "method": "POST",
    "path": "/api/v1/admin/batches",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_batches_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/batches/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_batches_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/batches/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_batches_by_id_progress": {
    "method": "GET",
    "path": "/api/v1/admin/batches/{id}/progress",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_subjects": {
    "method": "GET",
    "path": "/api/v1/admin/subjects",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_subjects": {
    "method": "POST",
    "path": "/api/v1/admin/subjects",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_subjects_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/subjects/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_subjects_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/subjects/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_subject_offerings": {
    "method": "GET",
    "path": "/api/v1/admin/subject-offerings",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_subject_offerings": {
    "method": "POST",
    "path": "/api/v1/admin/subject-offerings",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_subject_offerings_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/subject-offerings/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_subject_offerings_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/subject-offerings/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_pages": {
    "method": "GET",
    "path": "/api/v1/admin/content/pages",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_pages_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/content/pages/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_content_pages_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/content/pages/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{id}/archive",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_id_restore_draft": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{id}/restore-draft",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_content_pages_by_id_preview": {
    "method": "GET",
    "path": "/api/v1/admin/content/pages/{id}/preview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_pageId_sections": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{pageId}/sections",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_content_sections_by_sectionId": {
    "method": "PUT",
    "path": "/api/v1/admin/content/sections/{sectionId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_content_sections_by_sectionId": {
    "method": "DELETE",
    "path": "/api/v1/admin/content/sections/{sectionId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_content_sections_by_sectionId_duplicate": {
    "method": "POST",
    "path": "/api/v1/admin/content/sections/{sectionId}/duplicate",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_content_pages_by_pageId_sections_reorder": {
    "method": "PUT",
    "path": "/api/v1/admin/content/pages/{pageId}/sections/reorder",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_content_sections_by_sectionId_blocks": {
    "method": "POST",
    "path": "/api/v1/admin/content/sections/{sectionId}/blocks",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_content_blocks_by_blockId": {
    "method": "PUT",
    "path": "/api/v1/admin/content/blocks/{blockId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_content_blocks_by_blockId": {
    "method": "DELETE",
    "path": "/api/v1/admin/content/blocks/{blockId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_content_blocks_by_blockId_duplicate": {
    "method": "POST",
    "path": "/api/v1/admin/content/blocks/{blockId}/duplicate",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_content_sections_by_sectionId_blocks_reorder": {
    "method": "PUT",
    "path": "/api/v1/admin/content/sections/{sectionId}/blocks/reorder",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_content_block_schemas": {
    "method": "GET",
    "path": "/api/v1/admin/content/block-schemas",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_pageId_autosave": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{pageId}/autosave",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_pageId_draft_checkpoints": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{pageId}/draft-checkpoints",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_pages_by_pageId_draft_revisions": {
    "method": "GET",
    "path": "/api/v1/admin/content/pages/{pageId}/draft-revisions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_pages_by_pageId_draft_revisions_by_revisionId": {
    "method": "GET",
    "path": "/api/v1/admin/content/pages/{pageId}/draft-revisions/{revisionId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_pageId_draft_revisions_by_revisionId_restore": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{pageId}/draft-revisions/{revisionId}/restore",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_pageId_publish": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{pageId}/publish",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_pageId_unpublish": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{pageId}/unpublish",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_pageId_schedules": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{pageId}/schedules",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_pages_by_pageId_schedules": {
    "method": "GET",
    "path": "/api/v1/admin/content/pages/{pageId}/schedules",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_content_pages_by_pageId_schedules_by_scheduleId": {
    "method": "PUT",
    "path": "/api/v1/admin/content/pages/{pageId}/schedules/{scheduleId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_content_pages_by_pageId_schedules_by_scheduleId": {
    "method": "DELETE",
    "path": "/api/v1/admin/content/pages/{pageId}/schedules/{scheduleId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_content_pages_by_pageId_versions": {
    "method": "GET",
    "path": "/api/v1/admin/content/pages/{pageId}/versions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_pages_by_pageId_versions_by_versionId": {
    "method": "GET",
    "path": "/api/v1/admin/content/pages/{pageId}/versions/{versionId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_pages_by_pageId_versions_compare": {
    "method": "GET",
    "path": "/api/v1/admin/content/pages/{pageId}/versions/compare",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_pageId_versions_by_versionId_restore": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{pageId}/versions/{versionId}/restore",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_by_targetType_by_targetId_visibility_rules": {
    "method": "GET",
    "path": "/api/v1/admin/content/{targetType}/{targetId}/visibility-rules",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_content_by_targetType_by_targetId_visibility_rules": {
    "method": "PUT",
    "path": "/api/v1/admin/content/{targetType}/{targetId}/visibility-rules",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_pageId_clone": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{pageId}/clone",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_pages_by_pageId_clone_to_offering": {
    "method": "POST",
    "path": "/api/v1/admin/content/pages/{pageId}/clone-to-offering",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_clone_operations_by_operationId": {
    "method": "GET",
    "path": "/api/v1/admin/content/clone-operations/{operationId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_reusable_blocks": {
    "method": "GET",
    "path": "/api/v1/admin/content/reusable-blocks",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_reusable_blocks": {
    "method": "POST",
    "path": "/api/v1/admin/content/reusable-blocks",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_reusable_blocks_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/content/reusable-blocks/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_content_reusable_blocks_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/content/reusable-blocks/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_reusable_blocks_by_id_publish": {
    "method": "POST",
    "path": "/api/v1/admin/content/reusable-blocks/{id}/publish",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_reusable_blocks_by_id_security_policy": {
    "method": "POST",
    "path": "/api/v1/admin/content/reusable-blocks/{id}/security-policy",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_reusable_blocks_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/content/reusable-blocks/{id}/archive",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_content_reusable_blocks_by_id_versions": {
    "method": "GET",
    "path": "/api/v1/admin/content/reusable-blocks/{id}/versions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_reusable_blocks_by_id_impact": {
    "method": "GET",
    "path": "/api/v1/admin/content/reusable-blocks/{id}/impact",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_reusable_blocks_by_id_versions_by_versionId_restore": {
    "method": "POST",
    "path": "/api/v1/admin/content/reusable-blocks/{id}/versions/{versionId}/restore",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_electronic_examination": {
    "method": "GET",
    "path": "/api/v1/admin/content/electronic-examination",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_content_electronic_examination": {
    "method": "PUT",
    "path": "/api/v1/admin/content/electronic-examination",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_embed_providers": {
    "method": "GET",
    "path": "/api/v1/admin/content/embed-providers",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_content_embed_providers_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/content/embed-providers/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_review": {
    "method": "GET",
    "path": "/api/v1/admin/content-review",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_review_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/content-review/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_review_by_id_history": {
    "method": "GET",
    "path": "/api/v1/admin/content-review/{id}/history",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_review_actions": {
    "method": "POST",
    "path": "/api/v1/admin/content-review/actions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_exams_sets": {
    "method": "GET",
    "path": "/api/v1/admin/exams/sets",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_exams_sets": {
    "method": "POST",
    "path": "/api/v1/admin/exams/sets",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_exams_sets_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/exams/sets/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_exams_sets_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/exams/sets/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_exams_sets_by_id": {
    "method": "DELETE",
    "path": "/api/v1/admin/exams/sets/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_exams_sets_by_id_questions": {
    "method": "GET",
    "path": "/api/v1/admin/exams/sets/{id}/questions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_exams_sets_by_id_questions": {
    "method": "PUT",
    "path": "/api/v1/admin/exams/sets/{id}/questions",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_exams_sets_by_id_questions_by_questionId": {
    "method": "DELETE",
    "path": "/api/v1/admin/exams/sets/{id}/questions/{questionId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_exams_question_reports": {
    "method": "GET",
    "path": "/api/v1/admin/exams/question-reports",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_exams_question_reports_by_id_resolve": {
    "method": "POST",
    "path": "/api/v1/admin/exams/question-reports/{id}/resolve",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_health": {
    "method": "GET",
    "path": "/api/v1/admin/content-health",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_analytics_range": {
    "method": "GET",
    "path": "/api/v1/admin/analytics/range",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_overview": {
    "method": "GET",
    "path": "/api/v1/admin/overview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_analytics_by_module": {
    "method": "GET",
    "path": "/api/v1/admin/analytics/{module}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_reports_exports": {
    "method": "POST",
    "path": "/api/v1/admin/reports/exports",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_reports_exports_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/reports/exports/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_analytics_events": {
    "method": "POST",
    "path": "/api/v1/analytics/events",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_assets_by_assetId_preview_url": {
    "method": "GET",
    "path": "/api/v1/assets/{assetId}/preview-url",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_assets_by_assetId_download_url": {
    "method": "GET",
    "path": "/api/v1/assets/{assetId}/download-url",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_assets_by_assetId_metadata": {
    "method": "GET",
    "path": "/api/v1/assets/{assetId}/metadata",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_asset_imports": {
    "method": "POST",
    "path": "/api/v1/admin/asset-imports",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_asset_imports_by_importId_manifest": {
    "method": "POST",
    "path": "/api/v1/admin/asset-imports/{importId}/manifest",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_asset_imports_by_importId_preview": {
    "method": "GET",
    "path": "/api/v1/admin/asset-imports/{importId}/preview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_asset_imports_by_importId_confirm": {
    "method": "POST",
    "path": "/api/v1/admin/asset-imports/{importId}/confirm",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_asset_imports_by_importId": {
    "method": "GET",
    "path": "/api/v1/admin/asset-imports/{importId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_asset_imports_by_importId_pause": {
    "method": "POST",
    "path": "/api/v1/admin/asset-imports/{importId}/pause",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_asset_imports_by_importId_resume": {
    "method": "POST",
    "path": "/api/v1/admin/asset-imports/{importId}/resume",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_asset_imports_by_importId_cancel": {
    "method": "POST",
    "path": "/api/v1/admin/asset-imports/{importId}/cancel",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_asset_imports_by_importId_items_by_itemId_reuse": {
    "method": "POST",
    "path": "/api/v1/admin/asset-imports/{importId}/items/{itemId}/reuse",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_asset_imports_by_importId_report": {
    "method": "GET",
    "path": "/api/v1/admin/asset-imports/{importId}/report",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_assets_upload_sessions": {
    "method": "POST",
    "path": "/api/v1/admin/assets/upload-sessions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_assets_upload_sessions_by_sessionId": {
    "method": "GET",
    "path": "/api/v1/admin/assets/upload-sessions/{sessionId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_assets_upload_sessions_by_sessionId_parts": {
    "method": "POST",
    "path": "/api/v1/admin/assets/upload-sessions/{sessionId}/parts",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_assets_upload_sessions_by_sessionId_parts_by_partNumber_complete": {
    "method": "POST",
    "path": "/api/v1/admin/assets/upload-sessions/{sessionId}/parts/{partNumber}/complete",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_assets_upload_sessions_by_sessionId_complete": {
    "method": "POST",
    "path": "/api/v1/admin/assets/upload-sessions/{sessionId}/complete",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_assets_upload_sessions_by_sessionId_abort": {
    "method": "POST",
    "path": "/api/v1/admin/assets/upload-sessions/{sessionId}/abort",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_assets_bulk_upload_sessions": {
    "method": "POST",
    "path": "/api/v1/admin/assets/bulk-upload-sessions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_assets_bulk_upload_sessions_by_batchId": {
    "method": "GET",
    "path": "/api/v1/admin/assets/bulk-upload-sessions/{batchId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_assets_bulk_upload_sessions_by_batchId_complete": {
    "method": "POST",
    "path": "/api/v1/admin/assets/bulk-upload-sessions/{batchId}/complete",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_assets": {
    "method": "GET",
    "path": "/api/v1/admin/assets",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_assets_by_assetId": {
    "method": "GET",
    "path": "/api/v1/admin/assets/{assetId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_assets_by_assetId": {
    "method": "DELETE",
    "path": "/api/v1/admin/assets/{assetId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "put_api_v1_admin_assets_by_assetId_metadata": {
    "method": "PUT",
    "path": "/api/v1/admin/assets/{assetId}/metadata",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_assets_by_assetId_access_policy": {
    "method": "PUT",
    "path": "/api/v1/admin/assets/{assetId}/access-policy",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_assets_by_assetId_processing_status": {
    "method": "GET",
    "path": "/api/v1/admin/assets/{assetId}/processing-status",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_assets_by_assetId_retry_processing": {
    "method": "POST",
    "path": "/api/v1/admin/assets/{assetId}/retry-processing",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_assets_by_assetId_links": {
    "method": "POST",
    "path": "/api/v1/admin/assets/{assetId}/links",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_assets_by_assetId_links_by_linkId": {
    "method": "DELETE",
    "path": "/api/v1/admin/assets/{assetId}/links/{linkId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_assets_by_assetId_restore": {
    "method": "POST",
    "path": "/api/v1/admin/assets/{assetId}/restore",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_assets_search": {
    "method": "GET",
    "path": "/api/v1/admin/assets/search",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_audit_logs": {
    "method": "GET",
    "path": "/api/v1/admin/audit-logs",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_audit_logs_exports": {
    "method": "POST",
    "path": "/api/v1/admin/audit-logs/exports",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_audit_logs_exports_by_exportId": {
    "method": "GET",
    "path": "/api/v1/admin/audit-logs/exports/{exportId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_audit_logs_exports_by_exportId_download": {
    "method": "GET",
    "path": "/api/v1/admin/audit-logs/exports/{exportId}/download",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "text/csv",
    "deprecated": false
  },
  "get_api_v1_admin_security_alerts": {
    "method": "GET",
    "path": "/api/v1/admin/security-alerts",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "patch_api_v1_admin_security_alerts_by_id_read": {
    "method": "PATCH",
    "path": "/api/v1/admin/security-alerts/{id}/read",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_auth_register": {
    "method": "POST",
    "path": "/api/v1/auth/register",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_auth_email_send": {
    "method": "POST",
    "path": "/api/v1/auth/email/send",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_auth_email_verify": {
    "method": "POST",
    "path": "/api/v1/auth/email/verify",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_auth_login": {
    "method": "POST",
    "path": "/api/v1/auth/login",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_auth_refresh": {
    "method": "POST",
    "path": "/api/v1/auth/refresh",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_auth_forgot_password": {
    "method": "POST",
    "path": "/api/v1/auth/forgot-password",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_auth_reset_password": {
    "method": "POST",
    "path": "/api/v1/auth/reset-password",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_auth_me": {
    "method": "GET",
    "path": "/api/v1/auth/me",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_auth_logout": {
    "method": "POST",
    "path": "/api/v1/auth/logout",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_calendar": {
    "method": "GET",
    "path": "/api/v1/calendar",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_calendar_by_id": {
    "method": "GET",
    "path": "/api/v1/calendar/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_calendar_personal_entries": {
    "method": "POST",
    "path": "/api/v1/calendar/personal-entries",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_calendar_personal_entries_by_id": {
    "method": "PUT",
    "path": "/api/v1/calendar/personal-entries/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_calendar_personal_entries_by_id": {
    "method": "DELETE",
    "path": "/api/v1/calendar/personal-entries/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_calendar_entries": {
    "method": "GET",
    "path": "/api/v1/admin/calendar/entries",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_calendar_entries": {
    "method": "POST",
    "path": "/api/v1/admin/calendar/entries",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_calendar_entries_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/calendar/entries/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_calendar_entries_by_id": {
    "method": "DELETE",
    "path": "/api/v1/admin/calendar/entries/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "put_api_v1_admin_calendar_entries_by_id_audience": {
    "method": "PUT",
    "path": "/api/v1/admin/calendar/entries/{id}/audience",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_conferences_by_id_speakers": {
    "method": "POST",
    "path": "/api/v1/admin/conferences/{id}/speakers",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_conferences_by_id_speakers_by_speakerId": {
    "method": "PUT",
    "path": "/api/v1/admin/conferences/{id}/speakers/{speakerId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_conferences_by_id_speakers_by_speakerId": {
    "method": "DELETE",
    "path": "/api/v1/admin/conferences/{id}/speakers/{speakerId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_conferences_by_id_schedule": {
    "method": "POST",
    "path": "/api/v1/admin/conferences/{id}/schedule",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_conferences_by_id_schedule_by_itemId": {
    "method": "PUT",
    "path": "/api/v1/admin/conferences/{id}/schedule/{itemId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_conferences_by_id_schedule_by_itemId": {
    "method": "DELETE",
    "path": "/api/v1/admin/conferences/{id}/schedule/{itemId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_conferences_by_id_sponsors": {
    "method": "POST",
    "path": "/api/v1/admin/conferences/{id}/sponsors",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_conferences_by_id_sponsors_by_sponsorId": {
    "method": "PUT",
    "path": "/api/v1/admin/conferences/{id}/sponsors/{sponsorId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_conferences_by_id_sponsors_by_sponsorId": {
    "method": "DELETE",
    "path": "/api/v1/admin/conferences/{id}/sponsors/{sponsorId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_conferences_by_slug_by_collection": {
    "method": "GET",
    "path": "/api/v1/conferences/{slug}/{collection}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_content_editorial_by_kind": {
    "method": "GET",
    "path": "/api/v1/content/editorial/{kind}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_content_artwork_by_section": {
    "method": "GET",
    "path": "/api/v1/content/artwork/{section}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_content_homepage": {
    "method": "GET",
    "path": "/api/v1/content/homepage",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_content_pages_by_slug": {
    "method": "GET",
    "path": "/api/v1/content/pages/{slug}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_content_subjects_offerings_by_offeringId_page": {
    "method": "GET",
    "path": "/api/v1/content/subjects/offerings/{offeringId}/page",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_content_electronic_examination": {
    "method": "GET",
    "path": "/api/v1/content/electronic-examination",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_by_resourceType_by_resourceId_versions": {
    "method": "GET",
    "path": "/api/v1/admin/content/{resourceType}/{resourceId}/versions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_by_resourceType_by_resourceId_versions_compare": {
    "method": "GET",
    "path": "/api/v1/admin/content/{resourceType}/{resourceId}/versions/compare",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_by_resourceType_by_resourceId_versions_by_versionId_restore_preview": {
    "method": "POST",
    "path": "/api/v1/admin/content/{resourceType}/{resourceId}/versions/{versionId}/restore/preview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_by_resourceType_by_resourceId_versions_by_versionId_restore": {
    "method": "POST",
    "path": "/api/v1/admin/content/{resourceType}/{resourceId}/versions/{versionId}/restore",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_content_review_schedules": {
    "method": "GET",
    "path": "/api/v1/admin/content-review/schedules",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_review_schedules": {
    "method": "POST",
    "path": "/api/v1/admin/content-review/schedules",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_content_review_schedules_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/content-review/schedules/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_content_review_schedules_by_id_mark_reviewed": {
    "method": "POST",
    "path": "/api/v1/admin/content-review/schedules/{id}/mark-reviewed",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_contributions_types": {
    "method": "GET",
    "path": "/api/v1/contributions/types",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_contributions_types": {
    "method": "GET",
    "path": "/api/v1/admin/contributions/types",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_contributions_types": {
    "method": "POST",
    "path": "/api/v1/admin/contributions/types",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_contributions_types_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/contributions/types/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentorship_areas": {
    "method": "GET",
    "path": "/api/v1/mentorship/areas",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_mentorship_areas": {
    "method": "GET",
    "path": "/api/v1/admin/mentorship/areas",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_mentorship_areas": {
    "method": "POST",
    "path": "/api/v1/admin/mentorship/areas",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_mentorship_areas_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/mentorship/areas/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_contributions_my": {
    "method": "GET",
    "path": "/api/v1/contributions/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_contributions_my_by_id": {
    "method": "GET",
    "path": "/api/v1/contributions/my/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_contributions": {
    "method": "POST",
    "path": "/api/v1/contributions",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_contributions_by_id_draft": {
    "method": "PUT",
    "path": "/api/v1/contributions/{id}/draft",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_contributions_by_id_draft_assets": {
    "method": "POST",
    "path": "/api/v1/contributions/{id}/draft/assets",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_contributions_by_id_draft_assets_by_linkId": {
    "method": "DELETE",
    "path": "/api/v1/contributions/{id}/draft/assets/{linkId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_contributions_by_id_draft_links": {
    "method": "POST",
    "path": "/api/v1/contributions/{id}/draft/links",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_contributions_by_id_draft_links_by_linkId": {
    "method": "DELETE",
    "path": "/api/v1/contributions/{id}/draft/links/{linkId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_contributions_by_id_submit": {
    "method": "POST",
    "path": "/api/v1/contributions/{id}/submit",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_contributions_by_id_withdraw": {
    "method": "POST",
    "path": "/api/v1/contributions/{id}/withdraw",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_contributions_by_id_delete_draft": {
    "method": "POST",
    "path": "/api/v1/contributions/{id}/delete-draft",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_contributions_by_id_restore_draft": {
    "method": "POST",
    "path": "/api/v1/contributions/{id}/restore-draft",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_contributions_by_id_revisions": {
    "method": "GET",
    "path": "/api/v1/contributions/{id}/revisions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_contributions_by_id_revisions": {
    "method": "GET",
    "path": "/api/v1/admin/contributions/{id}/revisions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_contributions_by_id_reviews": {
    "method": "GET",
    "path": "/api/v1/contributions/{id}/reviews",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_contributions_by_id_reviews": {
    "method": "GET",
    "path": "/api/v1/admin/contributions/{id}/reviews",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_contributions": {
    "method": "GET",
    "path": "/api/v1/admin/contributions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_contributions_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/contributions/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_contributions_by_id_claim": {
    "method": "POST",
    "path": "/api/v1/admin/contributions/{id}/claim",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_contributions_by_id_assign": {
    "method": "POST",
    "path": "/api/v1/admin/contributions/{id}/assign",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_contributions_by_id_request_changes": {
    "method": "POST",
    "path": "/api/v1/admin/contributions/{id}/request-changes",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_contributions_by_id_approve": {
    "method": "POST",
    "path": "/api/v1/admin/contributions/{id}/approve",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_contributions_by_id_reject": {
    "method": "POST",
    "path": "/api/v1/admin/contributions/{id}/reject",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_contributions_by_id_publish": {
    "method": "POST",
    "path": "/api/v1/admin/contributions/{id}/publish",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_contributions_by_id_unpublish": {
    "method": "POST",
    "path": "/api/v1/admin/contributions/{id}/unpublish",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_contributions_by_id_restart": {
    "method": "POST",
    "path": "/api/v1/admin/contributions/{id}/restart",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_contributions_by_id_reclassify": {
    "method": "POST",
    "path": "/api/v1/admin/contributions/{id}/reclassify",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academic_contributions_by_id": {
    "method": "GET",
    "path": "/api/v1/academic/contributions/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_academic_contributions": {
    "method": "GET",
    "path": "/api/v1/academic/contributions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_opportunities": {
    "method": "GET",
    "path": "/api/v1/opportunities",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_opportunities_saved": {
    "method": "GET",
    "path": "/api/v1/opportunities/saved",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_opportunities_by_id": {
    "method": "GET",
    "path": "/api/v1/opportunities/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_opportunities_by_id_save": {
    "method": "POST",
    "path": "/api/v1/opportunities/{id}/save",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_opportunities_by_id_save": {
    "method": "DELETE",
    "path": "/api/v1/opportunities/{id}/save",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_opportunities_by_id_reminder_preference": {
    "method": "PUT",
    "path": "/api/v1/opportunities/{id}/reminder-preference",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_opportunities": {
    "method": "GET",
    "path": "/api/v1/admin/opportunities",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_opportunities": {
    "method": "POST",
    "path": "/api/v1/admin/opportunities",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_opportunities_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/opportunities/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_opportunities_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/opportunities/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_opportunities_by_id_publish": {
    "method": "POST",
    "path": "/api/v1/admin/opportunities/{id}/publish",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_opportunities_by_id_close": {
    "method": "POST",
    "path": "/api/v1/admin/opportunities/{id}/close",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_opportunities_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/opportunities/{id}/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentors": {
    "method": "GET",
    "path": "/api/v1/mentors",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentors_by_id": {
    "method": "GET",
    "path": "/api/v1/mentors/{id}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentor_profile": {
    "method": "POST",
    "path": "/api/v1/mentor/profile",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_mentor_profile_by_id": {
    "method": "PUT",
    "path": "/api/v1/mentor/profile/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_mentors": {
    "method": "GET",
    "path": "/api/v1/admin/mentors",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_mentors": {
    "method": "POST",
    "path": "/api/v1/admin/mentors",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_mentors_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/mentors/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_mentors_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/mentors/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_mentors_by_id_approve": {
    "method": "POST",
    "path": "/api/v1/admin/mentors/{id}/approve",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_mentors_by_id_pause": {
    "method": "POST",
    "path": "/api/v1/admin/mentors/{id}/pause",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_mentors_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/mentors/{id}/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentors_by_id_availability": {
    "method": "GET",
    "path": "/api/v1/mentors/{id}/availability",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentor_by_id_questions": {
    "method": "POST",
    "path": "/api/v1/mentor/{id}/questions",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_mentor_by_id_questions_by_questionId": {
    "method": "PUT",
    "path": "/api/v1/mentor/{id}/questions/{questionId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_mentorship_questions": {
    "method": "POST",
    "path": "/api/v1/admin/mentorship/questions",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentorship_public_qa": {
    "method": "GET",
    "path": "/api/v1/mentorship/public-qa",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_mentorship_public_qa": {
    "method": "GET",
    "path": "/api/v1/admin/mentorship/public-qa",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_mentorship_public_qa": {
    "method": "POST",
    "path": "/api/v1/admin/mentorship/public-qa",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_mentorship_public_qa_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/mentorship/public-qa/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_mentorship_public_qa_by_id_publish": {
    "method": "POST",
    "path": "/api/v1/admin/mentorship/public-qa/{id}/publish",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_mentorship_public_qa_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/mentorship/public-qa/{id}/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentor_availability": {
    "method": "POST",
    "path": "/api/v1/mentor/availability",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_mentor_availability_by_id": {
    "method": "PUT",
    "path": "/api/v1/mentor/availability/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentorship_requests": {
    "method": "POST",
    "path": "/api/v1/mentorship/requests",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentorship_requests_my": {
    "method": "GET",
    "path": "/api/v1/mentorship/requests/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentorship_sessions_my": {
    "method": "GET",
    "path": "/api/v1/mentorship/sessions/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentorship_group_sessions": {
    "method": "GET",
    "path": "/api/v1/mentorship/group-sessions",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentorship_group_sessions_my": {
    "method": "GET",
    "path": "/api/v1/mentorship/group-sessions/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentorship_group_sessions_by_slotId_register": {
    "method": "POST",
    "path": "/api/v1/mentorship/group-sessions/{slotId}/register",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentorship_group_sessions_by_slotId_cancel": {
    "method": "POST",
    "path": "/api/v1/mentorship/group-sessions/{slotId}/cancel",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentor_requests": {
    "method": "GET",
    "path": "/api/v1/mentor/requests",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentor_sessions": {
    "method": "GET",
    "path": "/api/v1/mentor/sessions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentor_requests_by_id_accept": {
    "method": "POST",
    "path": "/api/v1/mentor/requests/{id}/accept",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentor_requests_by_id_reject": {
    "method": "POST",
    "path": "/api/v1/mentor/requests/{id}/reject",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentorship_requests_by_id_withdraw": {
    "method": "POST",
    "path": "/api/v1/mentorship/requests/{id}/withdraw",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentorship_sessions_by_id_cancel": {
    "method": "POST",
    "path": "/api/v1/mentorship/sessions/{id}/cancel",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentor_sessions_by_id_complete": {
    "method": "POST",
    "path": "/api/v1/mentor/sessions/{id}/complete",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_mentorship_sessions_by_id_feedback": {
    "method": "POST",
    "path": "/api/v1/mentorship/sessions/{id}/feedback",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_mentor_by_id_feedback": {
    "method": "GET",
    "path": "/api/v1/mentor/{id}/feedback",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_mentors_by_id_feedback": {
    "method": "GET",
    "path": "/api/v1/admin/mentors/{id}/feedback",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_team_recruitment_openings": {
    "method": "GET",
    "path": "/api/v1/team-recruitment/openings",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_team_recruitment_openings_by_id": {
    "method": "GET",
    "path": "/api/v1/team-recruitment/openings/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_team_recruitment_openings_by_id_apply": {
    "method": "POST",
    "path": "/api/v1/team-recruitment/openings/{id}/apply",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_team_applications_drafts": {
    "method": "POST",
    "path": "/api/v1/team-applications/drafts",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_team_applications_drafts_by_id": {
    "method": "PUT",
    "path": "/api/v1/team-applications/drafts/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_team_applications_drafts_by_id_submit": {
    "method": "POST",
    "path": "/api/v1/team-applications/drafts/{id}/submit",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_team_applications_my": {
    "method": "GET",
    "path": "/api/v1/team-applications/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_team_applications_my_by_id": {
    "method": "GET",
    "path": "/api/v1/team-applications/my/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_team_applications_my_by_id_withdraw": {
    "method": "POST",
    "path": "/api/v1/team-applications/my/{id}/withdraw",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_team_applications_my_by_id_onboarding_tasks_by_taskId_toggle": {
    "method": "POST",
    "path": "/api/v1/team-applications/my/{id}/onboarding-tasks/{taskId}/toggle",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_teams_by_teamId_recruitment_openings": {
    "method": "GET",
    "path": "/api/v1/admin/teams/{teamId}/recruitment/openings",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_teams_by_teamId_recruitment_openings": {
    "method": "POST",
    "path": "/api/v1/admin/teams/{teamId}/recruitment/openings",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_recruitment_openings_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/recruitment/openings/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_recruitment_openings_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/recruitment/openings/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_recruitment_openings_by_id_open": {
    "method": "POST",
    "path": "/api/v1/admin/recruitment/openings/{id}/open",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_recruitment_openings_by_id_close": {
    "method": "POST",
    "path": "/api/v1/admin/recruitment/openings/{id}/close",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_recruitment_openings_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/recruitment/openings/{id}/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_recruitment_openings_by_id_applications": {
    "method": "GET",
    "path": "/api/v1/admin/recruitment/openings/{id}/applications",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_team_applications_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/team-applications/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_team_applications_by_id_transition": {
    "method": "POST",
    "path": "/api/v1/admin/team-applications/{id}/transition",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_team_applications_by_id_interviews": {
    "method": "POST",
    "path": "/api/v1/admin/team-applications/{id}/interviews",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_application_interviews_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/application-interviews/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_member_profiles": {
    "method": "GET",
    "path": "/api/v1/member-profiles",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_member_profiles_my": {
    "method": "GET",
    "path": "/api/v1/member-profiles/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_member_profiles_my_by_id": {
    "method": "GET",
    "path": "/api/v1/member-profiles/my/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_member_profiles_by_id": {
    "method": "GET",
    "path": "/api/v1/member-profiles/{id}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_member_profiles_my_public_visibility": {
    "method": "PUT",
    "path": "/api/v1/member-profiles/my/public-visibility",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_teams_by_teamId_members_profiles": {
    "method": "GET",
    "path": "/api/v1/admin/teams/{teamId}/members/profiles",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_member_profiles_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/member-profiles/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_member_profiles_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/member-profiles/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_member_profiles_by_id_positions": {
    "method": "POST",
    "path": "/api/v1/admin/member-profiles/{id}/positions",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_complete": {
    "method": "POST",
    "path": "/api/v1/admin/member-profiles/{id}/onboarding/{taskId}/complete",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_waive": {
    "method": "POST",
    "path": "/api/v1/admin/member-profiles/{id}/onboarding/{taskId}/waive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_member_profiles_by_id_activate": {
    "method": "POST",
    "path": "/api/v1/admin/member-profiles/{id}/activate",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_teams_by_teamId_onboarding_templates": {
    "method": "GET",
    "path": "/api/v1/admin/teams/{teamId}/onboarding-templates",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_teams_by_teamId_onboarding_templates": {
    "method": "POST",
    "path": "/api/v1/admin/teams/{teamId}/onboarding-templates",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_teams_by_teamId_onboarding_templates_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/teams/{teamId}/onboarding-templates/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_engagement_search": {
    "method": "GET",
    "path": "/api/v1/engagement/search",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_engagement_dashboard": {
    "method": "GET",
    "path": "/api/v1/engagement/dashboard",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_events": {
    "method": "GET",
    "path": "/api/v1/events",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_events_by_slug": {
    "method": "GET",
    "path": "/api/v1/events/{slug}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_events": {
    "method": "GET",
    "path": "/api/v1/admin/events",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_events": {
    "method": "POST",
    "path": "/api/v1/admin/events",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_events_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/events/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_events_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/events/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_events_by_id_publish": {
    "method": "POST",
    "path": "/api/v1/admin/events/{id}/publish",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_events_by_id_cancel": {
    "method": "POST",
    "path": "/api/v1/admin/events/{id}/cancel",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_events_by_id_complete": {
    "method": "POST",
    "path": "/api/v1/admin/events/{id}/complete",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_events_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/events/{id}/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_events_by_id_register": {
    "method": "POST",
    "path": "/api/v1/events/{id}/register",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_events_by_id_registration_my": {
    "method": "GET",
    "path": "/api/v1/events/{id}/registration/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_events_by_id_registration_confirm_promotion": {
    "method": "POST",
    "path": "/api/v1/events/{id}/registration/confirm-promotion",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_events_by_id_registration": {
    "method": "DELETE",
    "path": "/api/v1/events/{id}/registration",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_events_registrations_my": {
    "method": "GET",
    "path": "/api/v1/events/registrations/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_events_by_id_attendance_qr_my": {
    "method": "GET",
    "path": "/api/v1/events/{id}/attendance-qr/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_events_by_id_attendance_qr_regenerate": {
    "method": "POST",
    "path": "/api/v1/events/{id}/attendance-qr/regenerate",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_events_by_id_registrations": {
    "method": "POST",
    "path": "/api/v1/admin/events/{id}/registrations",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_events_by_id_registrations": {
    "method": "GET",
    "path": "/api/v1/admin/events/{id}/registrations",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_events_by_id_registrations_by_registrationId_answers": {
    "method": "GET",
    "path": "/api/v1/admin/events/{id}/registrations/{registrationId}/answers",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_events_by_id_waitlist": {
    "method": "GET",
    "path": "/api/v1/admin/events/{id}/waitlist",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_events_by_id_waitlist_promote_next": {
    "method": "POST",
    "path": "/api/v1/admin/events/{id}/waitlist/promote-next",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_events_by_id_waitlist_by_entryId_override_promote": {
    "method": "POST",
    "path": "/api/v1/admin/events/{id}/waitlist/{entryId}/override-promote",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_attendance_scan": {
    "method": "POST",
    "path": "/api/v1/attendance/scan",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_events_by_id_attendance": {
    "method": "GET",
    "path": "/api/v1/admin/events/{id}/attendance",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_events_by_id_attendance_manual": {
    "method": "POST",
    "path": "/api/v1/admin/events/{id}/attendance/manual",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_attendance_by_recordId_correct": {
    "method": "PUT",
    "path": "/api/v1/admin/attendance/{recordId}/correct",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_certificate_templates": {
    "method": "GET",
    "path": "/api/v1/admin/certificate-templates",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_certificate_templates": {
    "method": "POST",
    "path": "/api/v1/admin/certificate-templates",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_certificate_templates_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/certificate-templates/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_certificates_my": {
    "method": "GET",
    "path": "/api/v1/certificates/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_certificates_my_by_id": {
    "method": "GET",
    "path": "/api/v1/certificates/my/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_certificates_verify_by_code": {
    "method": "GET",
    "path": "/api/v1/certificates/verify/{code}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_events_by_id_certificates_issue": {
    "method": "POST",
    "path": "/api/v1/admin/events/{id}/certificates/issue",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_events_by_id_certificates": {
    "method": "GET",
    "path": "/api/v1/admin/events/{id}/certificates",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_certificates_by_id_revoke": {
    "method": "POST",
    "path": "/api/v1/admin/certificates/{id}/revoke",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_certificates_by_id_reissue": {
    "method": "POST",
    "path": "/api/v1/admin/certificates/{id}/reissue",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_volunteer_hours_my": {
    "method": "GET",
    "path": "/api/v1/volunteer-hours/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_volunteer_hours_by_id": {
    "method": "GET",
    "path": "/api/v1/volunteer-hours/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_volunteer_hours": {
    "method": "POST",
    "path": "/api/v1/volunteer-hours",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_volunteer_hours_by_id_draft": {
    "method": "PUT",
    "path": "/api/v1/volunteer-hours/{id}/draft",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_volunteer_hours_by_id_submit": {
    "method": "POST",
    "path": "/api/v1/volunteer-hours/{id}/submit",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_volunteer_hours_by_id_cancel": {
    "method": "POST",
    "path": "/api/v1/volunteer-hours/{id}/cancel",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_volunteer_hours": {
    "method": "GET",
    "path": "/api/v1/admin/volunteer-hours",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_volunteer_hours": {
    "method": "POST",
    "path": "/api/v1/admin/volunteer-hours",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_volunteer_hours_by_id_approve": {
    "method": "POST",
    "path": "/api/v1/admin/volunteer-hours/{id}/approve",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_volunteer_hours_by_id_reject": {
    "method": "POST",
    "path": "/api/v1/admin/volunteer-hours/{id}/reject",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_volunteer_hours_by_id_correct": {
    "method": "POST",
    "path": "/api/v1/admin/volunteer-hours/{id}/correct",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_events_by_id_evaluation_form": {
    "method": "GET",
    "path": "/api/v1/events/{id}/evaluation-form",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_events_by_id_evaluations": {
    "method": "POST",
    "path": "/api/v1/events/{id}/evaluations",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_events_by_id_reports_by_report": {
    "method": "GET",
    "path": "/api/v1/admin/events/{id}/reports/{report}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_events_by_id_reports_export": {
    "method": "POST",
    "path": "/api/v1/admin/events/{id}/reports/export",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_event_exports_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/event-exports/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_event_jobs": {
    "method": "GET",
    "path": "/api/v1/admin/event-jobs",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_event_jobs_by_id_retry": {
    "method": "POST",
    "path": "/api/v1/admin/event-jobs/{id}/retry",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_exams_sets": {
    "method": "GET",
    "path": "/api/v1/exams/sets",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_exams_sets_by_id": {
    "method": "GET",
    "path": "/api/v1/exams/sets/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_exams_sets_by_id_questions": {
    "method": "GET",
    "path": "/api/v1/exams/sets/{id}/questions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_exams_questions": {
    "method": "GET",
    "path": "/api/v1/exams/questions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_exams_questions_facets": {
    "method": "GET",
    "path": "/api/v1/exams/questions/facets",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_exams_sets_by_id_attempts": {
    "method": "POST",
    "path": "/api/v1/exams/sets/{id}/attempts",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_exams_sets_custom": {
    "method": "POST",
    "path": "/api/v1/exams/sets/custom",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_exams_question_reports": {
    "method": "POST",
    "path": "/api/v1/exams/question-reports",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_executive_bodies_by_id_set_current": {
    "method": "POST",
    "path": "/api/v1/admin/executive-bodies/{id}/set-current",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_executive_bodies_by_id_members": {
    "method": "POST",
    "path": "/api/v1/admin/executive-bodies/{id}/members",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_executive_bodies_by_id_members_by_memberId": {
    "method": "PUT",
    "path": "/api/v1/admin/executive-bodies/{id}/members/{memberId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_executive_bodies_by_id_members_by_memberId": {
    "method": "DELETE",
    "path": "/api/v1/admin/executive-bodies/{id}/members/{memberId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_executive_bodies_current": {
    "method": "GET",
    "path": "/api/v1/executive-bodies/current",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_search_files": {
    "method": "GET",
    "path": "/api/v1/search/files",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_governance_versions": {
    "method": "GET",
    "path": "/api/v1/admin/governance/versions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_governance_versions_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/governance/versions/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_governance_versions_by_id_compare": {
    "method": "GET",
    "path": "/api/v1/admin/governance/versions/{id}/compare",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_governance_versions_by_id_restore_preview": {
    "method": "POST",
    "path": "/api/v1/admin/governance/versions/{id}/restore/preview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_governance_versions_by_id_restore": {
    "method": "POST",
    "path": "/api/v1/admin/governance/versions/{id}/restore",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_governance_access": {
    "method": "GET",
    "path": "/api/v1/governance/access",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_governance_overview": {
    "method": "GET",
    "path": "/api/v1/admin/governance/overview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_governance_access_requests": {
    "method": "GET",
    "path": "/api/v1/admin/governance/access-requests",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_governance_access_requests": {
    "method": "POST",
    "path": "/api/v1/admin/governance/access-requests",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_governance_access_requests_my": {
    "method": "GET",
    "path": "/api/v1/governance/access-requests/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_governance_access_requests_by_id": {
    "method": "GET",
    "path": "/api/v1/governance/access-requests/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_governance_access_requests_by_id_decisions": {
    "method": "POST",
    "path": "/api/v1/admin/governance/access-requests/{id}/decisions",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_calendar_export_ics": {
    "method": "GET",
    "path": "/api/v1/calendar/export.ics",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "text/calendar",
    "deprecated": false
  },
  "get_api_v1_calendar_subscription_tokens": {
    "method": "GET",
    "path": "/api/v1/calendar/subscription-tokens",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_calendar_subscription_tokens": {
    "method": "POST",
    "path": "/api/v1/calendar/subscription-tokens",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_calendar_subscription_tokens_by_id_rotate": {
    "method": "POST",
    "path": "/api/v1/calendar/subscription-tokens/{id}/rotate",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_calendar_subscription_tokens_by_id": {
    "method": "DELETE",
    "path": "/api/v1/calendar/subscription-tokens/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_calendar_subscriptions_by_rawToken_ics": {
    "method": "GET",
    "path": "/api/v1/calendar/subscriptions/{rawToken}.ics",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "text/calendar",
    "deprecated": false
  },
  "get_api_v1_student_learning_progress": {
    "method": "GET",
    "path": "/api/v1/student/learning-progress",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_student_learning_progress_by_contentType_by_contentId": {
    "method": "GET",
    "path": "/api/v1/student/learning-progress/{contentType}/{contentId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_student_learning_progress_by_contentType_by_contentId": {
    "method": "PUT",
    "path": "/api/v1/student/learning-progress/{contentType}/{contentId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_student_learning_progress_by_contentType_by_contentId": {
    "method": "DELETE",
    "path": "/api/v1/student/learning-progress/{contentType}/{contentId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_student_learning_progress_by_contentType_by_contentId_complete": {
    "method": "POST",
    "path": "/api/v1/student/learning-progress/{contentType}/{contentId}/complete",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_student_recent_items": {
    "method": "GET",
    "path": "/api/v1/student/recent-items",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_student_recent_items": {
    "method": "DELETE",
    "path": "/api/v1/student/recent-items",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_student_recent_items_by_itemType_by_itemId_opened": {
    "method": "POST",
    "path": "/api/v1/student/recent-items/{itemType}/{itemId}/opened",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_medclub_team_featured": {
    "method": "GET",
    "path": "/api/v1/medclub-team/featured",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_medclub_team_overview": {
    "method": "GET",
    "path": "/api/v1/medclub-team/overview",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_medclub_team_search": {
    "method": "GET",
    "path": "/api/v1/medclub-team/search",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_media_albums_by_id_items": {
    "method": "POST",
    "path": "/api/v1/admin/media/albums/{id}/items",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_media_albums_by_id_items_by_itemId": {
    "method": "PUT",
    "path": "/api/v1/admin/media/albums/{id}/items/{itemId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_media_albums_by_id_items_by_itemId": {
    "method": "DELETE",
    "path": "/api/v1/admin/media/albums/{id}/items/{itemId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_media_campaigns_by_id_albums": {
    "method": "GET",
    "path": "/api/v1/admin/media/campaigns/{id}/albums",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_media_campaigns_by_id_albums": {
    "method": "POST",
    "path": "/api/v1/admin/media/campaigns/{id}/albums",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_media_campaigns_by_campaignSlug_albums": {
    "method": "GET",
    "path": "/api/v1/media/campaigns/{campaignSlug}/albums",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_media_campaigns_by_campaignSlug_albums_by_albumSlug": {
    "method": "GET",
    "path": "/api/v1/media/campaigns/{campaignSlug}/albums/{albumSlug}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_health_startup": {
    "method": "GET",
    "path": "/health/startup",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_health_live": {
    "method": "GET",
    "path": "/health/live",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_health_ready": {
    "method": "GET",
    "path": "/health/ready",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_exam_attempts": {
    "method": "GET",
    "path": "/api/v1/me/exam-attempts",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_exam_attempts_by_id": {
    "method": "GET",
    "path": "/api/v1/me/exam-attempts/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_me_exam_attempts_by_id": {
    "method": "PUT",
    "path": "/api/v1/me/exam-attempts/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_exam_attempts_by_id_submit": {
    "method": "POST",
    "path": "/api/v1/me/exam-attempts/{id}/submit",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_exam_attempts_by_id_abandon": {
    "method": "POST",
    "path": "/api/v1/me/exam-attempts/{id}/abandon",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_exam_notebook": {
    "method": "GET",
    "path": "/api/v1/me/exam-notebook",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_exam_notebook_questions": {
    "method": "GET",
    "path": "/api/v1/me/exam-notebook/questions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_me_exam_notebook_by_questionId_bookmark": {
    "method": "PUT",
    "path": "/api/v1/me/exam-notebook/{questionId}/bookmark",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_portfolio_claims": {
    "method": "GET",
    "path": "/api/v1/me/portfolio/claims",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_portfolio_claims": {
    "method": "POST",
    "path": "/api/v1/me/portfolio/claims",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "patch_api_v1_me_portfolio_claims_by_id": {
    "method": "PATCH",
    "path": "/api/v1/me/portfolio/claims/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_me_portfolio_claims_by_id": {
    "method": "DELETE",
    "path": "/api/v1/me/portfolio/claims/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_portfolio_claims_by_id_restore": {
    "method": "POST",
    "path": "/api/v1/me/portfolio/claims/{id}/restore",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_portfolio_claims_by_id_submit": {
    "method": "POST",
    "path": "/api/v1/me/portfolio/claims/{id}/submit",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_portfolio_claims_by_id_history": {
    "method": "GET",
    "path": "/api/v1/me/portfolio/claims/{id}/history",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_portfolio_share": {
    "method": "GET",
    "path": "/api/v1/me/portfolio/share",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_me_portfolio_share": {
    "method": "PUT",
    "path": "/api/v1/me/portfolio/share",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_notifications": {
    "method": "GET",
    "path": "/api/v1/notifications",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_notifications_unread_count": {
    "method": "GET",
    "path": "/api/v1/notifications/unread-count",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "patch_api_v1_notifications_by_id_read": {
    "method": "PATCH",
    "path": "/api/v1/notifications/{id}/read",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_notifications_read_all": {
    "method": "POST",
    "path": "/api/v1/notifications/read-all",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_notification_preferences": {
    "method": "GET",
    "path": "/api/v1/notification-preferences",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_notification_preferences": {
    "method": "PUT",
    "path": "/api/v1/notification-preferences",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_notification_campaigns": {
    "method": "GET",
    "path": "/api/v1/admin/notification-campaigns",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_notification_campaigns": {
    "method": "POST",
    "path": "/api/v1/admin/notification-campaigns",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_notification_campaigns_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/notification-campaigns/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_notification_campaigns_by_id_preview_audience": {
    "method": "POST",
    "path": "/api/v1/admin/notification-campaigns/{id}/preview-audience",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_notification_campaigns_by_id_publish": {
    "method": "POST",
    "path": "/api/v1/admin/notification-campaigns/{id}/publish",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_notification_campaigns_by_id_cancel": {
    "method": "POST",
    "path": "/api/v1/admin/notification-campaigns/{id}/cancel",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_student_followed_subjects": {
    "method": "GET",
    "path": "/api/v1/student/followed-subjects",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_student_followed_subjects": {
    "method": "POST",
    "path": "/api/v1/student/followed-subjects",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_student_followed_subjects_by_id": {
    "method": "DELETE",
    "path": "/api/v1/student/followed-subjects/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_system_settings": {
    "method": "GET",
    "path": "/api/v1/admin/system-settings",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_system_settings_by_key": {
    "method": "PUT",
    "path": "/api/v1/admin/system-settings/{key}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_health_details": {
    "method": "GET",
    "path": "/api/v1/admin/health/details",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_operations_backups": {
    "method": "GET",
    "path": "/api/v1/admin/operations/backups",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_operations_restore_verifications": {
    "method": "GET",
    "path": "/api/v1/admin/operations/restore-verifications",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_operations_restore_verifications": {
    "method": "POST",
    "path": "/api/v1/admin/operations/restore-verifications",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_library_collections": {
    "method": "GET",
    "path": "/api/v1/library/collections",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_library_collections": {
    "method": "POST",
    "path": "/api/v1/library/collections",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_library_collections_by_id": {
    "method": "GET",
    "path": "/api/v1/library/collections/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_library_collections_by_id": {
    "method": "PUT",
    "path": "/api/v1/library/collections/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_library_collections_by_id": {
    "method": "DELETE",
    "path": "/api/v1/library/collections/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "put_api_v1_library_collections_reorder": {
    "method": "PUT",
    "path": "/api/v1/library/collections/reorder",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_library_collections_by_id_items": {
    "method": "POST",
    "path": "/api/v1/library/collections/{id}/items",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_library_collections_by_id_items_by_itemId": {
    "method": "DELETE",
    "path": "/api/v1/library/collections/{id}/items/{itemId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "put_api_v1_library_collections_by_id_items_reorder": {
    "method": "PUT",
    "path": "/api/v1/library/collections/{id}/items/reorder",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_portfolio_review_queue": {
    "method": "GET",
    "path": "/api/v1/portfolio/review-queue",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_portfolio_claims_by_id_review": {
    "method": "POST",
    "path": "/api/v1/portfolio/claims/{id}/review",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_portfolio_claims_by_id_revoke": {
    "method": "POST",
    "path": "/api/v1/portfolio/claims/{id}/revoke",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_portfolios_by_token": {
    "method": "GET",
    "path": "/api/v1/portfolios/{token}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "patch_api_v1_me_profile": {
    "method": "PATCH",
    "path": "/api/v1/me/profile",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_me_email_change_request": {
    "method": "POST",
    "path": "/api/v1/me/email-change/request",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_email_change_confirm": {
    "method": "POST",
    "path": "/api/v1/me/email-change/confirm",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_me_change_password": {
    "method": "POST",
    "path": "/api/v1/me/change-password",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "delete_api_v1_me_account": {
    "method": "DELETE",
    "path": "/api/v1/me/account",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_by_contentType_categories": {
    "method": "GET",
    "path": "/api/v1/admin/{contentType}/categories",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType_categories": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}/categories",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_by_contentType_categories_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/{contentType}/categories/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType_categories_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}/categories/{id}/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_by_contentType_categories": {
    "method": "GET",
    "path": "/api/v1/{contentType}/categories",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_medclub_team_jobs_by_id_retry": {
    "method": "POST",
    "path": "/api/v1/admin/medclub-team/jobs/{id}/retry",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_medclub_team_monitoring": {
    "method": "GET",
    "path": "/api/v1/admin/medclub-team/monitoring",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_by_contentType": {
    "method": "GET",
    "path": "/api/v1/admin/{contentType}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_media_by_mediaType": {
    "method": "GET",
    "path": "/api/v1/admin/media/{mediaType}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_media_by_mediaType": {
    "method": "POST",
    "path": "/api/v1/admin/media/{mediaType}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_by_contentType_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/{contentType}/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_by_contentType_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/{contentType}/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_media_by_mediaType_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/media/{mediaType}/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_media_by_mediaType_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/media/{mediaType}/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType_by_id_publish": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}/{id}/publish",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_media_by_mediaType_by_id_publish": {
    "method": "POST",
    "path": "/api/v1/admin/media/{mediaType}/{id}/publish",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType_by_id_schedule_publication": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}/{id}/schedule-publication",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_media_by_mediaType_by_id_schedule_publication": {
    "method": "POST",
    "path": "/api/v1/admin/media/{mediaType}/{id}/schedule-publication",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}/{id}/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_media_by_mediaType_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/media/{mediaType}/{id}/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_by_contentType_by_id_versions": {
    "method": "GET",
    "path": "/api/v1/admin/{contentType}/{id}/versions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_media_by_mediaType_by_id_versions": {
    "method": "GET",
    "path": "/api/v1/admin/media/{mediaType}/{id}/versions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType_by_id_versions_by_versionId_restore": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}/{id}/versions/{versionId}/restore",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_media_by_mediaType_by_id_versions_by_versionId_restore": {
    "method": "POST",
    "path": "/api/v1/admin/media/{mediaType}/{id}/versions/{versionId}/restore",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_by_contentType_by_id_preview": {
    "method": "GET",
    "path": "/api/v1/admin/{contentType}/{id}/preview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_media_by_mediaType_by_id_preview": {
    "method": "GET",
    "path": "/api/v1/admin/media/{mediaType}/{id}/preview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_by_contentType_by_id_schedules": {
    "method": "GET",
    "path": "/api/v1/admin/{contentType}/{id}/schedules",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_media_by_mediaType_by_id_schedules": {
    "method": "GET",
    "path": "/api/v1/admin/media/{mediaType}/{id}/schedules",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType_by_id_schedules_by_scheduleId_retry": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}/{id}/schedules/{scheduleId}/retry",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_media_by_mediaType_by_id_schedules_by_scheduleId_retry": {
    "method": "POST",
    "path": "/api/v1/admin/media/{mediaType}/{id}/schedules/{scheduleId}/retry",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType_by_id_schedules_by_scheduleId_cancel": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}/{id}/schedules/{scheduleId}/cancel",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_media_by_mediaType_by_id_schedules_by_scheduleId_cancel": {
    "method": "POST",
    "path": "/api/v1/admin/media/{mediaType}/{id}/schedules/{scheduleId}/cancel",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType_by_id_assets": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}/{id}/assets",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_media_by_mediaType_by_id_assets": {
    "method": "POST",
    "path": "/api/v1/admin/media/{mediaType}/{id}/assets",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_by_contentType_by_id_assets_by_linkId": {
    "method": "PUT",
    "path": "/api/v1/admin/{contentType}/{id}/assets/{linkId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_by_contentType_by_id_assets_by_linkId": {
    "method": "DELETE",
    "path": "/api/v1/admin/{contentType}/{id}/assets/{linkId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_media_by_mediaType_by_id_assets_by_linkId": {
    "method": "PUT",
    "path": "/api/v1/admin/media/{mediaType}/{id}/assets/{linkId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_media_by_mediaType_by_id_assets_by_linkId": {
    "method": "DELETE",
    "path": "/api/v1/admin/media/{mediaType}/{id}/assets/{linkId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType_by_id_links": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}/{id}/links",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_media_by_mediaType_by_id_links": {
    "method": "POST",
    "path": "/api/v1/admin/media/{mediaType}/{id}/links",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_by_contentType_by_id_links_by_linkId": {
    "method": "PUT",
    "path": "/api/v1/admin/{contentType}/{id}/links/{linkId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_by_contentType_by_id_links_by_linkId": {
    "method": "DELETE",
    "path": "/api/v1/admin/{contentType}/{id}/links/{linkId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_media_by_mediaType_by_id_links_by_linkId": {
    "method": "PUT",
    "path": "/api/v1/admin/media/{mediaType}/{id}/links/{linkId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_media_by_mediaType_by_id_links_by_linkId": {
    "method": "DELETE",
    "path": "/api/v1/admin/media/{mediaType}/{id}/links/{linkId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_by_contentType": {
    "method": "GET",
    "path": "/api/v1/{contentType}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_media_by_mediaType": {
    "method": "GET",
    "path": "/api/v1/media/{mediaType}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_by_contentType_by_slug": {
    "method": "GET",
    "path": "/api/v1/{contentType}/{slug}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_media_by_mediaType_by_slug": {
    "method": "GET",
    "path": "/api/v1/media/{mediaType}/{slug}",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_by_contentType_by_id_schedule": {
    "method": "POST",
    "path": "/api/v1/admin/{contentType}/{id}/schedule",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": true
  },
  "post_api_v1_admin_media_by_mediaType_by_id_schedule": {
    "method": "POST",
    "path": "/api/v1/admin/media/{mediaType}/{id}/schedule",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": true
  },
  "get_api_v1_me_quiet_rooms": {
    "method": "GET",
    "path": "/api/v1/me/quiet-rooms",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_quiet_rooms": {
    "method": "POST",
    "path": "/api/v1/quiet-rooms",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_quiet_rooms_join": {
    "method": "POST",
    "path": "/api/v1/quiet-rooms/join",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_quiet_rooms_by_id": {
    "method": "GET",
    "path": "/api/v1/quiet-rooms/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_quiet_rooms_by_id_presence": {
    "method": "PUT",
    "path": "/api/v1/quiet-rooms/{id}/presence",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_quiet_rooms_by_id_members_me": {
    "method": "DELETE",
    "path": "/api/v1/quiet-rooms/{id}/members/me",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_quiet_rooms_by_id_timer": {
    "method": "POST",
    "path": "/api/v1/quiet-rooms/{id}/timer",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_roadmaps": {
    "method": "GET",
    "path": "/api/v1/roadmaps",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_roadmaps_by_id": {
    "method": "GET",
    "path": "/api/v1/roadmaps/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_roadmaps_by_id_progress": {
    "method": "GET",
    "path": "/api/v1/roadmaps/{id}/progress",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_roadmaps_by_id_items_by_itemId_progress": {
    "method": "PUT",
    "path": "/api/v1/roadmaps/{id}/items/{itemId}/progress",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_roadmaps": {
    "method": "GET",
    "path": "/api/v1/admin/roadmaps",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_roadmaps": {
    "method": "POST",
    "path": "/api/v1/admin/roadmaps",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_roadmaps_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/roadmaps/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_roadmaps_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/roadmaps/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_roadmaps_by_id_publish": {
    "method": "POST",
    "path": "/api/v1/admin/roadmaps/{id}/publish",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_roadmaps_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/roadmaps/{id}/archive",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_roadmaps_by_id_versions": {
    "method": "GET",
    "path": "/api/v1/admin/roadmaps/{id}/versions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_search_synonyms": {
    "method": "GET",
    "path": "/api/v1/admin/search/synonyms",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_search_synonyms": {
    "method": "POST",
    "path": "/api/v1/admin/search/synonyms",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_search_synonyms_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/search/synonyms/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_search_synonyms_by_id_activate": {
    "method": "POST",
    "path": "/api/v1/admin/search/synonyms/{id}/activate",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_search_synonyms_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/search/synonyms/{id}/archive",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_search_abbreviations": {
    "method": "GET",
    "path": "/api/v1/admin/search/abbreviations",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_search_abbreviations": {
    "method": "POST",
    "path": "/api/v1/admin/search/abbreviations",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_search_abbreviations_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/search/abbreviations/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_search_query_approvals": {
    "method": "POST",
    "path": "/api/v1/admin/search/query-approvals",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_search_top_queries": {
    "method": "GET",
    "path": "/api/v1/admin/search/top-queries",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_search_zero_results": {
    "method": "GET",
    "path": "/api/v1/admin/search/zero-results",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_search_reindex": {
    "method": "POST",
    "path": "/api/v1/admin/search/reindex",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_search_reindex_by_id_resume": {
    "method": "POST",
    "path": "/api/v1/admin/search/reindex/{id}/resume",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_search_reindex_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/search/reindex/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_security_students_by_userId_verification": {
    "method": "POST",
    "path": "/api/v1/admin/security/students/{userId}/verification",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_security_users_by_userId_revoke_sessions": {
    "method": "POST",
    "path": "/api/v1/admin/security/users/{userId}/revoke-sessions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_store_categories": {
    "method": "GET",
    "path": "/api/v1/store/categories",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_products": {
    "method": "GET",
    "path": "/api/v1/store/products",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_products_by_productId": {
    "method": "GET",
    "path": "/api/v1/store/products/{productId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_categories": {
    "method": "GET",
    "path": "/api/v1/store/admin/categories",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_categories": {
    "method": "POST",
    "path": "/api/v1/store/admin/categories",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_store_admin_categories_by_id": {
    "method": "PUT",
    "path": "/api/v1/store/admin/categories/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_categories_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/store/admin/categories/{id}/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_products": {
    "method": "GET",
    "path": "/api/v1/store/admin/products",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_products": {
    "method": "POST",
    "path": "/api/v1/store/admin/products",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_products_by_id": {
    "method": "GET",
    "path": "/api/v1/store/admin/products/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_store_admin_products_by_id": {
    "method": "PUT",
    "path": "/api/v1/store/admin/products/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_products_by_id_activate": {
    "method": "POST",
    "path": "/api/v1/store/admin/products/{id}/activate",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_products_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/store/admin/products/{id}/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_products_by_id_assets": {
    "method": "POST",
    "path": "/api/v1/store/admin/products/{id}/assets",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_store_admin_products_by_id_assets_by_assetLinkId": {
    "method": "DELETE",
    "path": "/api/v1/store/admin/products/{id}/assets/{assetLinkId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_products_by_id_variants": {
    "method": "POST",
    "path": "/api/v1/store/admin/products/{id}/variants",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_store_admin_variants_by_variantId": {
    "method": "PUT",
    "path": "/api/v1/store/admin/variants/{variantId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_variants_by_variantId_archive": {
    "method": "POST",
    "path": "/api/v1/store/admin/variants/{variantId}/archive",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_store_admin_variants_by_variantId_inventory_cost": {
    "method": "PUT",
    "path": "/api/v1/store/admin/variants/{variantId}/inventory-cost",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_variants_by_variantId_inventory": {
    "method": "GET",
    "path": "/api/v1/store/admin/variants/{variantId}/inventory",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_variants_by_variantId_inventory_history": {
    "method": "GET",
    "path": "/api/v1/store/admin/variants/{variantId}/inventory-history",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_variants_by_variantId_inventory_adjustments": {
    "method": "POST",
    "path": "/api/v1/store/admin/variants/{variantId}/inventory-adjustments",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_inventory_rebuild": {
    "method": "POST",
    "path": "/api/v1/store/admin/inventory/rebuild",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_settings": {
    "method": "GET",
    "path": "/api/v1/store/admin/settings",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_store_admin_settings": {
    "method": "PUT",
    "path": "/api/v1/store/admin/settings",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_monitoring": {
    "method": "GET",
    "path": "/api/v1/store/admin/monitoring",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_monitoring_jobs_by_id_retry": {
    "method": "POST",
    "path": "/api/v1/store/admin/monitoring/jobs/{id}/retry",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_cart": {
    "method": "GET",
    "path": "/api/v1/store/cart",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_store_cart": {
    "method": "DELETE",
    "path": "/api/v1/store/cart",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_store_cart_items_by_variantId": {
    "method": "PUT",
    "path": "/api/v1/store/cart/items/{variantId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_store_cart_items_by_itemId": {
    "method": "DELETE",
    "path": "/api/v1/store/cart/items/{itemId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_orders": {
    "method": "POST",
    "path": "/api/v1/store/orders",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_orders_my": {
    "method": "GET",
    "path": "/api/v1/store/orders/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_orders_my_by_orderId": {
    "method": "GET",
    "path": "/api/v1/store/orders/my/{orderId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_orders_my_by_orderId_cancel": {
    "method": "POST",
    "path": "/api/v1/store/orders/my/{orderId}/cancel",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_orders_my_by_orderId_pickup_code": {
    "method": "GET",
    "path": "/api/v1/store/orders/my/{orderId}/pickup-code",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_orders": {
    "method": "GET",
    "path": "/api/v1/store/admin/orders",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_orders_by_orderId": {
    "method": "GET",
    "path": "/api/v1/store/admin/orders/{orderId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_orders_by_orderId_confirm": {
    "method": "POST",
    "path": "/api/v1/store/admin/orders/{orderId}/confirm",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_orders_by_orderId_reject": {
    "method": "POST",
    "path": "/api/v1/store/admin/orders/{orderId}/reject",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_orders_by_orderId_ready_for_pickup": {
    "method": "POST",
    "path": "/api/v1/store/admin/orders/{orderId}/ready-for-pickup",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_orders_by_orderId_complete": {
    "method": "POST",
    "path": "/api/v1/store/admin/orders/{orderId}/complete",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_orders_by_orderId_complete_with_override": {
    "method": "POST",
    "path": "/api/v1/store/admin/orders/{orderId}/complete-with-override",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_orders_by_orderId_cancel": {
    "method": "POST",
    "path": "/api/v1/store/admin/orders/{orderId}/cancel",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_orders_by_orderId_extend_pickup_deadline": {
    "method": "POST",
    "path": "/api/v1/store/admin/orders/{orderId}/extend-pickup-deadline",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_orders_by_orderId_regenerate_pickup_code": {
    "method": "POST",
    "path": "/api/v1/store/admin/orders/{orderId}/regenerate-pickup-code",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_orders_by_orderId_cash_corrections": {
    "method": "POST",
    "path": "/api/v1/store/admin/orders/{orderId}/cash-corrections",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_reports_by_report": {
    "method": "GET",
    "path": "/api/v1/store/admin/reports/{report}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_reports_exports": {
    "method": "POST",
    "path": "/api/v1/store/admin/reports/exports",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_reports_exports_by_id": {
    "method": "GET",
    "path": "/api/v1/store/admin/reports/exports/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_orders_my_by_orderId_returnable_items": {
    "method": "GET",
    "path": "/api/v1/store/orders/my/{orderId}/returnable-items",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_orders_my_by_orderId_returns": {
    "method": "POST",
    "path": "/api/v1/store/orders/my/{orderId}/returns",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_returns_my": {
    "method": "GET",
    "path": "/api/v1/store/returns/my",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_returns_my_by_returnId": {
    "method": "GET",
    "path": "/api/v1/store/returns/my/{returnId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_returns_my_by_returnId_cancel": {
    "method": "POST",
    "path": "/api/v1/store/returns/my/{returnId}/cancel",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_returns_my_by_returnId_evidence": {
    "method": "POST",
    "path": "/api/v1/store/returns/my/{returnId}/evidence",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_store_returns_my_by_returnId_evidence_by_assetId": {
    "method": "DELETE",
    "path": "/api/v1/store/returns/my/{returnId}/evidence/{assetId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_orders_by_orderId_returnable_items": {
    "method": "GET",
    "path": "/api/v1/store/admin/orders/{orderId}/returnable-items",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_orders_by_orderId_returns": {
    "method": "POST",
    "path": "/api/v1/store/admin/orders/{orderId}/returns",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_returns": {
    "method": "GET",
    "path": "/api/v1/store/admin/returns",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_store_admin_returns_by_returnId": {
    "method": "GET",
    "path": "/api/v1/store/admin/returns/{returnId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_returns_by_returnId_approve": {
    "method": "POST",
    "path": "/api/v1/store/admin/returns/{returnId}/approve",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_returns_by_returnId_reject": {
    "method": "POST",
    "path": "/api/v1/store/admin/returns/{returnId}/reject",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_returns_by_returnId_complete": {
    "method": "POST",
    "path": "/api/v1/store/admin/returns/{returnId}/complete",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_store_admin_returns_by_returnId_cancel": {
    "method": "POST",
    "path": "/api/v1/store/admin/returns/{returnId}/cancel",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_student_dashboard": {
    "method": "GET",
    "path": "/api/v1/student/dashboard",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_student_dashboard_priority_updates": {
    "method": "GET",
    "path": "/api/v1/student/dashboard/priority-updates",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_student_dashboard_upcoming": {
    "method": "GET",
    "path": "/api/v1/student/dashboard/upcoming",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_study_insights": {
    "method": "GET",
    "path": "/api/v1/me/study-insights",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_me_study_confidence_by_offeringId": {
    "method": "PUT",
    "path": "/api/v1/me/study-confidence/{offeringId}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_study_assessments": {
    "method": "POST",
    "path": "/api/v1/me/study-assessments",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "patch_api_v1_me_study_assessments_by_id": {
    "method": "PATCH",
    "path": "/api/v1/me/study-assessments/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_me_study_assessments_by_id": {
    "method": "DELETE",
    "path": "/api/v1/me/study-assessments/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_study_assessments_by_id_restore": {
    "method": "POST",
    "path": "/api/v1/me/study-assessments/{id}/restore",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_margin_notes": {
    "method": "GET",
    "path": "/api/v1/me/margin-notes",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_margin_notes": {
    "method": "POST",
    "path": "/api/v1/me/margin-notes",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "patch_api_v1_me_margin_notes_by_id": {
    "method": "PATCH",
    "path": "/api/v1/me/margin-notes/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_me_margin_notes_by_id": {
    "method": "DELETE",
    "path": "/api/v1/me/margin-notes/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_margin_notes_by_id_restore": {
    "method": "POST",
    "path": "/api/v1/me/margin-notes/{id}/restore",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_recall_cards": {
    "method": "GET",
    "path": "/api/v1/me/recall-cards",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_recall_cards": {
    "method": "POST",
    "path": "/api/v1/me/recall-cards",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "patch_api_v1_me_recall_cards_by_id": {
    "method": "PATCH",
    "path": "/api/v1/me/recall-cards/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_me_recall_cards_by_id": {
    "method": "DELETE",
    "path": "/api/v1/me/recall-cards/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_recall_cards_by_id_restore": {
    "method": "POST",
    "path": "/api/v1/me/recall-cards/{id}/restore",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_recall_cards_by_id_reviews": {
    "method": "POST",
    "path": "/api/v1/me/recall-cards/{id}/reviews",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_recall_reviews": {
    "method": "GET",
    "path": "/api/v1/me/recall-reviews",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_study_files": {
    "method": "GET",
    "path": "/api/v1/me/study-files",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_me_study_files_by_id": {
    "method": "DELETE",
    "path": "/api/v1/me/study-files/{id}",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_study_packs_by_offeringId": {
    "method": "GET",
    "path": "/api/v1/me/study-packs/{offeringId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_study_plans": {
    "method": "GET",
    "path": "/api/v1/study-plans",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_study_plans": {
    "method": "POST",
    "path": "/api/v1/study-plans",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_study_plans_generate_preview": {
    "method": "POST",
    "path": "/api/v1/study-plans/generate-preview",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_study_plans_by_id": {
    "method": "GET",
    "path": "/api/v1/study-plans/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_study_plans_by_id": {
    "method": "PUT",
    "path": "/api/v1/study-plans/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_study_plans_by_id": {
    "method": "DELETE",
    "path": "/api/v1/study-plans/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_study_plans_by_id_regenerate_remaining": {
    "method": "POST",
    "path": "/api/v1/study-plans/{id}/regenerate-remaining",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_study_plans_by_id_calendar_sync": {
    "method": "POST",
    "path": "/api/v1/study-plans/{id}/calendar-sync",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_study_plans_by_id_items": {
    "method": "POST",
    "path": "/api/v1/study-plans/{id}/items",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_study_plans_by_id_items_by_itemId": {
    "method": "PUT",
    "path": "/api/v1/study-plans/{id}/items/{itemId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_study_plans_by_id_items_by_itemId": {
    "method": "DELETE",
    "path": "/api/v1/study-plans/{id}/items/{itemId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_study_plans_by_id_items_by_itemId_complete": {
    "method": "POST",
    "path": "/api/v1/study-plans/{id}/items/{itemId}/complete",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_me_study_files_upload_sessions": {
    "method": "POST",
    "path": "/api/v1/me/study-files/upload-sessions",
    "auth": true,
    "idempotencyRequired": true,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_me_study_files_upload_sessions_by_sessionId": {
    "method": "GET",
    "path": "/api/v1/me/study-files/upload-sessions/{sessionId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_study_files_upload_sessions_by_sessionId_parts": {
    "method": "POST",
    "path": "/api/v1/me/study-files/upload-sessions/{sessionId}/parts",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_study_files_upload_sessions_by_sessionId_parts_by_partNumber_complete": {
    "method": "POST",
    "path": "/api/v1/me/study-files/upload-sessions/{sessionId}/parts/{partNumber}/complete",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_me_study_files_upload_sessions_by_sessionId_complete": {
    "method": "POST",
    "path": "/api/v1/me/study-files/upload-sessions/{sessionId}/complete",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_me_study_files_upload_sessions_by_sessionId_abort": {
    "method": "POST",
    "path": "/api/v1/me/study-files/upload-sessions/{sessionId}/abort",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_teams": {
    "method": "GET",
    "path": "/api/v1/admin/teams",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_teams": {
    "method": "POST",
    "path": "/api/v1/admin/teams",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_teams_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/teams/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_teams_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/teams/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_teams_by_id": {
    "method": "DELETE",
    "path": "/api/v1/admin/teams/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_teams_by_id_members": {
    "method": "GET",
    "path": "/api/v1/admin/teams/{id}/members",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_teams_by_id_members": {
    "method": "POST",
    "path": "/api/v1/admin/teams/{id}/members",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "delete_api_v1_admin_teams_by_id_members_by_userId": {
    "method": "DELETE",
    "path": "/api/v1/admin/teams/{id}/members/{userId}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "put_api_v1_admin_teams_by_id_available_permissions": {
    "method": "PUT",
    "path": "/api/v1/admin/teams/{id}/available-permissions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "put_api_v1_admin_teams_by_id_members_by_userId_permissions": {
    "method": "PUT",
    "path": "/api/v1/admin/teams/{id}/members/{userId}/permissions",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_symbolic_titles": {
    "method": "GET",
    "path": "/api/v1/admin/symbolic-titles",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_symbolic_titles": {
    "method": "POST",
    "path": "/api/v1/admin/symbolic-titles",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_symbolic_titles_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/symbolic-titles/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "delete_api_v1_admin_symbolic_titles_by_id": {
    "method": "DELETE",
    "path": "/api/v1/admin/symbolic-titles/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "put_api_v1_admin_users_by_id_symbolic_titles": {
    "method": "PUT",
    "path": "/api/v1/admin/users/{id}/symbolic-titles",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_search": {
    "method": "GET",
    "path": "/api/v1/search",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_search_suggestions": {
    "method": "GET",
    "path": "/api/v1/search/suggestions",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_search_resources_by_type_by_id_explain": {
    "method": "GET",
    "path": "/api/v1/search/resources/{type}/{id}/explain",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_search_interactions_click": {
    "method": "POST",
    "path": "/api/v1/search/interactions/click",
    "auth": false,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_utilities": {
    "method": "GET",
    "path": "/api/v1/utilities",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_utilities_pomodoro_settings": {
    "method": "GET",
    "path": "/api/v1/utilities/pomodoro/settings",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_utilities_pomodoro_settings": {
    "method": "PUT",
    "path": "/api/v1/utilities/pomodoro/settings",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_utilities_gpa_calculate": {
    "method": "POST",
    "path": "/api/v1/utilities/gpa/calculate",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_utilities_gpa_active_scale": {
    "method": "GET",
    "path": "/api/v1/utilities/gpa/active-scale",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_gpa_scales": {
    "method": "GET",
    "path": "/api/v1/admin/gpa-scales",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_gpa_scales": {
    "method": "POST",
    "path": "/api/v1/admin/gpa-scales",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "get_api_v1_admin_gpa_scales_by_id": {
    "method": "GET",
    "path": "/api/v1/admin/gpa-scales/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_gpa_scales_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/gpa-scales/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "post_api_v1_admin_gpa_scales_by_id_activate": {
    "method": "POST",
    "path": "/api/v1/admin/gpa-scales/{id}/activate",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "post_api_v1_admin_gpa_scales_by_id_archive": {
    "method": "POST",
    "path": "/api/v1/admin/gpa-scales/{id}/archive",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  },
  "get_api_v1_admin_utilities": {
    "method": "GET",
    "path": "/api/v1/admin/utilities",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_utilities_by_id": {
    "method": "PUT",
    "path": "/api/v1/admin/utilities/{id}",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "application/json",
    "deprecated": false
  },
  "put_api_v1_admin_utilities_reorder": {
    "method": "PUT",
    "path": "/api/v1/admin/utilities/reorder",
    "auth": true,
    "idempotencyRequired": false,
    "multipart": false,
    "accept": "*/*",
    "deprecated": false
  }
} as const;
export type OperationId = keyof typeof apiOperations;
