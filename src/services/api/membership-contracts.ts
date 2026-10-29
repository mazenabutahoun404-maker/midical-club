import { ApiError } from "./client";
import { record, string } from "./mapping";
import {
  membershipRoutes,
  membershipSchemas,
} from "./membership-contracts.generated";
import { instant, dateOnly } from "./schedule-contracts";
export const membershipUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function membershipVersion(value: unknown): asserts value is string {
  if (typeof value !== "string" || !membershipUuid.test(value))
    throw new ApiError(
      "Reload and review this record before changing it.",
      409,
      "VERSION_REQUIRED",
    );
}
function invalid(field: string, response: boolean): never {
  throw new ApiError(
    response
      ? "The membership response is incomplete. Reload before continuing."
      : "Invalid membership field: " + field,
    response ? 502 : 422,
    response ? "INVALID_MEMBERSHIP_RESPONSE" : "INVALID_MEMBERSHIP_INPUT",
  );
}
export function membershipSchema(
  value: unknown,
  schema: unknown,
  response = false,
  field = "request",
  depth = 0,
): void {
  if (depth > 40) invalid(field, response);
  const s = record(schema);
  if (s.$ref)
    return membershipSchema(
      value,
      membershipSchemas[string(s.$ref).split("/").pop()!],
      response,
      field,
      depth + 1,
    );
  if (value === null && s.nullable) return;
  if (Array.isArray(s.anyOf)) {
    for (const child of s.anyOf) {
      try {
        membershipSchema(value, child, response, field, depth + 1);
        return;
      } catch {}
    }
    invalid(field, response);
  }
  if (Array.isArray(s.allOf))
    for (const child of s.allOf)
      membershipSchema(value, child, response, field, depth + 1);
  if (Array.isArray(s.enum) && !s.enum.includes(value))
    invalid(field, response);
  if (s.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value))
      invalid(field, response);
    const v = record(value),
      props = record(s.properties);
    for (const key of Array.isArray(s.required) ? s.required : [])
      if (v[String(key)] === undefined) invalid(field + "." + key, response);
    for (const [key, x] of Object.entries(v)) {
      if (x === undefined) continue;
      if (["__proto__", "constructor", "prototype"].includes(key))
        invalid(field, response);
      if (Object.hasOwn(props, key))
        membershipSchema(x, props[key], response, field + "." + key, depth + 1);
      else if (typeof s.additionalProperties === "object")
        membershipSchema(
          x,
          s.additionalProperties,
          response,
          field + "." + key,
          depth + 1,
        );
      else if (s.additionalProperties === false && !response)
        invalid(field + "." + key, response);
    }
  } else if (s.type === "array") {
    if (!Array.isArray(value) || value.length > 10000) invalid(field, response);
    for (const x of value)
      membershipSchema(x, s.items, response, field, depth + 1);
  } else if (s.type === "string") {
    if (typeof value !== "string") invalid(field, response);
    if (s.format === "uuid" && !membershipUuid.test(value))
      invalid(field, response);
    if (s.format === "date-time" && !instant(value)) invalid(field, response);
    if (s.format === "date" && !dateOnly(value)) invalid(field, response);
    if (typeof s.maxLength === "number" && value.length > s.maxLength)
      invalid(field, response);
  } else if (s.type === "integer" && !Number.isInteger(value))
    invalid(field, response);
  else if (
    s.type === "number" &&
    (typeof value !== "number" || !Number.isFinite(value))
  )
    invalid(field, response);
  else if (s.type === "boolean" && typeof value !== "boolean")
    invalid(field, response);
  if (
    typeof value === "number" &&
    ((typeof s.minimum === "number" && value < s.minimum) ||
      (typeof s.maximum === "number" && value > s.maximum))
  )
    invalid(field, response);
}
export function prepareMembershipInput(id: string, input: unknown) {
  const route = membershipRoutes[id],
    v = record(input),
    body = record(v.body);
  if (!route) invalid("operation", false);
  for (const p of route.parameters) {
    if (p.in === "header") continue;
    const value = record(v[p.in === "path" ? "path" : "query"])[p.name];
    if (value === undefined || value === null) {
      if (p.required) invalid(p.name, false);
      continue;
    }
    membershipSchema(value, p.schema, false, p.name);
  }
  if (route.body) membershipSchema(v.body, route.body);
  if (
    route.method === "PUT" ||
    /EngagementAction|RecruitmentDraftSubmissionRequest/.test(
      JSON.stringify(route.body),
    )
  )
    membershipVersion(body.version);
  if (
    id ===
      "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_waive" &&
    !string(body.reason).trim()
  )
    invalid("waiver reason", false);
  if (
    id === "put_api_v1_member_profiles_my_public_visibility" &&
    body.publicVisibility === true &&
    body.consent !== true
  )
    invalid("explicit public consent", false);
  if (
    id === "put_api_v1_admin_recruitment_openings_by_id" &&
    Array.isArray(body.questions) &&
    body.questions.some((q) => typeof record(q).active !== "boolean")
  )
    invalid("Set active explicitly for every replacement question", false);
  for (const [start, end] of [
    ["startsAt", "endsAt"],
    ["opensAt", "closesAt"],
    ["startsOn", "endsOn"],
  ])
    if (
      body[start] != null &&
      body[end] != null &&
      Date.parse(string(body[start])) >= Date.parse(string(body[end]))
    )
      invalid(end, false);
  for (const field of ["capacity", "defaultCapacity", "durationMinutes"])
    if (body[field] != null && Number(body[field]) < 1) invalid(field, false);
}

