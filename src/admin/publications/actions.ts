import type { PublicationApi } from "../../services/api/publication-api";
import type { PublicationSection } from "../../services/api/publication-contracts";
import type { Schemas } from "../../services/api/schema.generated";
export type Document = Schemas["PublicContentDocument"];
export type Action = Schemas["PublicContentAction"];
export function publicationActions(
  api: PublicationApi,
  section: PublicationSection,
) {
  const media = section === "campaigns" || section === "albums";
  const path = media ? { mediaType: section } : { contentType: section };
  return {
    list: (Page: number, Search: string, signal?: AbortSignal) =>
      media
        ? api.get_api_v1_admin_media_by_mediaType({
            path: { mediaType: section },
            query: { Page, PageSize: 20, Search },
            signal,
          })
        : api.get_api_v1_admin_by_contentType({
            path: { contentType: section },
            query: { Page, PageSize: 20, Search },
            signal,
          }),
    get: (id: string, signal?: AbortSignal) =>
      media
        ? api.get_api_v1_admin_media_by_mediaType_by_id({
            path: { mediaType: section, id },
            signal,
          })
        : api.get_api_v1_admin_by_contentType_by_id({
            path: { contentType: section, id },
            signal,
          }),
    create: (document: Document, changeSummary: string) =>
      media
        ? api.post_api_v1_admin_media_by_mediaType({
            path: { mediaType: section },
            body: { document, changeSummary },
          })
        : api.post_api_v1_admin_by_contentType({
            path: { contentType: section },
            body: { document, changeSummary },
          }),
    save: (
      id: string,
      version: string,
      document: Document,
      changeSummary: string,
    ) =>
      media
        ? api.put_api_v1_admin_media_by_mediaType_by_id({
            path: { mediaType: section, id },
            body: { version, document, changeSummary },
          })
        : api.put_api_v1_admin_by_contentType_by_id({
            path: { contentType: section, id },
            body: { version, document, changeSummary },
          }),
    publish: (id: string, body: Action) =>
      media
        ? api.post_api_v1_admin_media_by_mediaType_by_id_publish({
            path: { mediaType: section, id },
            body,
          })
        : api.post_api_v1_admin_by_contentType_by_id_publish({
            path: { contentType: section, id },
            body,
          }),
    archive: (id: string, body: Action) =>
      media
        ? api.post_api_v1_admin_media_by_mediaType_by_id_archive({
            path: { mediaType: section, id },
            body,
          })
        : api.post_api_v1_admin_by_contentType_by_id_archive({
            path: { contentType: section, id },
            body,
          }),
    schedule: (id: string, body: Action, compatibility = false) =>
      media
        ? compatibility
          ? api.post_api_v1_admin_media_by_mediaType_by_id_schedule({
              path: { mediaType: section, id },
              body,
            })
          : api.post_api_v1_admin_media_by_mediaType_by_id_schedule_publication(
              { path: { mediaType: section, id }, body },
            )
        : compatibility
          ? api.post_api_v1_admin_by_contentType_by_id_schedule({
              path: {
                contentType: section as Exclude<typeof section, "conferences">,
                id,
              },
              body,
            })
          : api.post_api_v1_admin_by_contentType_by_id_schedule_publication({
              path: { contentType: section, id },
              body,
            }),
    versions: (id: string, Page: number, signal?: AbortSignal) =>
      media
        ? api.get_api_v1_admin_media_by_mediaType_by_id_versions({
            path: { mediaType: section, id },
            query: { Page, PageSize: 20 },
            signal,
          })
        : api.get_api_v1_admin_by_contentType_by_id_versions({
            path: { contentType: section, id },
            query: { Page, PageSize: 20 },
            signal,
          }),
    restore: (id: string, versionId: string, body: Action) =>
      media
        ? api.post_api_v1_admin_media_by_mediaType_by_id_versions_by_versionId_restore(
            { path: { mediaType: section, id, versionId }, body },
          )
        : api.post_api_v1_admin_by_contentType_by_id_versions_by_versionId_restore(
            { path: { contentType: section, id, versionId }, body },
          ),
    preview: (id: string, versionId?: string, signal?: AbortSignal) =>
      media
        ? api.get_api_v1_admin_media_by_mediaType_by_id_preview({
            path: { mediaType: section, id },
            query: { versionId },
            signal,
          })
        : api.get_api_v1_admin_by_contentType_by_id_preview({
            path: { contentType: section, id },
            query: { versionId },
            signal,
          }),
    schedules: (id: string, Page: number, signal?: AbortSignal) =>
      media
        ? api.get_api_v1_admin_media_by_mediaType_by_id_schedules({
            path: { mediaType: section, id },
            query: { Page, PageSize: 20 },
            signal,
          })
        : api.get_api_v1_admin_by_contentType_by_id_schedules({
            path: { contentType: section, id },
            query: { Page, PageSize: 20 },
            signal,
          }),
    retry: (id: string, scheduleId: string, body: Action) =>
      media
        ? api.post_api_v1_admin_media_by_mediaType_by_id_schedules_by_scheduleId_retry(
            { path: { mediaType: section, id, scheduleId }, body },
          )
        : api.post_api_v1_admin_by_contentType_by_id_schedules_by_scheduleId_retry(
            { path: { contentType: section, id, scheduleId }, body },
          ),
    cancel: (id: string, scheduleId: string, body: Action) =>
      media
        ? api.post_api_v1_admin_media_by_mediaType_by_id_schedules_by_scheduleId_cancel(
            { path: { mediaType: section, id, scheduleId }, body },
          )
        : api.post_api_v1_admin_by_contentType_by_id_schedules_by_scheduleId_cancel(
            { path: { contentType: section, id, scheduleId }, body },
          ),
  };
}
