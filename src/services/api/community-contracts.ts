import { ApiError } from "./client";
import {
  communityRoutes,
  communitySchemas,
} from "./community-inputs.generated";
import { record, string } from "./mapping";
import { dateOnly, instant } from "./schedule-contracts";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function fail(field: string): never {
  throw new ApiError(
    "Invalid community request field: " + field,
    422,
    "INVALID_COMMUNITY_INPUT",
  );
}
export function communitySchema(
  value: unknown,
  schema: unknown,
  field = "request",
  depth = 0,
): void {
  if (depth > 32) fail(field);
  const s = record(schema);
  if (s.$ref)
    return communitySchema(
      value,
      communitySchemas[string(s.$ref).split("/").pop()!],
      field,
      depth + 1,
    );
  if (value === null && s.nullable) return;
  if (Array.isArray(s.allOf))
    for (const child of s.allOf)
      communitySchema(value, child, field, depth + 1);
  if (Array.isArray(s.enum) && !s.enum.includes(value)) fail(field);
  if (s.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value))
      fail(field);
    const v = record(value),
      props = record(s.properties);
    for (const k of Array.isArray(s.required) ? s.required : [])
      if (v[String(k)] === undefined) fail(field + "." + k);
    for (const [k, x] of Object.entries(v)) {
      if (x === undefined) continue;
      if (["__proto__", "constructor", "prototype"].includes(k)) fail(field);
      if (Object.hasOwn(props, k))
        communitySchema(x, props[k], field + "." + k, depth + 1);
      else if (s.additionalProperties === false) fail(field + "." + k);
    }
  } else if (s.type === "array") {
    if (!Array.isArray(value) || value.length > 2000) fail(field);
    for (const x of value) communitySchema(x, s.items, field, depth + 1);
  } else if (s.type === "string") {
    if (typeof value !== "string") fail(field);
    if (s.format === "uuid" && !uuid.test(value)) fail(field);
    if (s.format === "date" && !dateOnly(value)) fail(field);
    if (s.format === "date-time" && !instant(value)) fail(field);
    if (typeof s.maxLength === "number" && value.length > s.maxLength)
      fail(field);
  } else if (s.type === "integer" && !Number.isInteger(value)) fail(field);
  else if (
    s.type === "number" &&
    (typeof value !== "number" || !Number.isFinite(value))
  )
    fail(field);
  else if (s.type === "boolean" && typeof value !== "boolean") fail(field);
}
export function validateCommunityInput(
  id: keyof typeof communityRoutes,
  input: unknown,
) {
  const route = communityRoutes[id],
    v = record(input),
    body = record(v.body);
  for (const p of route.parameters as readonly {
    in: string;
    name: string;
    required?: boolean;
    schema: unknown;
  }[]) {
    if (p.in === "header") continue;
    const part = record(v[p.in === "path" ? "path" : "query"]),
      value = part[p.name];
    if (value === undefined || value === null) {
      if (p.required) fail(p.name);
      continue;
    }
    communitySchema(value, p.schema, p.name);
  }
  if (route.body) communitySchema(v.body, route.body);
  if (route.method === "PUT" && !body.version)
    throw new ApiError(
      "Reload and review this record before updating it.",
      409,
      "VERSION_REQUIRED",
    );
}
