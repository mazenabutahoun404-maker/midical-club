// Generated from the pinned P07 input schemas.
export const publicationRoutes = {
  get_api_v1_admin_about: {
    method: "GET",
    path: "/api/v1/admin/about",
    body: null,
    idempotent: false,
    summary: "Get club information draft",
  },
  put_api_v1_admin_about: {
    method: "PUT",
    path: "/api/v1/admin/about",
    body: {
      $ref: "#/components/schemas/AboutWriteInput",
    },
    idempotent: true,
    summary: "Update club information page",
  },
  post_api_v1_admin_about_publish: {
    method: "POST",
    path: "/api/v1/admin/about/publish",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Publish club information page",
  },
  post_api_v1_admin_about_schedule: {
    method: "POST",
    path: "/api/v1/admin/about/schedule",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Schedule publication of club information",
  },
  post_api_v1_admin_about_archive: {
    method: "POST",
    path: "/api/v1/admin/about/archive",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Archive club information page",
  },
  get_api_v1_admin_about_versions: {
    method: "GET",
    path: "/api/v1/admin/about/versions",
    body: null,
    idempotent: false,
    summary: "List versions for club information page",
  },
  post_api_v1_admin_about_versions_by_versionId_restore: {
    method: "POST",
    path: "/api/v1/admin/about/versions/{versionId}/restore",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Restore version for club information page",
  },
  get_api_v1_admin_about_schedules: {
    method: "GET",
    path: "/api/v1/admin/about/schedules",
    body: null,
    idempotent: false,
    summary: "List schedules for club information page",
  },
  post_api_v1_admin_about_schedules_by_scheduleId_cancel: {
    method: "POST",
    path: "/api/v1/admin/about/schedules/{scheduleId}/cancel",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Cancel schedule for club information page",
  },
  post_api_v1_admin_about_schedules_by_scheduleId_retry: {
    method: "POST",
    path: "/api/v1/admin/about/schedules/{scheduleId}/retry",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Retry schedule for club information page",
  },
  get_api_v1_admin_about_preview: {
    method: "GET",
    path: "/api/v1/admin/about/preview",
    body: null,
    idempotent: false,
    summary: "Preview club information page",
  },
  get_api_v1_about: {
    method: "GET",
    path: "/api/v1/about",
    body: null,
    idempotent: false,
    summary: "Get published club information",
  },
  post_api_v1_admin_conferences_by_id_speakers: {
    method: "POST",
    path: "/api/v1/admin/conferences/{id}/speakers",
    body: {
      $ref: "#/components/schemas/ConferenceSpeakerInputPublicChildInput",
    },
    idempotent: true,
    summary: "Create speaker for conference",
  },
  put_api_v1_admin_conferences_by_id_speakers_by_speakerId: {
    method: "PUT",
    path: "/api/v1/admin/conferences/{id}/speakers/{speakerId}",
    body: {
      $ref: "#/components/schemas/ConferenceSpeakerInputPublicChildInput",
    },
    idempotent: true,
    summary: "Update speaker for conference",
  },
  delete_api_v1_admin_conferences_by_id_speakers_by_speakerId: {
    method: "DELETE",
    path: "/api/v1/admin/conferences/{id}/speakers/{speakerId}",
    body: null,
    idempotent: true,
    summary: "Delete speaker for conference",
  },
  post_api_v1_admin_conferences_by_id_schedule: {
    method: "POST",
    path: "/api/v1/admin/conferences/{id}/schedule",
    body: {
      $ref: "#/components/schemas/ConferenceScheduleItemInputPublicChildInput",
    },
    idempotent: true,
    summary: "Create programme entry for conference",
  },
  put_api_v1_admin_conferences_by_id_schedule_by_itemId: {
    method: "PUT",
    path: "/api/v1/admin/conferences/{id}/schedule/{itemId}",
    body: {
      $ref: "#/components/schemas/ConferenceScheduleItemInputPublicChildInput",
    },
    idempotent: true,
    summary: "Update programme entry for conference",
  },
  delete_api_v1_admin_conferences_by_id_schedule_by_itemId: {
    method: "DELETE",
    path: "/api/v1/admin/conferences/{id}/schedule/{itemId}",
    body: null,
    idempotent: true,
    summary: "Delete programme entry for conference",
  },
  post_api_v1_admin_conferences_by_id_sponsors: {
    method: "POST",
    path: "/api/v1/admin/conferences/{id}/sponsors",
    body: {
      $ref: "#/components/schemas/ConferenceSponsorInputPublicChildInput",
    },
    idempotent: true,
    summary: "Create sponsor for conference",
  },
  put_api_v1_admin_conferences_by_id_sponsors_by_sponsorId: {
    method: "PUT",
    path: "/api/v1/admin/conferences/{id}/sponsors/{sponsorId}",
    body: {
      $ref: "#/components/schemas/ConferenceSponsorInputPublicChildInput",
    },
    idempotent: true,
    summary: "Update sponsor for conference",
  },
  delete_api_v1_admin_conferences_by_id_sponsors_by_sponsorId: {
    method: "DELETE",
    path: "/api/v1/admin/conferences/{id}/sponsors/{sponsorId}",
    body: null,
    idempotent: true,
    summary: "Delete sponsor for conference",
  },
  get_api_v1_conferences_by_slug_by_collection: {
    method: "GET",
    path: "/api/v1/conferences/{slug}/{collection}",
    body: null,
    idempotent: false,
    summary: "List conference speakers or programme entries",
  },
  post_api_v1_admin_executive_bodies_by_id_set_current: {
    method: "POST",
    path: "/api/v1/admin/executive-bodies/{id}/set-current",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Set the current executive body",
  },
  post_api_v1_admin_executive_bodies_by_id_members: {
    method: "POST",
    path: "/api/v1/admin/executive-bodies/{id}/members",
    body: {
      $ref: "#/components/schemas/ExecutiveMemberInputPublicChildInput",
    },
    idempotent: true,
    summary: "Create member for executive body",
  },
  put_api_v1_admin_executive_bodies_by_id_members_by_memberId: {
    method: "PUT",
    path: "/api/v1/admin/executive-bodies/{id}/members/{memberId}",
    body: {
      $ref: "#/components/schemas/ExecutiveMemberInputPublicChildInput",
    },
    idempotent: true,
    summary: "Update member for executive body",
  },
  delete_api_v1_admin_executive_bodies_by_id_members_by_memberId: {
    method: "DELETE",
    path: "/api/v1/admin/executive-bodies/{id}/members/{memberId}",
    body: null,
    idempotent: true,
    summary: "Delete member for executive body",
  },
  get_api_v1_executive_bodies_current: {
    method: "GET",
    path: "/api/v1/executive-bodies/current",
    body: null,
    idempotent: false,
    summary: "Get the current executive body",
  },
  get_api_v1_medclub_team_featured: {
    method: "GET",
    path: "/api/v1/medclub-team/featured",
    body: null,
    idempotent: false,
    summary: "List featured club publications",
  },
  get_api_v1_medclub_team_overview: {
    method: "GET",
    path: "/api/v1/medclub-team/overview",
    body: null,
    idempotent: false,
    summary: "Get overview for club team",
  },
  get_api_v1_medclub_team_search: {
    method: "GET",
    path: "/api/v1/medclub-team/search",
    body: null,
    idempotent: false,
    summary: "Search public club content",
  },
  post_api_v1_admin_media_albums_by_id_items: {
    method: "POST",
    path: "/api/v1/admin/media/albums/{id}/items",
    body: {
      $ref: "#/components/schemas/MediaAlbumItemInputPublicChildInput",
    },
    idempotent: true,
    summary: "Create item for media album",
  },
  put_api_v1_admin_media_albums_by_id_items_by_itemId: {
    method: "PUT",
    path: "/api/v1/admin/media/albums/{id}/items/{itemId}",
    body: {
      $ref: "#/components/schemas/MediaAlbumItemInputPublicChildInput",
    },
    idempotent: true,
    summary: "Update item for media album",
  },
  delete_api_v1_admin_media_albums_by_id_items_by_itemId: {
    method: "DELETE",
    path: "/api/v1/admin/media/albums/{id}/items/{itemId}",
    body: null,
    idempotent: true,
    summary: "Delete item for media album",
  },
  get_api_v1_admin_media_campaigns_by_id_albums: {
    method: "GET",
    path: "/api/v1/admin/media/campaigns/{id}/albums",
    body: null,
    idempotent: false,
    summary: "List albums for media campaign",
  },
  post_api_v1_admin_media_campaigns_by_id_albums: {
    method: "POST",
    path: "/api/v1/admin/media/campaigns/{id}/albums",
    body: {
      $ref: "#/components/schemas/PublicContentWriteInput",
    },
    idempotent: true,
    summary: "Create album for media campaign",
  },
  get_api_v1_media_campaigns_by_campaignSlug_albums: {
    method: "GET",
    path: "/api/v1/media/campaigns/{campaignSlug}/albums",
    body: null,
    idempotent: false,
    summary: "List albums for media campaign",
  },
  get_api_v1_media_campaigns_by_campaignSlug_albums_by_albumSlug: {
    method: "GET",
    path: "/api/v1/media/campaigns/{campaignSlug}/albums/{albumSlug}",
    body: null,
    idempotent: false,
    summary: "Get album for media campaign",
  },
  get_api_v1_admin_by_contentType_categories: {
    method: "GET",
    path: "/api/v1/admin/{contentType}/categories",
    body: null,
    idempotent: false,
    summary: "List categories for club publication",
  },
  post_api_v1_admin_by_contentType_categories: {
    method: "POST",
    path: "/api/v1/admin/{contentType}/categories",
    body: {
      $ref: "#/components/schemas/PublicCategoryInput",
    },
    idempotent: true,
    summary: "Create category for club publication",
  },
  put_api_v1_admin_by_contentType_categories_by_id: {
    method: "PUT",
    path: "/api/v1/admin/{contentType}/categories/{id}",
    body: {
      $ref: "#/components/schemas/PublicCategoryInput",
    },
    idempotent: true,
    summary: "Update category for club publication",
  },
  post_api_v1_admin_by_contentType_categories_by_id_archive: {
    method: "POST",
    path: "/api/v1/admin/{contentType}/categories/{id}/archive",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Archive category for club publication",
  },
  get_api_v1_by_contentType_categories: {
    method: "GET",
    path: "/api/v1/{contentType}/categories",
    body: null,
    idempotent: false,
    summary: "List categories for club publication",
  },
  post_api_v1_admin_medclub_team_jobs_by_id_retry: {
    method: "POST",
    path: "/api/v1/admin/medclub-team/jobs/{id}/retry",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Retry job for club team",
  },
  get_api_v1_admin_medclub_team_monitoring: {
    method: "GET",
    path: "/api/v1/admin/medclub-team/monitoring",
    body: null,
    idempotent: false,
    summary: "Get monitoring for club team",
  },
  get_api_v1_admin_by_contentType: {
    method: "GET",
    path: "/api/v1/admin/{contentType}",
    body: null,
    idempotent: false,
    summary: "List managed club publications",
  },
  post_api_v1_admin_by_contentType: {
    method: "POST",
    path: "/api/v1/admin/{contentType}",
    body: {
      $ref: "#/components/schemas/PublicContentWriteInput",
    },
    idempotent: true,
    summary: "Create club publication",
  },
  get_api_v1_admin_media_by_mediaType: {
    method: "GET",
    path: "/api/v1/admin/media/{mediaType}",
    body: null,
    idempotent: false,
    summary: "List managed media publications",
  },
  post_api_v1_admin_media_by_mediaType: {
    method: "POST",
    path: "/api/v1/admin/media/{mediaType}",
    body: {
      $ref: "#/components/schemas/PublicContentWriteInput",
    },
    idempotent: true,
    summary: "Create media publication",
  },
  get_api_v1_admin_by_contentType_by_id: {
    method: "GET",
    path: "/api/v1/admin/{contentType}/{id}",
    body: null,
    idempotent: false,
    summary: "Get club publication",
  },
  put_api_v1_admin_by_contentType_by_id: {
    method: "PUT",
    path: "/api/v1/admin/{contentType}/{id}",
    body: {
      $ref: "#/components/schemas/PublicContentWriteInput",
    },
    idempotent: true,
    summary: "Update club publication",
  },
  get_api_v1_admin_media_by_mediaType_by_id: {
    method: "GET",
    path: "/api/v1/admin/media/{mediaType}/{id}",
    body: null,
    idempotent: false,
    summary: "Get media publication",
  },
  put_api_v1_admin_media_by_mediaType_by_id: {
    method: "PUT",
    path: "/api/v1/admin/media/{mediaType}/{id}",
    body: {
      $ref: "#/components/schemas/PublicContentWriteInput",
    },
    idempotent: true,
    summary: "Update media publication",
  },
  post_api_v1_admin_by_contentType_by_id_publish: {
    method: "POST",
    path: "/api/v1/admin/{contentType}/{id}/publish",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Publish club publication",
  },
  post_api_v1_admin_media_by_mediaType_by_id_publish: {
    method: "POST",
    path: "/api/v1/admin/media/{mediaType}/{id}/publish",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Publish media publication",
  },
  post_api_v1_admin_by_contentType_by_id_schedule_publication: {
    method: "POST",
    path: "/api/v1/admin/{contentType}/{id}/schedule-publication",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Schedule publication of club publication",
  },
  post_api_v1_admin_media_by_mediaType_by_id_schedule_publication: {
    method: "POST",
    path: "/api/v1/admin/media/{mediaType}/{id}/schedule-publication",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Schedule publication of media publication",
  },
  post_api_v1_admin_by_contentType_by_id_archive: {
    method: "POST",
    path: "/api/v1/admin/{contentType}/{id}/archive",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Archive club publication",
  },
  post_api_v1_admin_media_by_mediaType_by_id_archive: {
    method: "POST",
    path: "/api/v1/admin/media/{mediaType}/{id}/archive",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Archive media publication",
  },
  get_api_v1_admin_by_contentType_by_id_versions: {
    method: "GET",
    path: "/api/v1/admin/{contentType}/{id}/versions",
    body: null,
    idempotent: false,
    summary: "List versions for club publication",
  },
  get_api_v1_admin_media_by_mediaType_by_id_versions: {
    method: "GET",
    path: "/api/v1/admin/media/{mediaType}/{id}/versions",
    body: null,
    idempotent: false,
    summary: "List versions for media publication",
  },
  post_api_v1_admin_by_contentType_by_id_versions_by_versionId_restore: {
    method: "POST",
    path: "/api/v1/admin/{contentType}/{id}/versions/{versionId}/restore",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Restore version for club publication",
  },
  post_api_v1_admin_media_by_mediaType_by_id_versions_by_versionId_restore: {
    method: "POST",
    path: "/api/v1/admin/media/{mediaType}/{id}/versions/{versionId}/restore",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Restore version for media publication",
  },
  get_api_v1_admin_by_contentType_by_id_preview: {
    method: "GET",
    path: "/api/v1/admin/{contentType}/{id}/preview",
    body: null,
    idempotent: false,
    summary: "Preview club publication",
  },
  get_api_v1_admin_media_by_mediaType_by_id_preview: {
    method: "GET",
    path: "/api/v1/admin/media/{mediaType}/{id}/preview",
    body: null,
    idempotent: false,
    summary: "Preview media publication",
  },
  get_api_v1_admin_by_contentType_by_id_schedules: {
    method: "GET",
    path: "/api/v1/admin/{contentType}/{id}/schedules",
    body: null,
    idempotent: false,
    summary: "List schedules for club publication",
  },
  get_api_v1_admin_media_by_mediaType_by_id_schedules: {
    method: "GET",
    path: "/api/v1/admin/media/{mediaType}/{id}/schedules",
    body: null,
    idempotent: false,
    summary: "List schedules for media publication",
  },
  post_api_v1_admin_by_contentType_by_id_schedules_by_scheduleId_retry: {
    method: "POST",
    path: "/api/v1/admin/{contentType}/{id}/schedules/{scheduleId}/retry",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Retry schedule for club publication",
  },
  post_api_v1_admin_media_by_mediaType_by_id_schedules_by_scheduleId_retry: {
    method: "POST",
    path: "/api/v1/admin/media/{mediaType}/{id}/schedules/{scheduleId}/retry",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Retry schedule for media publication",
  },
  post_api_v1_admin_by_contentType_by_id_schedules_by_scheduleId_cancel: {
    method: "POST",
    path: "/api/v1/admin/{contentType}/{id}/schedules/{scheduleId}/cancel",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Cancel schedule for club publication",
  },
  post_api_v1_admin_media_by_mediaType_by_id_schedules_by_scheduleId_cancel: {
    method: "POST",
    path: "/api/v1/admin/media/{mediaType}/{id}/schedules/{scheduleId}/cancel",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Cancel schedule for media publication",
  },
  post_api_v1_admin_by_contentType_by_id_assets: {
    method: "POST",
    path: "/api/v1/admin/{contentType}/{id}/assets",
    body: {
      $ref: "#/components/schemas/PublicAssetInputPublicChildInput",
    },
    idempotent: true,
    summary: "Attach a file for club publication",
  },
  post_api_v1_admin_media_by_mediaType_by_id_assets: {
    method: "POST",
    path: "/api/v1/admin/media/{mediaType}/{id}/assets",
    body: {
      $ref: "#/components/schemas/PublicAssetInputPublicChildInput",
    },
    idempotent: true,
    summary: "Attach a file for media publication",
  },
  put_api_v1_admin_by_contentType_by_id_assets_by_linkId: {
    method: "PUT",
    path: "/api/v1/admin/{contentType}/{id}/assets/{linkId}",
    body: {
      $ref: "#/components/schemas/PublicAssetInputPublicChildInput",
    },
    idempotent: true,
    summary: "Update a file link for club publication",
  },
  delete_api_v1_admin_by_contentType_by_id_assets_by_linkId: {
    method: "DELETE",
    path: "/api/v1/admin/{contentType}/{id}/assets/{linkId}",
    body: null,
    idempotent: true,
    summary: "Detach a file for club publication",
  },
  put_api_v1_admin_media_by_mediaType_by_id_assets_by_linkId: {
    method: "PUT",
    path: "/api/v1/admin/media/{mediaType}/{id}/assets/{linkId}",
    body: {
      $ref: "#/components/schemas/PublicAssetInputPublicChildInput",
    },
    idempotent: true,
    summary: "Update a file link for media publication",
  },
  delete_api_v1_admin_media_by_mediaType_by_id_assets_by_linkId: {
    method: "DELETE",
    path: "/api/v1/admin/media/{mediaType}/{id}/assets/{linkId}",
    body: null,
    idempotent: true,
    summary: "Detach a file for media publication",
  },
  post_api_v1_admin_by_contentType_by_id_links: {
    method: "POST",
    path: "/api/v1/admin/{contentType}/{id}/links",
    body: {
      $ref: "#/components/schemas/PublicLinkInputPublicChildInput",
    },
    idempotent: true,
    summary: "Create link for club publication",
  },
  post_api_v1_admin_media_by_mediaType_by_id_links: {
    method: "POST",
    path: "/api/v1/admin/media/{mediaType}/{id}/links",
    body: {
      $ref: "#/components/schemas/PublicLinkInputPublicChildInput",
    },
    idempotent: true,
    summary: "Create link for media publication",
  },
  put_api_v1_admin_by_contentType_by_id_links_by_linkId: {
    method: "PUT",
    path: "/api/v1/admin/{contentType}/{id}/links/{linkId}",
    body: {
      $ref: "#/components/schemas/PublicLinkInputPublicChildInput",
    },
    idempotent: true,
    summary: "Update link for club publication",
  },
  delete_api_v1_admin_by_contentType_by_id_links_by_linkId: {
    method: "DELETE",
    path: "/api/v1/admin/{contentType}/{id}/links/{linkId}",
    body: null,
    idempotent: true,
    summary: "Delete link for club publication",
  },
  put_api_v1_admin_media_by_mediaType_by_id_links_by_linkId: {
    method: "PUT",
    path: "/api/v1/admin/media/{mediaType}/{id}/links/{linkId}",
    body: {
      $ref: "#/components/schemas/PublicLinkInputPublicChildInput",
    },
    idempotent: true,
    summary: "Update link for media publication",
  },
  delete_api_v1_admin_media_by_mediaType_by_id_links_by_linkId: {
    method: "DELETE",
    path: "/api/v1/admin/media/{mediaType}/{id}/links/{linkId}",
    body: null,
    idempotent: true,
    summary: "Delete link for media publication",
  },
  get_api_v1_by_contentType: {
    method: "GET",
    path: "/api/v1/{contentType}",
    body: null,
    idempotent: false,
    summary: "List published club content",
  },
  get_api_v1_media_by_mediaType: {
    method: "GET",
    path: "/api/v1/media/{mediaType}",
    body: null,
    idempotent: false,
    summary: "List published media content",
  },
  get_api_v1_by_contentType_by_slug: {
    method: "GET",
    path: "/api/v1/{contentType}/{slug}",
    body: null,
    idempotent: false,
    summary: "Get a published club item",
  },
  get_api_v1_media_by_mediaType_by_slug: {
    method: "GET",
    path: "/api/v1/media/{mediaType}/{slug}",
    body: null,
    idempotent: false,
    summary: "Get a published media item",
  },
  post_api_v1_admin_by_contentType_by_id_schedule: {
    method: "POST",
    path: "/api/v1/admin/{contentType}/{id}/schedule",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Schedule publication using the compatibility route",
  },
  post_api_v1_admin_media_by_mediaType_by_id_schedule: {
    method: "POST",
    path: "/api/v1/admin/media/{mediaType}/{id}/schedule",
    body: {
      $ref: "#/components/schemas/PublicContentAction",
    },
    idempotent: true,
    summary: "Schedule publication using the compatibility route",
  },
} as const;
export const publicationInputSchemas: Record<string, unknown> = {
  AboutWriteInput: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
      },
      document: {
        $ref: "#/components/schemas/ContentDocument",
      },
      changeSummary: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  ContentDocument: {
    type: "object",
    properties: {
      editorial: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/EditorialMetadata",
          },
        ],
        nullable: true,
      },
      schemaVersion: {
        type: "integer",
        format: "int32",
      },
      title: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
      description: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
      visibility: {
        type: "array",
        items: {
          $ref: "#/components/schemas/VisibilitySpec",
        },
      },
      sections: {
        type: "array",
        items: {
          $ref: "#/components/schemas/SectionDocument",
        },
      },
      examination: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/ExaminationDocument",
          },
        ],
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  EditorialMetadata: {
    type: "object",
    properties: {
      kind: {
        type: "string",
      },
      categoryId: {
        type: "string",
        nullable: true,
      },
      author: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
      reviewer: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
      tags: {
        type: "array",
        items: {
          $ref: "#/components/schemas/LocalizedText",
        },
        nullable: true,
      },
      readMinutes: {
        type: "integer",
        format: "int32",
        nullable: true,
      },
      studyYear: {
        type: "integer",
        format: "int32",
        nullable: true,
      },
      tagline: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
      currentBlock: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
      focusAreas: {
        type: "array",
        items: {
          $ref: "#/components/schemas/LocalizedText",
        },
        nullable: true,
      },
      featured: {
        type: "boolean",
      },
      references: {
        type: "array",
        items: {
          type: "string",
        },
        nullable: true,
      },
      rightsConfirmed: {
        type: "boolean",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  LocalizedText: {
    type: "object",
    properties: {
      ar: {
        type: "string",
        nullable: true,
      },
      en: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  VisibilitySpec: {
    type: "object",
    properties: {
      audience: {
        $ref: "#/components/schemas/ContentAudience",
      },
      batchIds: {
        type: "array",
        items: {
          type: "string",
          format: "uuid",
        },
        nullable: true,
      },
      studyYears: {
        type: "array",
        items: {
          type: "integer",
          format: "int32",
        },
        nullable: true,
      },
      visibleFrom: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      visibleUntil: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  ContentAudience: {
    enum: [
      "Guest",
      "Authenticated",
      "SpecificBatches",
      "SpecificStudyYears",
      "AllStudents",
      "AdministrativeUsers",
    ],
    type: "string",
  },
  SectionDocument: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      sectionKey: {
        type: "string",
      },
      sectionType: {
        type: "string",
      },
      title: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
      position: {
        type: "integer",
        format: "int32",
      },
      isPinned: {
        type: "boolean",
      },
      pinnedFrom: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      pinnedUntil: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      status: {
        type: "string",
      },
      visibility: {
        type: "array",
        items: {
          $ref: "#/components/schemas/VisibilitySpec",
        },
      },
      blocks: {
        type: "array",
        items: {
          $ref: "#/components/schemas/BlockDocument",
        },
      },
    },
    additionalProperties: false,
  },
  BlockDocument: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      blockType: {
        $ref: "#/components/schemas/ContentBlockType",
      },
      position: {
        type: "integer",
        format: "int32",
      },
      configuration: {
        type: "object",
        description:
          "Domain JSON serialized as its JSON value. Content/block validation is applied by the owning domain.",
      },
      visibility: {
        type: "array",
        items: {
          $ref: "#/components/schemas/VisibilitySpec",
        },
      },
    },
    additionalProperties: false,
  },
  ContentBlockType: {
    enum: [
      "Text",
      "Heading",
      "Button",
      "ExternalLink",
      "Image",
      "Video",
      "File",
      "Divider",
      "Spacer",
      "Group",
      "TrustedEmbed",
      "ReusableReference",
    ],
    type: "string",
  },
  ExaminationDocument: {
    type: "object",
    properties: {
      mainUrl: {
        type: "string",
        nullable: true,
      },
      openInNewTab: {
        type: "boolean",
      },
      linkStatus: {
        type: "string",
      },
      unavailableMessage: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/LocalizedText",
          },
        ],
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  PublicContentAction: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
      },
      versionId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      reason: {
        type: "string",
      },
      publishAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      archiveAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      replacesScheduleId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      previousCurrentId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      previousCurrentVersion: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      previousTermEndDate: {
        type: "string",
        format: "date",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  ConferenceSpeakerInputPublicChildInput: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
      },
      item: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/ConferenceSpeakerInput",
          },
        ],
        nullable: true,
      },
      changeSummary: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  ConferenceSpeakerInput: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      displayOrder: {
        type: "integer",
        format: "int32",
      },
      nameAr: {
        type: "string",
        nullable: true,
      },
      nameEn: {
        type: "string",
        nullable: true,
      },
      titleAr: {
        type: "string",
        nullable: true,
      },
      titleEn: {
        type: "string",
        nullable: true,
      },
      specialtyAr: {
        type: "string",
        nullable: true,
      },
      specialtyEn: {
        type: "string",
        nullable: true,
      },
      organizationAr: {
        type: "string",
        nullable: true,
      },
      organizationEn: {
        type: "string",
        nullable: true,
      },
      bioAr: {
        type: "string",
        nullable: true,
      },
      bioEn: {
        type: "string",
        nullable: true,
      },
      photoAssetId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      websiteUrl: {
        type: "string",
        nullable: true,
      },
      linkedinUrl: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  ConferenceScheduleItemInputPublicChildInput: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
      },
      item: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/ConferenceScheduleItemInput",
          },
        ],
        nullable: true,
      },
      changeSummary: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  ConferenceScheduleItemInput: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      displayOrder: {
        type: "integer",
        format: "int32",
      },
      dayNumber: {
        type: "integer",
        format: "int32",
      },
      startsAt: {
        type: "string",
        format: "date-time",
      },
      endsAt: {
        type: "string",
        format: "date-time",
      },
      titleAr: {
        type: "string",
        nullable: true,
      },
      titleEn: {
        type: "string",
        nullable: true,
      },
      descriptionAr: {
        type: "string",
        nullable: true,
      },
      descriptionEn: {
        type: "string",
        nullable: true,
      },
      locationAr: {
        type: "string",
        nullable: true,
      },
      locationEn: {
        type: "string",
        nullable: true,
      },
      speakerId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      itemType: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  ConferenceSponsorInputPublicChildInput: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
      },
      item: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/ConferenceSponsorInput",
          },
        ],
        nullable: true,
      },
      changeSummary: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  ConferenceSponsorInput: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      displayOrder: {
        type: "integer",
        format: "int32",
      },
      nameAr: {
        type: "string",
        nullable: true,
      },
      nameEn: {
        type: "string",
        nullable: true,
      },
      tierAr: {
        type: "string",
        nullable: true,
      },
      tierEn: {
        type: "string",
        nullable: true,
      },
      logoAssetId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      websiteUrl: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  ExecutiveMemberInputPublicChildInput: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
      },
      item: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/ExecutiveMemberInput",
          },
        ],
        nullable: true,
      },
      changeSummary: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  ExecutiveMemberInput: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      displayOrder: {
        type: "integer",
        format: "int32",
      },
      linkedUserId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      nameAr: {
        type: "string",
        nullable: true,
      },
      nameEn: {
        type: "string",
        nullable: true,
      },
      positionAr: {
        type: "string",
        nullable: true,
      },
      positionEn: {
        type: "string",
        nullable: true,
      },
      bioAr: {
        type: "string",
        nullable: true,
      },
      bioEn: {
        type: "string",
        nullable: true,
      },
      photoAssetId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      linkedinUrl: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  MediaAlbumItemInputPublicChildInput: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
      },
      item: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/MediaAlbumItemInput",
          },
        ],
        nullable: true,
      },
      changeSummary: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  MediaAlbumItemInput: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      displayOrder: {
        type: "integer",
        format: "int32",
      },
      itemType: {
        type: "string",
      },
      assetId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      externalProvider: {
        type: "string",
        nullable: true,
      },
      externalId: {
        type: "string",
        nullable: true,
      },
      externalUrl: {
        type: "string",
        nullable: true,
      },
      titleAr: {
        type: "string",
        nullable: true,
      },
      titleEn: {
        type: "string",
        nullable: true,
      },
      captionAr: {
        type: "string",
        nullable: true,
      },
      captionEn: {
        type: "string",
        nullable: true,
      },
      altTextAr: {
        type: "string",
        nullable: true,
      },
      altTextEn: {
        type: "string",
        nullable: true,
      },
      capturedAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  PublicContentWriteInput: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      document: {
        $ref: "#/components/schemas/PublicContentDocument",
      },
      changeSummary: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  PublicContentDocument: {
    type: "object",
    properties: {
      slug: {
        type: "string",
        nullable: true,
      },
      titleAr: {
        type: "string",
        nullable: true,
      },
      titleEn: {
        type: "string",
        nullable: true,
      },
      nameAr: {
        type: "string",
        nullable: true,
      },
      nameEn: {
        type: "string",
        nullable: true,
      },
      fullNameAr: {
        type: "string",
        nullable: true,
      },
      fullNameEn: {
        type: "string",
        nullable: true,
      },
      summaryAr: {
        type: "string",
        nullable: true,
      },
      summaryEn: {
        type: "string",
        nullable: true,
      },
      descriptionAr: {
        type: "string",
        nullable: true,
      },
      descriptionEn: {
        type: "string",
        nullable: true,
      },
      contentAr: {
        description:
          "Domain JSON serialized as its JSON value. Content/block validation is applied by the owning domain.",
      },
      contentEn: {
        description:
          "Domain JSON serialized as its JSON value. Content/block validation is applied by the owning domain.",
      },
      isFeatured: {
        type: "boolean",
      },
      featuredOrder: {
        type: "integer",
        format: "int32",
        nullable: true,
      },
      displayOrder: {
        type: "integer",
        format: "int32",
        nullable: true,
      },
      activityCategoryId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      participantCount: {
        type: "integer",
        format: "int32",
        nullable: true,
      },
      impactAr: {
        type: "string",
        nullable: true,
      },
      impactEn: {
        type: "string",
        nullable: true,
      },
      startsAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      endsAt: {
        type: "string",
        format: "date-time",
        nullable: true,
      },
      timezoneId: {
        type: "string",
      },
      locationNameAr: {
        type: "string",
        nullable: true,
      },
      locationNameEn: {
        type: "string",
        nullable: true,
      },
      locationDetailsAr: {
        type: "string",
        nullable: true,
      },
      locationDetailsEn: {
        type: "string",
        nullable: true,
      },
      mapUrl: {
        type: "string",
        nullable: true,
      },
      organizerAr: {
        type: "string",
        nullable: true,
      },
      organizerEn: {
        type: "string",
        nullable: true,
      },
      issueNumber: {
        type: "string",
        nullable: true,
      },
      volumeNumber: {
        type: "string",
        nullable: true,
      },
      releaseDate: {
        type: "string",
        format: "date",
        nullable: true,
      },
      canvaUrl: {
        type: "string",
        nullable: true,
      },
      startsOn: {
        type: "string",
        format: "date",
        nullable: true,
      },
      endsOn: {
        type: "string",
        format: "date",
        nullable: true,
      },
      campaignId: {
        type: "string",
        format: "uuid",
      },
      coverAssetId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      termStartDate: {
        type: "string",
        format: "date",
        nullable: true,
      },
      termEndDate: {
        type: "string",
        format: "date",
        nullable: true,
      },
      isCurrent: {
        type: "boolean",
      },
      honorCategoryId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      honoreeType: {
        type: "string",
      },
      linkedUserId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      linkedAlumniProfileId: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      honorTitleAr: {
        type: "string",
        nullable: true,
      },
      honorTitleEn: {
        type: "string",
        nullable: true,
      },
      achievementAr: {
        type: "string",
        nullable: true,
      },
      achievementEn: {
        type: "string",
        nullable: true,
      },
      honoredOn: {
        type: "string",
        format: "date",
        nullable: true,
      },
      grantingEntityAr: {
        type: "string",
        nullable: true,
      },
      grantingEntityEn: {
        type: "string",
        nullable: true,
      },
      graduationYear: {
        type: "integer",
        format: "int32",
        nullable: true,
      },
      batchLabel: {
        type: "string",
        nullable: true,
      },
      specialtyAr: {
        type: "string",
        nullable: true,
      },
      specialtyEn: {
        type: "string",
        nullable: true,
      },
      workplaceAr: {
        type: "string",
        nullable: true,
      },
      workplaceEn: {
        type: "string",
        nullable: true,
      },
      jobTitleAr: {
        type: "string",
        nullable: true,
      },
      jobTitleEn: {
        type: "string",
        nullable: true,
      },
      bioAr: {
        type: "string",
        nullable: true,
      },
      bioEn: {
        type: "string",
        nullable: true,
      },
      linkedinUrl: {
        type: "string",
        nullable: true,
      },
      mentorshipOptIn: {
        type: "boolean",
      },
      assets: {
        type: "array",
        items: {
          $ref: "#/components/schemas/PublicAssetInput",
        },
      },
      links: {
        type: "array",
        items: {
          $ref: "#/components/schemas/PublicLinkInput",
        },
      },
      speakers: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ConferenceSpeakerInput",
        },
      },
      scheduleItems: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ConferenceScheduleItemInput",
        },
      },
      sponsors: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ConferenceSponsorInput",
        },
      },
      items: {
        type: "array",
        items: {
          $ref: "#/components/schemas/MediaAlbumItemInput",
        },
      },
      members: {
        type: "array",
        items: {
          $ref: "#/components/schemas/ExecutiveMemberInput",
        },
      },
    },
    additionalProperties: false,
  },
  PublicAssetInput: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      assetId: {
        type: "string",
        format: "uuid",
      },
      role: {
        type: "string",
      },
      altTextAr: {
        type: "string",
        nullable: true,
      },
      altTextEn: {
        type: "string",
        nullable: true,
      },
      sortOrder: {
        type: "integer",
        format: "int32",
      },
    },
    additionalProperties: false,
  },
  PublicLinkInput: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
      linkType: {
        type: "string",
      },
      titleAr: {
        type: "string",
        nullable: true,
      },
      titleEn: {
        type: "string",
        nullable: true,
      },
      url: {
        type: "string",
      },
      sortOrder: {
        type: "integer",
        format: "int32",
      },
    },
    additionalProperties: false,
  },
  PublicCategoryInput: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
        nullable: true,
      },
      nameAr: {
        type: "string",
        nullable: true,
      },
      nameEn: {
        type: "string",
        nullable: true,
      },
      slug: {
        type: "string",
        nullable: true,
      },
      descriptionAr: {
        type: "string",
        nullable: true,
      },
      descriptionEn: {
        type: "string",
        nullable: true,
      },
      displayOrder: {
        type: "integer",
        format: "int32",
      },
    },
    additionalProperties: false,
  },
  PublicAssetInputPublicChildInput: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
      },
      item: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/PublicAssetInput",
          },
        ],
        nullable: true,
      },
      changeSummary: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
  PublicLinkInputPublicChildInput: {
    type: "object",
    properties: {
      version: {
        type: "string",
        format: "uuid",
      },
      item: {
        type: "object",
        allOf: [
          {
            $ref: "#/components/schemas/PublicLinkInput",
          },
        ],
        nullable: true,
      },
      changeSummary: {
        type: "string",
        nullable: true,
      },
    },
    additionalProperties: false,
  },
};
