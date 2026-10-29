import { ApiError } from "./client";
import { record, string } from "./mapping";
import {
  operationsRoutes,
  operationsSchemas,
} from "./operations-contracts.generated";
import { instant, dateOnly } from "./schedule-contracts";
export const operationsUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function operationsVersion(value: unknown): asserts value is string {
  if (typeof value !== "string" || !operationsUuid.test(value))
    throw new ApiError(
      "Reload and review this record before changing it.",
      409,
      "VERSION_REQUIRED",
    );
}
function invalid(field: string, response: boolean): never {
  throw new ApiError(
    response
      ? "The operations response is incomplete. Reload before continuing."
      : "Invalid operations field: " + field,
    response ? 502 : 422,
    response ? "INVALID_OPERATIONS_RESPONSE" : "INVALID_OPERATIONS_INPUT",
  );
}
export function operationsSchema(
  value: unknown,
  schema: unknown,
  response = false,
  field = "request",
  depth = 0,
): void {
  if (depth > 40) invalid(field, response);
  const s = record(schema);
  if (s.$ref)
    return operationsSchema(
      value,
      operationsSchemas[string(s.$ref).split("/").pop()!],
      response,
      field,
      depth + 1,
    );
  if (value === null && s.nullable) return;
  if (Array.isArray(s.anyOf)) {
    for (const child of s.anyOf) {
      try {
        operationsSchema(value, child, response, field, depth + 1);
        return;
      } catch {}
    }
    invalid(field, response);
  }
  if (Array.isArray(s.allOf))
    for (const child of s.allOf)
      operationsSchema(value, child, response, field, depth + 1);
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
        operationsSchema(x, props[key], response, field + "." + key, depth + 1);
      else if (typeof s.additionalProperties === "object")
        operationsSchema(
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
      operationsSchema(x, s.items, response, field, depth + 1);
  } else if (s.type === "string") {
    if (typeof value !== "string") invalid(field, response);
    if (s.format === "uuid" && !operationsUuid.test(value))
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
export function prepareOperationsInput(id: string, input: unknown) {
  const route = operationsRoutes[id],
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
    operationsSchema(value, p.schema, false, p.name);
  }
  if (route.body) operationsSchema(v.body, route.body);
  if (route.method === "PUT" && /search_(synonyms|abbreviations)/.test(id))
    operationsVersion(body.version);
  if (
    id === "put_api_v1_admin_system_settings_by_key" &&
    (!Object.hasOwn(body, "value") || body.value === undefined)
  )
    invalid("value", false);
  if (
    id === "post_api_v1_admin_governance_versions_by_id_restore" &&
    (!string(body.reason).trim() || !string(body.confirmationToken).trim())
  )
    invalid("restore preview and reason", false);
  if (id === "post_api_v1_admin_governance_access_requests")
    operationsVersion(body.targetVersion);
  if (id === "post_api_v1_admin_governance_access_requests_by_id_decisions")
    operationsVersion(body.version);
}

export function validateOperationsResponse<T>(id: string, value: T): T {
  const route = operationsRoutes[id];
  if (route.status === 204) {
    if (value !== undefined) invalid("no-content", true);
    return value;
  }
  if (record(route.response).format === "binary") {
    if (!(value instanceof Blob) && typeof value !== "string")
      invalid("file", true);
    return value;
  }
  operationsSchema(value, route.response, true);
  const v = record(value);
  if (v.success === false)
    throw new ApiError(
      "The operations did not confirm this action.",
      502,
      "OPERATIONS_ACTION_UNCONFIRMED",
    );
  return value;
}
