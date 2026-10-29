import type { PublicationApi } from "../../services/api/publication-api";
import type { PublicationSection } from "../../services/api/publication-contracts";
import type { Schemas } from "../../services/api/schema.generated";
export type ChildKind =
  | "assets"
  | "links"
  | "speakers"
  | "scheduleItems"
  | "sponsors"
  | "members"
  | "items";
export const childSchemas: Record<ChildKind, string> = {
  assets: "PublicAssetInput",
  links: "PublicLinkInput",
  speakers: "ConferenceSpeakerInput",
  scheduleItems: "ConferenceScheduleItemInput",
  sponsors: "ConferenceSponsorInput",
  members: "ExecutiveMemberInput",
  items: "MediaAlbumItemInput",
};
export function childActions(
  api: PublicationApi,
  section: PublicationSection,
  id: string,
  kind: ChildKind,
) {
  const media = section === "campaigns" || section === "albums";
  return {
    save: (
      version: string,
      item: Record<string, unknown>,
      changeSummary: string,
      childId?: string,
    ) => {
      if (kind === "assets") {
        const body = {
          version,
          item: item as Schemas["PublicAssetInput"],
          changeSummary,
        };
        return media
          ? childId
            ? api.put_api_v1_admin_media_by_mediaType_by_id_assets_by_linkId({
                path: { mediaType: section, id, linkId: childId },
                body,
              })
            : api.post_api_v1_admin_media_by_mediaType_by_id_assets({
                path: { mediaType: section, id },
                body,
              })
          : childId
            ? api.put_api_v1_admin_by_contentType_by_id_assets_by_linkId({
                path: { contentType: section, id, linkId: childId },
                body,
              })
            : api.post_api_v1_admin_by_contentType_by_id_assets({
                path: { contentType: section, id },
                body,
              });
      }
      if (kind === "links") {
        const body = {
          version,
          item: item as Schemas["PublicLinkInput"],
          changeSummary,
        };
        return media
          ? childId
            ? api.put_api_v1_admin_media_by_mediaType_by_id_links_by_linkId({
                path: { mediaType: section, id, linkId: childId },
                body,
              })
            : api.post_api_v1_admin_media_by_mediaType_by_id_links({
                path: { mediaType: section, id },
                body,
              })
          : childId
            ? api.put_api_v1_admin_by_contentType_by_id_links_by_linkId({
                path: { contentType: section, id, linkId: childId },
                body,
              })
            : api.post_api_v1_admin_by_contentType_by_id_links({
                path: { contentType: section, id },
                body,
              });
      }
      if (kind === "speakers") {
        const body = {
          version,
          item: item as Schemas["ConferenceSpeakerInput"],
          changeSummary,
        };
        return childId
          ? api.put_api_v1_admin_conferences_by_id_speakers_by_speakerId({
              path: { id, speakerId: childId },
              body,
            })
          : api.post_api_v1_admin_conferences_by_id_speakers({
              path: { id },
              body,
            });
      }
      if (kind === "scheduleItems") {
        const body = {
          version,
          item: item as Schemas["ConferenceScheduleItemInput"],
          changeSummary,
        };
        return childId
          ? api.put_api_v1_admin_conferences_by_id_schedule_by_itemId({
              path: { id, itemId: childId },
              body,
            })
          : api.post_api_v1_admin_conferences_by_id_schedule({
              path: { id },
              body,
            });
      }
      if (kind === "sponsors") {
        const body = {
          version,
          item: item as Schemas["ConferenceSponsorInput"],
          changeSummary,
        };
        return childId
          ? api.put_api_v1_admin_conferences_by_id_sponsors_by_sponsorId({
              path: { id, sponsorId: childId },
              body,
            })
          : api.post_api_v1_admin_conferences_by_id_sponsors({
              path: { id },
              body,
            });
      }
      if (kind === "members") {
        const body = {
          version,
          item: item as Schemas["ExecutiveMemberInput"],
          changeSummary,
        };
        return childId
          ? api.put_api_v1_admin_executive_bodies_by_id_members_by_memberId({
              path: { id, memberId: childId },
              body,
            })
          : api.post_api_v1_admin_executive_bodies_by_id_members({
              path: { id },
              body,
            });
      }
      const body = {
        version,
        item: item as Schemas["MediaAlbumItemInput"],
        changeSummary,
      };
      return childId
        ? api.put_api_v1_admin_media_albums_by_id_items_by_itemId({
            path: { id, itemId: childId },
            body,
          })
        : api.post_api_v1_admin_media_albums_by_id_items({
            path: { id },
            body,
          });
    },
    remove: (version: string, childId: string) => {
      if (kind === "assets")
        return media
          ? api.delete_api_v1_admin_media_by_mediaType_by_id_assets_by_linkId({
              path: { mediaType: section, id, linkId: childId },
              query: { version },
            })
          : api.delete_api_v1_admin_by_contentType_by_id_assets_by_linkId({
              path: { contentType: section, id, linkId: childId },
              query: { version },
            });
      if (kind === "links")
        return media
          ? api.delete_api_v1_admin_media_by_mediaType_by_id_links_by_linkId({
              path: { mediaType: section, id, linkId: childId },
              query: { version },
            })
          : api.delete_api_v1_admin_by_contentType_by_id_links_by_linkId({
              path: { contentType: section, id, linkId: childId },
              query: { version },
            });
      if (kind === "speakers")
        return api.delete_api_v1_admin_conferences_by_id_speakers_by_speakerId({
          path: { id, speakerId: childId },
          query: { version },
        });
      if (kind === "scheduleItems")
        return api.delete_api_v1_admin_conferences_by_id_schedule_by_itemId({
          path: { id, itemId: childId },
          query: { version },
        });
      if (kind === "sponsors")
        return api.delete_api_v1_admin_conferences_by_id_sponsors_by_sponsorId({
          path: { id, sponsorId: childId },
          query: { version },
        });
      if (kind === "members")
        return api.delete_api_v1_admin_executive_bodies_by_id_members_by_memberId(
          { path: { id, memberId: childId }, query: { version } },
        );
      return api.delete_api_v1_admin_media_albums_by_id_items_by_itemId({
        path: { id, itemId: childId },
        query: { version },
      });
    },
  };
}
