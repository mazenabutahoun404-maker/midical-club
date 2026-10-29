import { ApiError } from "../../services/api/client";
import { record, string } from "../../services/api/mapping";
import type { OperationsApi } from "../../services/api/operations-api";
import {
  operationsUuid,
  operationsVersion,
} from "../../services/api/operations-contracts";
export type OperationsOperation = keyof OperationsApi;
export function operationsRequest(
  api: OperationsApi,
  id: OperationsOperation,
  input: unknown,
): Promise<unknown> {
  return (api[id] as (input: unknown) => Promise<unknown>)(input);
}
export function savedJson(value: unknown) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    throw new ApiError(
      "The saved JSON is invalid. Review it before editing.",
      422,
      "INVALID_SAVED_JSON",
    );
  }
}
export function synonymDraft(value: unknown) {
  const row = record(value),
    g = record(row.group);
  return {
    canonicalTerm: g.canonicalTerm,
    terms: row.terms,
    language: g.language,
    scope: g.scope,
    subjectCatalogItemId: g.subjectCatalogItemId,
    resourceType: g.resourceType,
    version: g.version,
  };
}
export function settingPayload(
  raw: string,
  saved: unknown,
  definition: unknown,
) {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new ApiError("Enter valid JSON.", 422, "INVALID_JSON");
  }
  const d = record(definition),
    s = record(saved);
  if (
    typeof d.min === "number" &&
    (typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < d.min ||
      value > Number(d.max))
  )
    throw new ApiError(
      `Enter an integer from ${d.min} to ${d.max}.`,
      422,
      "SETTING_BOUNDS",
    );
  if (s.version != null) operationsVersion(s.version);
  return { value, version: s.version ?? null };
}
export type RestorePreview = {
  versionId: string;
  session: string | undefined;
  token: string;
  expiresAt: number;
  changes: { remove: number; add: number };
  policy: string;
};
export function captureRestorePreview(
  value: unknown,
  versionId: string,
  session: string | undefined,
  now = Date.now(),
): RestorePreview {
  const v = record(value),
    c = record(v.changes);
  if (
    !operationsUuid.test(versionId) ||
    !string(v.confirmationToken).trim() ||
    !Number.isInteger(v.expiresInSeconds) ||
    Number(v.expiresInSeconds) <= 0 ||
    ![c.add, c.remove].every((x) => Number.isInteger(x) && Number(x) >= 0)
  )
    throw new ApiError(
      "The restore preview is incomplete.",
      502,
      "INVALID_RESTORE_PREVIEW",
    );
  return {
    versionId,
    session,
    token: string(v.confirmationToken),
    expiresAt: now + Number(v.expiresInSeconds) * 1000,
    changes: { remove: Number(c.remove), add: Number(c.add) },
    policy: string(v.policy),
  };
}
export function restorePayload(
  preview: RestorePreview | null,
  id: string,
  session: string | undefined,
  reason: string,
  ack: boolean,
  now = Date.now(),
) {
  if (
    !preview ||
    preview.versionId !== id ||
    preview.session !== session ||
    preview.expiresAt <= now ||
    !ack ||
    !reason.trim()
  )
    throw new ApiError(
      "Review a fresh preview and enter the restore reason.",
      422,
      "RESTORE_REVIEW_REQUIRED",
    );
  return { reason: reason.trim(), confirmationToken: preview.token };
}
export function reportUrl(value: unknown, now = Date.now()) {
  const r = record(value);
  if (
    !r.downloadUrl ||
    !r.expiresAt ||
    Date.parse(string(r.expiresAt)) <= now ||
    !Number.isFinite(Date.parse(string(r.expiresAt)))
  )
    return null;
  try {
    const u = new URL(string(r.downloadUrl));
    return u.protocol === "https:" && !u.username && !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export function auditBlob(value: unknown, format: string) {
  const types: Record<string, string> = {
    csv: "text/csv",
    pdf: "application/pdf",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  const type = types[format.toLowerCase()];
  if (!type)
    throw new ApiError("Unsupported export format.", 422, "EXPORT_FORMAT");
  if (value instanceof Blob) {
    if (/html|json/i.test(value.type))
      throw new ApiError(
        "The export response is not a file.",
        502,
        "INVALID_EXPORT_FILE",
      );
    return value;
  }
  if (
    typeof value === "string" &&
    format.toLowerCase() === "csv" &&
    !/^\s*(<!doctype|<html)/i.test(value)
  )
    return new Blob([value], { type });
  throw new ApiError(
    "The export response is not a file.",
    502,
    "INVALID_EXPORT_FILE",
  );
}
export function metric(value: unknown) {
  return value == null
    ? "—"
    : typeof value === "number"
      ? value
      : String(value);
}
export function internalHealthPath(value: unknown) {
  const s = string(value);
  return s.startsWith("/") &&
    !s.startsWith("//") &&
    !/[\\\u0000-\u001f]/.test(s)
    ? s
    : null;
}
