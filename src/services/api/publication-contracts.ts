import { ApiError, type ApiClient } from "./client";
import {
  publicationRoutes,
  publicationInputSchemas,
} from "./publication-inputs.generated";
import { createRecordId } from "../../lib/record-id";
import { record, string } from "./mapping";
import { dateOnly, instant, timeZone } from "./schedule-contracts";
export const clubContentTypes = [
  "activities",
  "journal-issues",
  "conferences",
  "executive-bodies",
  "honor-plate",
  "alumni",
] as const;
export type ClubContentType = (typeof clubContentTypes)[number];
export const publicationSections = [
  ...clubContentTypes,
  "campaigns",
  "albums",
] as const;
export type PublicationSection = (typeof publicationSections)[number];
export type PublicationOperation = keyof typeof publicationRoutes;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function invalid(message: string): never {
  throw new ApiError(message, 422, "INVALID_PUBLICATION_INPUT");
}
function malformed(): never {
  throw new ApiError(
    "The publication response is incomplete. Refresh before continuing.",
    502,
    "INVALID_RESPONSE",
  );
}
export function publicationVersion(value: unknown) {
  if (
    typeof value !== "string" ||
    !uuid.test(value) ||
    /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(value)
  )
    throw new ApiError(
      "Reload and review this record before making a change.",
      409,
      "VERSION_REQUIRED",
    );
  return value;
}
/** Only the contract's declared fields are accepted. Omitted optional fields stay omitted. */
export function validatePublicationSchema(
  value: unknown,
  schema: unknown,
  at = "document",
  depth = 0,
): void {
  if (depth > 32) invalid("The document is too deeply nested.");
  const s = record(schema);
  if (s.$ref)
    return validatePublicationSchema(
      value,
      publicationInputSchemas[string(s.$ref).split("/").pop()!],
      at,
      depth + 1,
    );
  if (
    value === null &&
    (s.nullable === true || (Array.isArray(s.enum) && s.enum.includes(null)))
  )
    return;
  if (Array.isArray(s.allOf))
    for (const child of s.allOf)
      validatePublicationSchema(value, child, at, depth + 1);
  if (Array.isArray(s.enum) && !s.enum.includes(value))
    invalid(`${at}: choose a supported value.`);
  switch (s.type) {
    case "object": {
      if (!value || typeof value !== "object" || Array.isArray(value))
        invalid(`${at}: enter an object.`);
      const v = record(value),
        props = record(s.properties);
      for (const k of Array.isArray(s.required) ? s.required : [])
        if (v[String(k)] === undefined)
          invalid(`${at}.${String(k)} is required.`);
      for (const [k, x] of Object.entries(v)) {
        if (["__proto__", "constructor", "prototype"].includes(k))
          invalid(`${at}: unsupported field.`);
        if (props[k])
          validatePublicationSchema(x, props[k], `${at}.${k}`, depth + 1);
        else if (s.additionalProperties === false)
          invalid(`${at}.${k}: this field is not in the publication contract.`);
      }
      break;
    }
    case "array":
      if (!Array.isArray(value)) invalid(`${at}: enter a list.`);
      else {
        if (value.length > 2000)
          invalid(`${at}: narrow this list before saving.`);
        for (const [i, x] of value.entries())
          validatePublicationSchema(x, s.items, `${at}[${i}]`, depth + 1);
      }
      break;
    case "string":
      if (typeof value !== "string") invalid(`${at}: enter text.`);
      if (typeof s.maxLength === "number" && value.length > s.maxLength)
        invalid(`${at}: text is too long.`);
      if (s.format === "uuid" && !uuid.test(value))
        invalid(`${at}: use a server UUID.`);
      if (s.format === "date" && !dateOnly(value))
        invalid(`${at}: enter a real date.`);
      if (s.format === "date-time" && !instant(value))
        invalid(`${at}: include a valid date, time and UTC offset.`);
      break;
    case "integer":
      if (typeof value !== "number" || !Number.isInteger(value))
        invalid(`${at}: enter a whole number.`);
      break;
    case "number":
      if (typeof value !== "number" || !Number.isFinite(value))
        invalid(`${at}: enter a number.`);
      break;
    case "boolean":
      if (typeof value !== "boolean") invalid(`${at}: choose true or false.`);
      break;
  }
}
export function checkPublicationDocument(document: unknown, about = false) {
  validatePublicationSchema(
    document,
    publicationInputSchemas[
      about ? "ContentDocument" : "PublicContentDocument"
    ],
  );
  const doc = record(document);
  for (const [key, val] of Object.entries(doc)) {
    if (val != null && /(^url$|Url$)/.test(key) && val !== "") {
      let url: URL;
      try {
        url = new URL(string(val));
      } catch {
        invalid(`${key}: enter a complete HTTPS address.`);
      }
      if (url!.protocol !== "https:" || url!.username || url!.password)
        invalid(`${key}: use an HTTPS address without credentials.`);
    }
  }
  if (doc.timezoneId) timeZone(string(doc.timezoneId));
  if (
    doc.startsAt &&
    doc.endsAt &&
    Date.parse(string(doc.endsAt)) < Date.parse(string(doc.startsAt))
  )
    invalid("End time must follow start time.");
  for (const [start, end] of [
    ["startsOn", "endsOn"],
    ["termStartDate", "termEndDate"],
  ])
    if (doc[start] && doc[end] && string(doc[end]) < string(doc[start]))
      invalid("End date must follow start date.");
  for (const key of [
    "participantCount",
    "featuredOrder",
    "displayOrder",
    "graduationYear",
  ])
    if (typeof doc[key] === "number" && Number(doc[key]) < 0)
      invalid(`${key}: enter zero or a positive number.`);
}
export function preparePublicationInput(
  id: PublicationOperation,
  input: unknown,
) {
  const route = publicationRoutes[id],
    v = record(input),
    path = record(v.path),
    query = record(v.query),
    body = record(v.body);
  if (path.contentType) {
    const allowed = route.path.includes("/categories")
      ? ["activities", "honor-plate"]
      : route.path.endsWith("/schedule")
        ? clubContentTypes.filter((x) => x !== "conferences")
        : clubContentTypes;
    if (!(allowed as readonly unknown[]).includes(path.contentType))
      invalid("Choose a supported publication section.");
  }
  if (
    path.mediaType &&
    !(
      route.path.startsWith("/api/v1/admin/")
        ? ["campaigns", "albums"]
        : ["campaigns"]
    ).includes(string(path.mediaType))
  )
    invalid("Choose a supported media section.");
  if (
    path.collection &&
    !["speakers", "schedule"].includes(string(path.collection))
  )
    invalid("Choose speakers or schedule.");
  for (const [name, val] of Object.entries(path))
    if (/(^id$|Id$)/.test(name) && !uuid.test(string(val)))
      invalid(`${name}: use a server UUID.`);
  for (const name of ["Page", "PageSize"])
    if (
      query[name] !== undefined &&
      (!Number.isInteger(query[name]) ||
        Number(query[name]) < 1 ||
        (name === "PageSize" && Number(query[name]) > 100))
    )
      invalid("Choose a valid page size and page.");
  if (route.body) validatePublicationSchema(v.body, route.body, "request");
  const bodySchema =
    route.body && "$ref" in route.body
      ? route.body.$ref.split("/").pop()
      : undefined;
  const createWrite =
    route.method === "POST" && bodySchema === "PublicContentWriteInput";
  if (
    route.method !== "GET" &&
    !createWrite &&
    !(route.method === "POST" && bodySchema === "PublicCategoryInput")
  ) {
    publicationVersion(
      route.method === "DELETE" ? query.version : body.version,
    );
  }
  if (bodySchema === "PublicContentWriteInput")
    checkPublicationDocument(body.document);
  if (bodySchema === "AboutWriteInput")
    checkPublicationDocument(body.document, true);
  if (bodySchema === "PublicContentAction") {
    if (!string(body.reason).trim()) invalid("Enter a reason for this action.");
    if (body.publishAt && Date.parse(string(body.publishAt)) <= Date.now())
      invalid("Choose a future publication time.");
    if (body.archiveAt && Date.parse(string(body.archiveAt)) <= Date.now())
      invalid("Choose a future archive time.");
    if (
      body.publishAt &&
      body.archiveAt &&
      Date.parse(string(body.archiveAt)) <= Date.parse(string(body.publishAt))
    )
      invalid("Archive time must follow publication time.");
    if (
      (route.path.endsWith("/schedule-publication") ||
        route.path.endsWith("/schedule")) &&
      !body.publishAt
    )
      invalid("Choose a publication time.");
    if (body.previousCurrentId) publicationVersion(body.previousCurrentVersion);
    if (
      route.path.endsWith("/set-current") &&
      body.previousCurrentId &&
      !body.previousTermEndDate
    )
      invalid("Review the previous body's term end date.");
  }
  const item = record(body.item);
  const childRouteId =
    path.linkId || path.speakerId || path.itemId || path.memberId;
  if (childRouteId && body.item && string(item.id) !== string(childRouteId))
    invalid("The child draft does not match the selected item.");
  for (const [key, val] of Object.entries(item))
    if (/(^url$|Url$)/.test(key) && val) {
      let url: URL;
      try {
        url = new URL(string(val));
      } catch {
        invalid(`${key}: enter a valid HTTPS address.`);
      }
      if (url!.protocol !== "https:" || url!.username || url!.password)
        invalid(`${key}: use HTTPS without credentials.`);
    }
  if (
    item.startsAt &&
    item.endsAt &&
    Date.parse(string(item.endsAt)) <= Date.parse(string(item.startsAt))
  )
    invalid("Programme end time must follow start time.");
}
export function publicationPage(value: unknown) {
  const v = record(value);
  if (
    !Array.isArray(v.items) ||
    !Number.isInteger(v.total) ||
    Number(v.total) < 0 ||
    !Number.isInteger(v.page) ||
    Number(v.page) < 1 ||
    !Number.isInteger(v.pageSize) ||
    Number(v.pageSize) < 1 ||
    Number(v.pageSize) > 100
  )
    malformed();
  return v as Record<string, unknown> & {
    items: Record<string, unknown>[];
    total: number;
    page: number;
    pageSize: number;
  };
}
export function checkedPublicationResponse<T>(
  id: PublicationOperation,
  value: T,
  input: unknown,
): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) malformed();
  const v = record(value),
    path = record(record(input).path),
    route = publicationRoutes[id];
  if (route.method === "GET") {
    if (id === "get_api_v1_admin_about_versions") {
      publicationPage(v.published);
      publicationPage(v.drafts);
    } else if (
      "items" in v ||
      route.path.endsWith("/versions") ||
      route.path.endsWith("/schedules") ||
      route.path.endsWith("/categories") ||
      id === "get_api_v1_medclub_team_search" ||
      id === "get_api_v1_conferences_by_slug_by_collection" ||
      id === "get_api_v1_media_campaigns_by_campaignSlug_albums" ||
      id === "get_api_v1_admin_media_campaigns_by_id_albums" ||
      [
        "/api/v1/admin/{contentType}",
        "/api/v1/admin/media/{mediaType}",
        "/api/v1/{contentType}",
        "/api/v1/media/{mediaType}",
      ].includes(route.path)
    )
      publicationPage(v);
    if (route.path.endsWith("/preview")) {
      if (v.preview !== true || !v.document || typeof v.document !== "object")
        malformed();
    }
  }
  if (v.resourceVersion) publicationVersion(v.resourceVersion);
  if (v.schedule) {
    const s = record(v.schedule);
    if (!uuid.test(string(s.id)) || !uuid.test(string(s.version))) malformed();
  }
  const administrative = route.path.startsWith("/api/v1/admin/");
  if (administrative && "document" in v && !route.path.endsWith("/preview")) {
    if (
      !uuid.test(string(v.id)) ||
      !uuid.test(string(v.version)) ||
      !v.document
    )
      malformed();
    if (path.id && string(v.id).toLowerCase() !== string(path.id).toLowerCase())
      malformed();
  }
  if (route.path.endsWith("/preview") && v.id && path.id && v.id !== path.id)
    malformed();
  if (
    route.path.endsWith("/preview") &&
    record(record(input).query).versionId &&
    v.versionId !== record(record(input).query).versionId
  )
    malformed();
  if (id === "get_api_v1_admin_medclub_team_monitoring")
    for (const k of [
      "scheduleCounts",
      "failedSchedules",
      "failedBackground",
      "backgroundCounts",
    ])
      if (!Array.isArray(v[k])) malformed();
  if (
    id === "get_api_v1_medclub_team_overview" &&
    (!Array.isArray(v.counts) || !v.featured)
  )
    malformed();
  return value;
}
/** Keys survive ambiguous failures for identical explicit retries, isolated to the current session. */
export function publicationCommand(api: ApiClient) {
  const keys = new Map<string, string>();
  let owner = api.session.get()?.sessionId;
  api.session.subscribe(() => {
    if (owner !== api.session.get()?.sessionId) {
      keys.clear();
      owner = api.session.get()?.sessionId;
    }
  });
  return async function command<T>(
    id: string,
    input: unknown,
    work: (key: string) => Promise<T>,
  ) {
    const signature = JSON.stringify([owner, id, input], (k, v) =>
        k === "signal" || k === "idempotencyKey" ? undefined : v,
      ),
      given = record(input).idempotencyKey,
      key = string(given) || keys.get(signature) || createRecordId();
    keys.set(signature, key);
    try {
      const result = await work(key);
      keys.delete(signature);
      return result;
    } catch (e) {
      if (
        e instanceof ApiError &&
        e.status >= 400 &&
        e.status < 500 &&
        ![408, 429].includes(e.status)
      )
        keys.delete(signature);
      throw e;
    }
  };
}
