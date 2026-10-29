import { ApiError, type ApiClient } from "../api/client";
import { assertOwner } from "../api/mapping";
import type { AssetsService } from "../api/assets";
export type UploadDescriptor = Awaited<
  ReturnType<AssetsService["uploads"]["get"]>
>;
export type TransferProgress = {
  uploaded: number;
  total: number;
  phase: "uploading" | "queued";
};
export function uploadUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ApiError(
      "Invalid upload destination.",
      502,
      "INVALID_UPLOAD_URL",
    );
  }
  if (url.protocol !== "https:" || url.username || url.password)
    throw new ApiError(
      "Invalid upload destination.",
      502,
      "INVALID_UPLOAD_URL",
    );
  return url.href;
}
export function validateUploadSession(session: UploadDescriptor, file: Blob) {
  if (
    !session.id ||
    !session.assetId ||
    !Number.isFinite(Date.parse(session.expiresAt)) ||
    Date.parse(session.expiresAt) <= Date.now()
  )
    throw new ApiError(
      "This upload session has expired.",
      409,
      "UPLOAD_EXPIRED",
    );
  if (!file.size)
    throw new ApiError("Select a nonempty file.", 422, "EMPTY_FILE");
  if (
    !session.uploadUrl &&
    (!Number.isInteger(session.partCount) ||
      session.partCount < 1 ||
      !Number.isInteger(session.partSizeBytes) ||
      session.partSizeBytes < 1 ||
      Math.ceil(file.size / session.partSizeBytes) !== session.partCount)
  )
    throw new ApiError(
      "The upload layout does not match this file.",
      502,
      "UPLOAD_LAYOUT_INVALID",
    );
}
export async function transferFile(options: {
  api: ApiClient;
  service: AssetsService;
  scope: "admin" | "study";
  file: File;
  session: UploadDescriptor;
  owner: string | undefined;
  completionKey: string;
  fetch?: typeof fetch;
  signal?: AbortSignal;
  onProgress?: (value: TransferProgress) => void;
}) {
  const { api, service, scope, file, owner, signal, onProgress } = options,
    driver = scope === "admin" ? service.uploads : service.study,
    fetcher = options.fetch || globalThis.fetch.bind(globalThis);
  const check = () => {
    signal?.throwIfAborted();
    assertOwner(api, owner);
  };
  check();
  const session = await driver.get(options.session.id);
  check();
  if (
    session.id !== options.session.id ||
    session.assetId !== options.session.assetId
  )
    throw new ApiError(
      "Upload session identity changed.",
      409,
      "UPLOAD_SESSION_CHANGED",
    );
  if (session.status === "Completed") {
    onProgress?.({ uploaded: file.size, total: file.size, phase: "queued" });
    return { assetId: session.assetId, status: session.status };
  }
  validateUploadSession(session, file);
  async function put(
    url: string,
    blob: Blob,
    expiresAt: string,
    contentType?: string,
  ) {
    check();
    if (
      !Number.isFinite(Date.parse(expiresAt)) ||
      Date.parse(expiresAt) <= Date.now()
    )
      throw new ApiError(
        "Upload URL expired. Retry to request a new URL.",
        409,
        "UPLOAD_URL_EXPIRED",
      );
    const headers = new Headers();
    if (contentType) headers.set("Content-Type", contentType);
    const result = await fetcher(uploadUrl(url), {
      method: "PUT",
      body: blob,
      headers,
      credentials: "omit",
      redirect: "error",
      signal,
    });
    check();
    if (!result.ok)
      throw new ApiError(
        "File transfer failed. Retry this upload session.",
        result.status,
        "STORAGE_UPLOAD_FAILED",
      );
    return result;
  }
  if (session.uploadUrl) {
    await put(
      session.uploadUrl,
      file,
      session.expiresAt,
      session.requiredContentType,
    );
    onProgress?.({ uploaded: file.size, total: file.size, phase: "uploading" });
  } else {
    let uploaded = 0;
    const seen = new Set<number>();
    for (const part of session.parts) {
      if (
        !Number.isInteger(part.partNumber) ||
        part.partNumber < 1 ||
        part.partNumber > session.partCount ||
        seen.has(part.partNumber)
      )
        throw new ApiError(
          "Invalid upload part metadata.",
          502,
          "UPLOAD_LAYOUT_INVALID",
        );
      seen.add(part.partNumber);
      const size = Math.min(
        session.partSizeBytes,
        file.size - (part.partNumber - 1) * session.partSizeBytes,
      );
      if (part.expectedSizeBytes !== size)
        throw new ApiError(
          "The selected file does not match its upload session.",
          422,
          "UPLOAD_FILE_MISMATCH",
        );
      if (part.eTag) uploaded += size;
    }
    for (let number = 1; number <= session.partCount; number++) {
      check();
      const existing = session.parts.find((p) => p.partNumber === number);
      if (existing?.eTag) continue;
      const start = (number - 1) * session.partSizeBytes,
        blob = file.slice(
          start,
          Math.min(file.size, start + session.partSizeBytes),
        );
      const signed = await driver.parts(session.id, [number]);
      check();
      const part = signed.parts.find((p) => p.partNumber === number);
      if (!part || part.sizeBytes !== blob.size)
        throw new ApiError(
          "Upload part size mismatch.",
          502,
          "UPLOAD_LAYOUT_INVALID",
        );
      const response = await put(
        part.url,
        blob,
        part.expiresAt,
        session.requiredContentType,
      );
      const eTag = response.headers.get("ETag");
      if (!eTag)
        throw new ApiError(
          "Storage did not expose the uploaded part ETag. The server must allow the ETag response header.",
          502,
          "UPLOAD_ETAG_MISSING",
        );
      await driver.acknowledge(session.id, number, eTag);
      check();
      uploaded += blob.size;
      onProgress?.({ uploaded, total: file.size, phase: "uploading" });
    }
  }
  check();
  const result = await driver.complete(session.id, options.completionKey);
  check();
  onProgress?.({ uploaded: file.size, total: file.size, phase: "queued" });
  return result;
}
