import { ApiError } from "./client";
import { record, string } from "./mapping";
import { storeRoutes, storeSchemas } from "./store-contracts.generated";
import { instant, dateOnly } from "./schedule-contracts";
export const storeUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function storeVersion(value: unknown): asserts value is string {
  if (typeof value !== "string" || !storeUuid.test(value))
    throw new ApiError(
      "Reload and review this record before changing it.",
      409,
      "VERSION_REQUIRED",
    );
}
function invalid(field: string, response: boolean): never {
  throw new ApiError(
    response
      ? "The store response is incomplete. Reload before continuing."
      : "Invalid store field: " + field,
    response ? 502 : 422,
    response ? "INVALID_STORE_RESPONSE" : "INVALID_STORE_INPUT",
  );
}
export function storeSchema(
  value: unknown,
  schema: unknown,
  response = false,
  field = "request",
  depth = 0,
): void {
  if (depth > 40) invalid(field, response);
  const s = record(schema);
  if (s.$ref)
    return storeSchema(
      value,
      storeSchemas[string(s.$ref).split("/").pop()!],
      response,
      field,
      depth + 1,
    );
  if (value === null && s.nullable) return;
  if (Array.isArray(s.anyOf)) {
    for (const child of s.anyOf) {
      try {
        storeSchema(value, child, response, field, depth + 1);
        return;
      } catch {}
    }
    invalid(field, response);
  }
  if (Array.isArray(s.allOf))
    for (const child of s.allOf)
      storeSchema(value, child, response, field, depth + 1);
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
        storeSchema(x, props[key], response, field + "." + key, depth + 1);
      else if (typeof s.additionalProperties === "object")
        storeSchema(
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
    for (const x of value) storeSchema(x, s.items, response, field, depth + 1);
  } else if (s.type === "string") {
    if (typeof value !== "string") invalid(field, response);
    if (s.format === "uuid" && !storeUuid.test(value)) invalid(field, response);
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
export function prepareStoreInput(id: string, input: unknown) {
  const route = storeRoutes[id],
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
    storeSchema(value, p.schema, false, p.name);
  }
  if (route.body) storeSchema(v.body, route.body);
  if (
    route.method === "PUT" &&
    id !== "put_api_v1_store_cart_items_by_variantId"
  )
    storeVersion(body.version);
  if (id === "put_api_v1_store_cart_items_by_variantId") {
    storeVersion(body.cartVersion);
    if (!Number.isInteger(body.quantity) || Number(body.quantity) < 1)
      invalid("quantity", false);
  }
  if (
    route.body &&
    /StoreCommand/.test(JSON.stringify(route.body)) &&
    !id.includes("monitoring_jobs")
  )
    storeVersion(body.version);
  if (id === "post_api_v1_store_orders") {
    storeVersion(body.cartVersion);
    if (!storeUuid.test(string(body.cartId)) || !string(body.quoteToken).trim())
      invalid("quote", false);
  }
  for (const key of ["priceJod", "defaultPrice", "unitCostJod"])
    if (
      body[key] != null &&
      (typeof body[key] !== "number" || Number(body[key]) < 0)
    )
      invalid(key, false);
  if (
    id.includes("returns_by_returnId_approve") ||
    id.includes("returns_by_returnId_complete") ||
    id.endsWith("orders_by_orderId_complete") ||
    id.endsWith("orders_by_orderId_extend_pickup_deadline")
  )
    storeVersion(body.version);
}
export function validateStoreResponse<T>(id: string, value: T): T {
  storeSchema(value, storeRoutes[id].response, true);
  const v = record(value);
  if (v.success === false)
    throw new ApiError(
      "The store did not confirm this action.",
      502,
      "STORE_ACTION_UNCONFIRMED",
    );
  return value;
}