function projection(value: unknown, schema: unknown, depth = 0): void {
  if (depth > 40) invalid("projection depth", true);
  const s = record(schema);
  if (s.$ref)
    return projection(
      value,
      membershipSchemas[string(s.$ref).split("/").pop()!],
      depth + 1,
    );
  if (value == null) return;
  if (Array.isArray(s.anyOf)) {
    for (const child of s.anyOf) {
      try {
        membershipSchema(value, child, true);
        projection(value, child, depth + 1);
        return;
      } catch {}
    }
    invalid("projection variant", true);
  }
  if (Array.isArray(s.allOf))
    for (const child of s.allOf) projection(value, child, depth + 1);
  if (Array.isArray(value) && s.items) {
    for (const row of value) projection(row, s.items, depth + 1);
    return;
  }
  if (s.type !== "object") return;
  const v = record(value),
    props = record(s.properties);
  if (record(props.items).type === "array") {
    if (!Array.isArray(v.items)) invalid("page items", true);
    for (const key of ["page", "pageSize", "totalItems", "totalPages"])
      if (
        !Number.isInteger(v[key]) ||
        Number(v[key]) < (key === "page" || key === "pageSize" ? 1 : 0)
      )
        invalid(key, true);
  }
  for (const key of ["id", "version", "sessionId"])
    if (
      record(props[key]).format === "uuid" &&
      !record(props[key]).nullable &&
      !membershipUuid.test(string(v[key]))
    )
      invalid(key, true);
  for (const [key, child] of Object.entries(props))
    if (v[key] !== undefined) projection(v[key], child, depth + 1);
}
type CheckedEntity<T> = T &
  ("id" extends keyof T ? { id: string } : object) &
  ("version" extends keyof T ? { version: string } : object);
export type MembershipResult<T> = T extends readonly (infer Row)[]
  ? CheckedEntity<Row>[]
  : T extends object
    ? "items" extends keyof T
      ? Omit<T, "items" | "page" | "pageSize" | "totalItems" | "totalPages"> & {
          items: NonNullable<
            T["items" & keyof T]
          > extends readonly (infer Row)[]
            ? CheckedEntity<Row>[]
            : never;
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
        }
      : CheckedEntity<T>
    : T;
export function validateMembershipResponse<T>(
  id: string,
  value: T,
): MembershipResult<T> {
  const route = membershipRoutes[id];
  if (route.status === 204) {
    if (value !== undefined) invalid("no-content", true);
    return value as MembershipResult<T>;
  }
  if (record(route.response).format === "binary") {
    if (!(value instanceof Blob) && typeof value !== "string")
      invalid("file", true);
    return value as MembershipResult<T>;
  }
  membershipSchema(value, route.response, true);
  projection(value, route.response);
  const v = record(value);
  if (
    record(route.response).$ref ===
      "#/components/schemas/EntityVersionResponse" &&
    (!membershipUuid.test(string(v.id)) ||
      !membershipUuid.test(string(v.version)))
  )
    invalid("saved identifier and version", true);
  if (v.success === false)
    throw new ApiError(
      "The membership did not confirm this action.",
      502,
      "MEMBERSHIP_ACTION_UNCONFIRMED",
    );
  return value as MembershipResult<T>;
}
