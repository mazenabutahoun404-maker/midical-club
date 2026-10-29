import type { ApiClient } from "./client";
import { ApiError } from "./client";
import type { Operations, Schemas } from "./schema.generated";
import { requireVersion } from "./accounts";
import { createRecordId } from "../../lib/record-id";
import { safeUrl } from "./mapping";
const reason = (input: { version?: string | null; reason?: string }) => {
  requireVersion(input.version);
  if (!input.reason?.trim())
    throw new ApiError(
      "Enter a reason for this action.",
      422,
      "REASON_REQUIRED",
    );
};
export function createHttpAssets(
  api: ApiClient,
  invalidate: () => void = () => {},
) {
  const changed = async <T>(value: Promise<T>) => {
    const result = await value;
    invalidate();
    return result;
  };
  const signed = async (result: { url: string; expiresAt: string }) => {
    const url = safeUrl(result.url, "https://api.medclubhu.com");
    if (
      !url ||
      !Number.isFinite(Date.parse(result.expiresAt)) ||
      Date.parse(result.expiresAt) <= Date.now()
    )
      throw new ApiError(
        "The file URL is unavailable or expired.",
        502,
        "INVALID_FILE_URL",
      );
    return { ...result, url };
  };
  return {
    preview: async (assetId: string) =>
      signed(
        await api.call("get_api_v1_assets_by_assetId_preview_url", {
          path: { assetId },
        }),
      ),
    download: async (assetId: string) =>
      signed(
        await api.call("get_api_v1_assets_by_assetId_download_url", {
          path: { assetId },
        }),
      ),
    metadata: (assetId: string) =>
      api.call("get_api_v1_assets_by_assetId_metadata", { path: { assetId } }),
    list: (query: Operations["get_api_v1_admin_assets"]["query"] = {}) =>
      api.call("get_api_v1_admin_assets", { query }),
    get: (assetId: string) =>
      api.call("get_api_v1_admin_assets_by_assetId", { path: { assetId } }),
    processing: (assetId: string) =>
      api.call("get_api_v1_admin_assets_by_assetId_processing_status", {
        path: { assetId },
      }),
    search: (query: Operations["get_api_v1_admin_assets_search"]["query"]) =>
      api.call("get_api_v1_admin_assets_search", { query }),
    updateMetadata: (
      assetId: string,
      body: Schemas["AssetMetadataRequest"],
      key = createRecordId(),
    ) => {
      requireVersion(body.version);
      return changed(
        api.call("put_api_v1_admin_assets_by_assetId_metadata", {
          path: { assetId },
          body,
          idempotencyKey: key,
        }),
      );
    },
    policy: (
      assetId: string,
      body: Schemas["AssetPolicyRequest"],
      key = createRecordId(),
    ) => {
      reason(body);
      return changed(
        api.call("put_api_v1_admin_assets_by_assetId_access_policy", {
          path: { assetId },
          body,
          idempotencyKey: key,
        }),
      );
    },
    remove: (
      assetId: string,
      body: Schemas["AssetAction"],
      key = createRecordId(),
    ) => {
      reason(body);
      return changed(
        api.call("delete_api_v1_admin_assets_by_assetId", {
          path: { assetId },
          body,
          idempotencyKey: key,
        }),
      );
    },
    restore: (
      assetId: string,
      body: Schemas["AssetAction"],
      key = createRecordId(),
    ) => {
      reason(body);
      return changed(
        api.call("post_api_v1_admin_assets_by_assetId_restore", {
          path: { assetId },
          body,
          idempotencyKey: key,
        }),
      );
    },
    retry: (
      assetId: string,
      body: Schemas["AssetRetryRequest"],
      key = createRecordId(),
    ) => {
      reason(body);
      return changed(
        api.call("post_api_v1_admin_assets_by_assetId_retry_processing", {
          path: { assetId },
          body,
          idempotencyKey: key,
        }),
      );
    },
    link: (
      assetId: string,
      body: Schemas["AssetLinkRequest"],
      key = createRecordId(),
    ) => {
      reason(body);
      return changed(
        api.call("post_api_v1_admin_assets_by_assetId_links", {
          path: { assetId },
          body,
          idempotencyKey: key,
        }),
      );
    },
    unlink: (
      assetId: string,
      linkId: string,
      body: Schemas["AssetAction"],
      key = createRecordId(),
    ) => {
      reason(body);
      return changed(
        api.call("delete_api_v1_admin_assets_by_assetId_links_by_linkId", {
          path: { assetId, linkId },
          body,
          idempotencyKey: key,
        }),
      );
    },
    uploads: {
      start: (
        body: Schemas["UploadRequest"],
        key = body.idempotencyKey || createRecordId(),
      ) =>
        api.call("post_api_v1_admin_assets_upload_sessions", {
          body: { ...body, idempotencyKey: key },
          idempotencyKey: key,
        }),
      get: (sessionId: string) =>
        api.call("get_api_v1_admin_assets_upload_sessions_by_sessionId", {
          path: { sessionId },
        }),
      parts: (sessionId: string, partNumbers: number[]) =>
        api.call(
          "post_api_v1_admin_assets_upload_sessions_by_sessionId_parts",
          {
            path: { sessionId },
            body: { partNumbers },
            idempotencyKey: createRecordId(),
          },
        ),
      acknowledge: (sessionId: string, partNumber: number, eTag: string) =>
        api.call(
          "post_api_v1_admin_assets_upload_sessions_by_sessionId_parts_by_partNumber_complete",
          {
            path: { sessionId, partNumber },
            body: { eTag },
            idempotencyKey: createRecordId(),
          },
        ),
      complete: (sessionId: string, key = createRecordId()) =>
        changed(
          api.call(
            "post_api_v1_admin_assets_upload_sessions_by_sessionId_complete",
            { path: { sessionId }, idempotencyKey: key },
          ),
        ),
      abort: (sessionId: string, key = createRecordId()) =>
        api.call(
          "post_api_v1_admin_assets_upload_sessions_by_sessionId_abort",
          { path: { sessionId }, idempotencyKey: key },
        ),
      bulkStart: (
        body: Schemas["BulkUploadRequest"],
        key = body.idempotencyKey || createRecordId(),
      ) =>
        api.call("post_api_v1_admin_assets_bulk_upload_sessions", {
          body: { ...body, idempotencyKey: key },
          idempotencyKey: key,
        }),
      bulkGet: (batchId: string) =>
        api.call("get_api_v1_admin_assets_bulk_upload_sessions_by_batchId", {
          path: { batchId },
        }),
      bulkComplete: (batchId: string, key = createRecordId()) =>
        changed(
          api.call(
            "post_api_v1_admin_assets_bulk_upload_sessions_by_batchId_complete",
            { path: { batchId }, idempotencyKey: key },
          ),
        ),
    },
    imports: {
      create: (body: Schemas["AssetImportRequest"], key = createRecordId()) =>
        api.call("post_api_v1_admin_asset_imports", {
          body,
          idempotencyKey: key,
        }),
      manifest: (
        importId: string,
        body: Schemas["ImportManifestRequest"],
        key = createRecordId(),
      ) => {
        requireVersion(body.version);
        return api.call(
          "post_api_v1_admin_asset_imports_by_importId_manifest",
          { path: { importId }, body, idempotencyKey: key },
        );
      },
      preview: (importId: string) =>
        api.call("get_api_v1_admin_asset_imports_by_importId_preview", {
          path: { importId },
        }),
      get: (importId: string) =>
        api.call("get_api_v1_admin_asset_imports_by_importId", {
          path: { importId },
        }),
      confirm: (
        importId: string,
        body: Schemas["ImportConfirmRequest"],
        key = body.idempotencyKey || createRecordId(),
      ) => {
        reason(body);
        if (!body.manifestHash)
          throw new ApiError(
            "Review the staged manifest first.",
            422,
            "MANIFEST_HASH_REQUIRED",
          );
        return api.call("post_api_v1_admin_asset_imports_by_importId_confirm", {
          path: { importId },
          body: { ...body, idempotencyKey: key },
          idempotencyKey: key,
        });
      },
      pause: (
        importId: string,
        body: Schemas["AssetAction"],
        key = createRecordId(),
      ) => {
        reason(body);
        return api.call("post_api_v1_admin_asset_imports_by_importId_pause", {
          path: { importId },
          body,
          idempotencyKey: key,
        });
      },
      resume: (
        importId: string,
        body: Schemas["AssetAction"],
        key = createRecordId(),
      ) => {
        reason(body);
        return api.call("post_api_v1_admin_asset_imports_by_importId_resume", {
          path: { importId },
          body,
          idempotencyKey: key,
        });
      },
      cancel: (
        importId: string,
        body: Schemas["AssetAction"],
        key = createRecordId(),
      ) => {
        reason(body);
        return api.call("post_api_v1_admin_asset_imports_by_importId_cancel", {
          path: { importId },
          body,
          idempotencyKey: key,
        });
      },
      reuse: (
        importId: string,
        itemId: string,
        assetId: string,
        key = createRecordId(),
      ) =>
        api.call(
          "post_api_v1_admin_asset_imports_by_importId_items_by_itemId_reuse",
          {
            path: { importId, itemId },
            body: { assetId },
            idempotencyKey: key,
          },
        ),
      report: (importId: string) =>
        api.call("get_api_v1_admin_asset_imports_by_importId_report", {
          path: { importId },
        }),
    },
    study: {
      list: (query: Operations["get_api_v1_me_study_files"]["query"] = {}) =>
        api.call("get_api_v1_me_study_files", { query }),
      remove: (id: string, version: string, key = createRecordId()) => {
        requireVersion(version);
        return changed(
          api.call("delete_api_v1_me_study_files_by_id", {
            path: { id },
            body: { version },
            idempotencyKey: key,
          }),
        );
      },
      start: (body: Schemas["StudyUploadInput"], key = createRecordId()) =>
        api.call("post_api_v1_me_study_files_upload_sessions", {
          body,
          idempotencyKey: key,
        }),
      get: (sessionId: string) =>
        api.call("get_api_v1_me_study_files_upload_sessions_by_sessionId", {
          path: { sessionId },
        }),
      parts: (sessionId: string, partNumbers: number[]) =>
        api.call(
          "post_api_v1_me_study_files_upload_sessions_by_sessionId_parts",
          {
            path: { sessionId },
            body: { partNumbers },
            idempotencyKey: createRecordId(),
          },
        ),
      acknowledge: (sessionId: string, partNumber: number, eTag: string) =>
        api.call(
          "post_api_v1_me_study_files_upload_sessions_by_sessionId_parts_by_partNumber_complete",
          {
            path: { sessionId, partNumber },
            body: { eTag },
            idempotencyKey: createRecordId(),
          },
        ),
      complete: (sessionId: string, key = createRecordId()) =>
        changed(
          api.call(
            "post_api_v1_me_study_files_upload_sessions_by_sessionId_complete",
            { path: { sessionId }, idempotencyKey: key },
          ),
        ),
      abort: (sessionId: string, key = createRecordId()) =>
        api.call(
          "post_api_v1_me_study_files_upload_sessions_by_sessionId_abort",
          { path: { sessionId }, idempotencyKey: key },
        ),
    },
  };
}
export type AssetsService = ReturnType<typeof createHttpAssets>;
