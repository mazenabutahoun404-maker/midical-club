import { ApiError } from "./client";
import { record } from "./mapping";
import {
  contributionResponses,
  contributionResponseSchemas,
} from "./contribution-responses.generated";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function requireContributionVersion(
  value: unknown,
): asserts value is string {
  if (typeof value !== "string" || !uuid.test(value))
    throw new ApiError(
      "Reload this contribution before changing it.",
      409,
      "VERSION_REQUIRED",
    );
}
function matches(value: unknown, schema: unknown): boolean {
  const s = record(schema);
  if (s.$ref)
    return matches(
      value,
      contributionResponseSchemas[String(s.$ref).split("/").pop()!],
    );
  if (value === null && s.nullable) return true;
  if (Array.isArray(s.anyOf))
    return s.anyOf.some((child) => matches(value, child));
  if (
    Array.isArray(s.allOf) &&
    !s.allOf.every((child) => matches(value, child))
  )
    return false;
  if (s.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return false;
    const v = record(value),
      props = record(s.properties);
    if (
      Array.isArray(s.required) &&
      s.required.some((key) => !Object.hasOwn(v, String(key)))
    )
      return false;
    return Object.entries(props).every(
      ([key, child]) => !Object.hasOwn(v, key) || matches(v[key], child),
    );
  }
  if (s.type === "array")
    return (
      Array.isArray(value) && value.every((item) => matches(item, s.items))
    );
  if (s.type === "string")
    return (
      typeof value === "string" &&
      (s.format !== "uuid" || uuid.test(value)) &&
      (s.format !== "date-time" || Number.isFinite(Date.parse(value)))
    );
  if (s.type === "integer") return Number.isInteger(value);
  if (s.type === "number")
    return typeof value === "number" && Number.isFinite(value);
  if (s.type === "boolean") return typeof value === "boolean";
  return true;
}
export function validateContributionResponse<T>(id: string, value: T): T {
  if (!matches(value, contributionResponses[id]))
    throw new ApiError(
      "The contribution response is incomplete. Retry or reload before continuing.",
      502,
      "INVALID_CONTRIBUTION_RESPONSE",
    );
  if (!id.startsWith("get_")) {
    const v = record(value);
    if (
      typeof v.id !== "string" ||
      !uuid.test(v.id) ||
      typeof v.version !== "string" ||
      !uuid.test(v.version)
    )
      throw new ApiError(
        "The server did not confirm the updated contribution version.",
        502,
        "INVALID_CONTRIBUTION_RESPONSE",
      );
  }
  return value;
}
