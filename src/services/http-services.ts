import { createHttpHealthApi } from "./api/health-api";
import { createHttpMembershipApi } from "./api/membership-api";
import { createHttpOperationsApi } from "./api/operations-api";
import { createHttpStoreApi } from "./api/store-api";
import { createHttpContributionApi } from "./api/contribution-api";
import { createHttpCommunityApi } from "./api/community-api.generated";
import { createHttpEngagementApi } from "./api/engagement-api";
import { createHttpPublicationApi } from "./api/publication-api";
import { createHttpScheduleApi } from "./api/schedule-api";
import { createHttpStudentApi } from "./api/student-api";
import { createApiMargins } from "./study/api-margins.service";
import { createHttpAssets } from "./api/assets";
import { createHttpContentApi } from "./api/content-api";
import { createHttpAcademicAdmin } from "./api/academic-admin";
import { createHttpAcademicCatalog } from "./api/academic-catalog";
import type { MedClubServices } from "./contracts";
import { createApiClient, ApiError } from "./api/client";
import { createApiSession } from "./api/session";
import { createHttpAuth } from "./api/auth";
import { createHttpAcademics } from "./api/academics";
import { createHttpPublicContent } from "./api/public-content";
import {
  array,
  json,
  localized,
  record,
  safeUrl,
  string,
  unavailable,
} from "./api/mapping";
import { siteContent } from "../content/site";
import { createHttpAccounts } from "./api/accounts";
import { createHttpAccessAdmin } from "./api/access-admin";
import { createHttpGovernance } from "./api/governance";
export function createHttpServices(
  options: {
    baseUrl?: string;
    fetch?: typeof fetch;
    storage?: Storage | null;
  } = {},
): MedClubServices {
  let storage = options.storage;
  if (storage === undefined) {
    try {
      storage = globalThis.sessionStorage;
    } catch {
      storage = null;
    }
  }
  const baseUrl =
    options.baseUrl ||
    import.meta.env?.VITE_API_BASE_URL ||
    (import.meta.env?.DEV && globalThis.location
      ? `${globalThis.location.origin}/backend`
      : "https://api.medclubhu.com");
  const api = createApiClient({
    baseUrl,
    session: createApiSession(storage || null),
    fetch: options.fetch,
  });
  const auth = createHttpAuth(api, storage || null);
  const learning = createHttpAcademics(api);
  const publicContent = createHttpPublicContent(api);
  const assets = createHttpAssets(api, learning.clear);
  const studentApi = createHttpStudentApi(api);
  let owner = api.session.get()?.sessionId;
  api.session.subscribe(() => {
    if (api.session.get()?.sessionId !== owner) {
      learning.clear();
      owner = api.session.get()?.sessionId;
    }
  });
  const files: NonNullable<MedClubServices["files"]> = {
    previewUrl: assets.preview,
    downloadUrl: assets.download,
  };

  return {
    api,
    healthApi: createHttpHealthApi(api),
    communityApi: createHttpCommunityApi(api),
    membershipApi: createHttpMembershipApi(api),
    operationsApi: createHttpOperationsApi(api),
    storeApi: createHttpStoreApi(api),
    contributionApi: createHttpContributionApi(api),
    auth,
    studentApi,
    scheduleApi: createHttpScheduleApi(api, options.fetch),
    publicationApi: createHttpPublicationApi(api),
    engagementApi: createHttpEngagementApi(api, options.fetch),
    studyHub: createApiMargins(
      api,
      studentApi,
      async () => (await auth.getProfile()).id,
    ),
    assets,
    contentApi: createHttpContentApi(api, learning.clear),
    academicAdmin: createHttpAcademicAdmin(api, learning.clear),
    academicCatalog: createHttpAcademicCatalog(api),
    account: createHttpAccounts(api),
    accessAdmin: createHttpAccessAdmin(api),
    files,
    ...learning,
    ...publicContent,
    contentSnapshot: { kind: "live" },
    personal: { getProfile: auth.getProfile },
    site: {
      get: async () => {
        const shell = structuredClone(siteContent);
        shell.announcement.eventId = "";
        shell.sections = shell.sections.filter(
          (section) => section.type !== "announcement",
        );
        return shell;
      },
      getPublished: async () => {
        const content = structuredClone(siteContent);
        // Navigation and shell copy are bundled presentation data, not demo records.
        try {
          const readHome = async (locale: "en" | "ar") => {
            try {
              return await api.call("get_api_v1_content_homepage", {
                query: { locale },
              });
            } catch (error) {
              if (error instanceof ApiError && error.status === 404)
                return null;
              throw error;
            }
          };
          const [en, ar] = await Promise.all([readHome("en"), readHome("ar")]);
          if (!en && !ar) return null;
          content.publishedHome = {
            en: en?.content || { visible: false },
            ar: ar?.content || { visible: false },
          };
          const english = en && "title" in en.content ? en.content : null,
            arabic = ar && "title" in ar.content ? ar.content : null;
          if (english?.title?.text || arabic?.title?.text)
            content.hero.title = localized(
              english?.title?.text,
              arabic?.title?.text,
            );
          if (english?.description?.text || arabic?.description?.text)
            content.hero.description = localized(
              english?.description?.text,
              arabic?.description?.text,
            );
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) return null;
          throw error;
        }
        content.announcement.eventId = "";
        content.sections = content.sections.filter(
          (section) => section.type !== "announcement",
        );
        return content;
      },
    },
    artwork: {
      get: async (section) => {
        try {
          const page = await api.call("get_api_v1_content_artwork_by_section", {
            path: { section },
            query: { locale: "en" },
          });
          if (!page.content.visible || !("sections" in page.content))
            return null;
          const block = page.content.sections
            .flatMap((s) => s.blocks)
            .find((b) => b.blockType === "Image");
          if (!block) return null;
          const configuration = json(block.configuration),
            assetId = string(configuration.AssetId || configuration.assetId);
          const url = assetId
            ? (await files.previewUrl(assetId)).url
            : safeUrl(
                configuration.Url ||
                  configuration.url ||
                  configuration.ExternalUrl ||
                  configuration.externalUrl,
              );
          return url
            ? {
                section,
                dataUrl: url,
                alt: localized(
                  record(configuration.alt).en || configuration.AltEn,
                  record(configuration.alt).ar || configuration.AltAr,
                ),
                updatedAt: "",
              }
            : null;
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) return null;
          throw error;
        }
      },
      replace: async () => {
        throw new ApiError(
          "Artwork editing is not connected in this phase.",
          503,
          "FEATURE_NOT_CONNECTED",
        );
      },
      reset: async () => {
        throw new ApiError(
          "Artwork editing is not connected in this phase.",
          503,
          "FEATURE_NOT_CONNECTED",
        );
      },
    },
    governance: createHttpGovernance(api),
    admin: unavailable("Content administration"),
    builder: unavailable("Page builder"),
    insights: unavailable("Insights"),
    workspace: unavailable("Library and planning"),
    calendar: unavailable("Calendar"),
    notifications: unavailable("Notifications"),
    contributions: unavailable("Contributions"),
    recruitment: unavailable("Recruitment"),
    store: unavailable("Store"),
    search: unavailable("Search"),
  };
}
