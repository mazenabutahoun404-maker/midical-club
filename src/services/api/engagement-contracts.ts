import { ApiError, type ApiClient } from "./client";
import {
  engagementInputSchemas,
  engagementRoutes,
} from "./engagement-inputs.generated";
import { record, string } from "./mapping";
import { dateOnly, instant, timeZone } from "./schedule-contracts";
import { createRecordId } from "../../lib/record-id";
export type EngagementOperation = keyof typeof engagementRoutes;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function invalid(message: string): never {
  throw new ApiError(message, 422, "INVALID_ENGAGEMENT_INPUT");
}
function malformed(): never {
  throw new ApiError(
    "The engagement response is incomplete. Refresh before continuing.",
    502,
    "INVALID_RESPONSE",
  );
}
export function engagementVersion(value: unknown) {
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
export const reports = [
  "registrations",
  "attendance",
  "evaluations",
  "volunteer-hours",
  "certificates",
] as const;
export function engagementUrl(value: unknown) {
  try {
    const u = new URL(string(value));
    return u.protocol === "https:" && !u.username && !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export function validateEngagementSchema(
  value: unknown,
  schema: unknown,
  at = "document",
  depth = 0,
): void {
  if (depth > 32) invalid("The document is too deeply nested.");
  const s = record(schema);
  if (s.$ref)
    return validateEngagementSchema(
      value,
      engagementInputSchemas[string(s.$ref).split("/").pop()!],
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
      validateEngagementSchema(value, child, at, depth + 1);
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
          validateEngagementSchema(x, props[k], `${at}.${k}`, depth + 1);
        else if (s.additionalProperties === false)
          invalid(`${at}.${k}: this field is not in the engagement contract.`);
      }
      break;
    }
    case "array":
      if (!Array.isArray(value)) invalid(`${at}: enter a list.`);
      else {
        if (value.length > 2000)
          invalid(`${at}: narrow this list before saving.`);
        for (const [i, x] of value.entries())
          validateEngagementSchema(x, s.items, `${at}[${i}]`, depth + 1);
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
export function engagementPage(value: unknown) {
  const v = record(value);
  if (
    !Array.isArray(v.items) ||
    !Number.isInteger(v.page) ||
    Number(v.page) < 1 ||
    !Number.isInteger(v.pageSize) ||
    Number(v.pageSize) < 1 ||
    Number(v.pageSize) > 100 ||
    !Number.isInteger(v.totalItems) ||
    Number(v.totalItems) < 0 ||
    !Number.isInteger(v.totalPages) ||
    Number(v.totalPages) < 0
  )
    malformed();
  return v as Record<string, unknown> & {
    items: Record<string, unknown>[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
export function prepareEngagementInput(
  id: EngagementOperation,
  input: unknown,
) {
  const op = engagementRoutes[id],
    v = record(input),
    path = record(v.path),
    query = record(v.query),
    body = record(v.body);
  for (const [k, val] of Object.entries(path))
    if (/(^id$|Id$)/.test(k) && !uuid.test(string(val)))
      invalid(`${k}: use a server UUID.`);
  if (path.report && !(reports as readonly unknown[]).includes(path.report))
    invalid("Choose a supported report.");
  for (const k of ["Page", "PageSize"])
    if (
      query[k] !== undefined &&
      (!Number.isInteger(query[k]) ||
        Number(query[k]) < 1 ||
        (k === "PageSize" && Number(query[k]) > 100))
    )
      invalid("Choose a valid page and size.");
  for (const k of ["From", "To"])
    if (query[k] && !instant(query[k]))
      invalid(`${k}: include a valid instant with an offset.`);
  if (
    query.From &&
    query.To &&
    Date.parse(string(query.To)) < Date.parse(string(query.From))
  )
    invalid("End filter must follow start filter.");
  if (op.body) validateEngagementSchema(v.body, op.body, "request");
  const schema =
    op.body && "$ref" in op.body ? op.body.$ref.split("/").pop() : "";
  if (op.method === "PUT" && schema !== "ReminderPreferenceRequest")
    engagementVersion(body.version);
  const reviewedAction =
    schema === "EventAction" ||
    schema === "EngagementAction" ||
    schema === "VolunteerDecision";
  // Certificate and opportunity preference projections omit their own concurrency versions.
  // Their contracts allow omitted versions. Do not substitute another entity's version.
  if (reviewedAction && !/\/admin\/certificates\//.test(op.path))
    engagementVersion(body.version);
  if (reviewedAction && !string(body.reason).trim())
    invalid("Enter a reason for this action.");
  if (schema === "EventDefinition") {
    for (const key of [
      "slug",
      "titleAr",
      "timezoneId",
      "locationMode",
      "attendanceMode",
      "certificateRule",
    ])
      if (!string(body[key]).trim()) invalid(`${key}: enter a value.`);
    for (const key of [
      "startsAt",
      "endsAt",
      "registrationOpensAt",
      "registrationClosesAt",
      "checkinOpensAt",
      "checkinClosesAt",
    ])
      if (!instant(body[key]))
        invalid(`${key}: include a date, time and UTC offset.`);
    timeZone(string(body.timezoneId));
    for (const [start, end] of [
      ["startsAt", "endsAt"],
      ["registrationOpensAt", "registrationClosesAt"],
      ["checkinOpensAt", "checkinClosesAt"],
      ["checkoutOpensAt", "checkoutClosesAt"],
    ])
      if (
        body[start] &&
        body[end] &&
        Date.parse(string(body[end])) <= Date.parse(string(body[start]))
      )
        invalid(`${end} must follow ${start}.`);
    if (
      body.capacity != null &&
      (!Number.isInteger(body.capacity) || Number(body.capacity) < 1)
    )
      invalid("Capacity must be positive or null for no declared limit.");
    if (
      body.minimumDurationPercentage != null &&
      (Number(body.minimumDurationPercentage) < 0 ||
        Number(body.minimumDurationPercentage) > 100)
    )
      invalid("Duration percentage must be between 0 and 100.");
    for (const key of [
      "audiences",
      "registrationQuestions",
      "evaluationQuestions",
      "assets",
    ])
      if (!Array.isArray(body[key]))
        invalid(`Review the complete ${key} list before saving.`);
    if (body.publicOnlineUrl && !engagementUrl(body.publicOnlineUrl))
      invalid("Use a complete HTTPS online address.");
  }
  if (schema === "OpportunityRequest") {
    if (!string(body.titleAr).trim() || !string(body.type).trim())
      invalid("Enter the Arabic title and opportunity type.");
    if (
      !engagementUrl(body.sourceUrl) ||
      (body.applicationUrl && !engagementUrl(body.applicationUrl))
    )
      invalid("Use a complete HTTPS source/application address.");
    timeZone(string(body.timezoneId));
    if (
      body.opensAt &&
      body.deadlineAt &&
      Date.parse(string(body.deadlineAt)) <= Date.parse(string(body.opensAt))
    )
      invalid("Deadline must follow opening time.");
    if (op.method === "PUT" && !Array.isArray(body.audiences))
      invalid("Review the complete opportunity audience before saving.");
  }
  if (schema === "VolunteerRequest" || schema === "AdminVolunteerRequest") {
    if (
      typeof body.hours !== "number" ||
      !Number.isFinite(body.hours) ||
      body.hours <= 0
    )
      invalid("Enter positive volunteer hours.");
    if (!dateOnly(body.serviceDate) || !string(body.activityDescription).trim())
      invalid("Enter the service date and activity description.");
    if (
      schema === "AdminVolunteerRequest" &&
      (!uuid.test(string(body.userId)) || !string(body.reason).trim())
    )
      invalid("Select the recipient and enter a reason.");
  }
  if (
    schema === "VolunteerDecision" &&
    body.approvedHours != null &&
    (typeof body.approvedHours !== "number" || body.approvedHours < 0)
  )
    invalid("Approved hours must be zero or positive.");
  if (
    schema === "VolunteerDecision" &&
    op.path.endsWith("/correct") &&
    body.approvedHours == null
  )
    invalid("Enter the corrected approved hours.");
  if (schema === "EventAttendanceRequest") {
    if (op.method === "PUT") engagementVersion(body.version);
    if (!uuid.test(string(body.registrationId)) || !string(body.reason).trim())
      invalid("Enter the registration ID and reason.");
    if (
      body.checkinAt &&
      body.checkoutAt &&
      Date.parse(string(body.checkoutAt)) < Date.parse(string(body.checkinAt))
    )
      invalid("Checkout must follow check-in.");
  }
  if (
    schema === "EventScanRequest" &&
    (!uuid.test(string(body.eventId)) ||
      !string(body.token).trim() ||
      !string(body.operation).trim())
  )
    invalid("Enter the event ID, attendance token and operation.");
  if (
    schema === "EventManualRegistrationRequest" &&
    (!uuid.test(string(body.userId)) || !string(body.reason).trim())
  )
    invalid("Enter the student ID and registration reason.");
  if (
    schema === "EventExportRequest" &&
    (!(reports as readonly unknown[]).includes(body.report) ||
      !string(body.format).trim())
  )
    invalid("Choose a report and enter the export format.");
  if (
    schema === "EventTemplateRequest" &&
    (!string(body.name).trim() || !string(body.titleAr).trim() || !body.layout)
  )
    invalid("Enter the template name, Arabic title and complete layout.");
}
function checkedQuestions(value: unknown) {
  if (!Array.isArray(value)) malformed();
  const ids = new Set<string>();
  for (const raw of value) {
    const next = string(record(raw).id);
    if (ids.has(next)) malformed();
    ids.add(next);
    const q = record(raw);
    if (
      !uuid.test(string(q.id)) ||
      typeof q.questionType !== "string" ||
      typeof q.isRequired !== "boolean"
    )
      malformed();
    if (q.optionsJson != null && q.optionsJson !== "") {
      let options: unknown;
      try {
        options = JSON.parse(string(q.optionsJson));
      } catch {
        malformed();
      }
      if (!Array.isArray(options) || options.some((x) => typeof x !== "string"))
        malformed();
    }
  }
}
function checkedEventSummary(raw: unknown) {
  const event = record(raw);
  if (
    !uuid.test(string(event.id)) ||
    !string(event.slug) ||
    !instant(event.startsAt) ||
    !instant(event.endsAt)
  )
    malformed();
  try {
    timeZone(string(event.timezoneId));
  } catch {
    malformed();
  }
}
export function checkedEngagementResponse<T>(
  id: EngagementOperation,
  value: T,
  input: unknown,
): T {
  const op = engagementRoutes[id],
    v = record(value),
    path = record(record(input).path);
  if (value === null) {
    if (id === "get_api_v1_events_by_id_registration_my") return value;
    malformed();
  }
  if (Array.isArray(value)) {
    if (id === "get_api_v1_events_by_id_evaluation_form")
      checkedQuestions(value);
    if (
      ![
        "get_api_v1_events_by_id_evaluation_form",
        "get_api_v1_admin_events_by_id_registrations_by_registrationId_answers",
      ].includes(id)
    )
      malformed();
    return value;
  }
  if (!value || typeof value !== "object") malformed();
  if (
    "items" in v ||
    [
      "get_api_v1_events",
      "get_api_v1_admin_events",
      "get_api_v1_opportunities",
      "get_api_v1_opportunities_saved",
      "get_api_v1_admin_opportunities",
      "get_api_v1_events_registrations_my",
      "get_api_v1_admin_events_by_id_registrations",
      "get_api_v1_admin_events_by_id_waitlist",
      "get_api_v1_admin_events_by_id_attendance",
      "get_api_v1_admin_certificate_templates",
      "get_api_v1_certificates_my",
      "get_api_v1_admin_events_by_id_certificates",
      "get_api_v1_volunteer_hours_my",
      "get_api_v1_admin_volunteer_hours",
      "get_api_v1_admin_event_jobs",
    ].includes(id)
  )
    engagementPage(v);
  if (id === "get_api_v1_events" || id === "get_api_v1_admin_events")
    for (const item of v.items as unknown[]) checkedEventSummary(item);
  if (
    id === "get_api_v1_events_by_slug" ||
    id === "get_api_v1_admin_events_by_id"
  ) {
    const event = record(v.event);
    if (!uuid.test(string(event.id)) || !string(event.slug)) malformed();
    if (
      (path.id && event.id !== path.id) ||
      (path.slug && event.slug !== path.slug)
    )
      malformed();
    if (
      id === "get_api_v1_admin_events_by_id" &&
      !uuid.test(string(event.version))
    )
      malformed();
    if (id === "get_api_v1_events_by_slug") {
      checkedQuestions(v.questions);
      if (!Array.isArray(v.assets)) malformed();
    }
    if (!instant(event.startsAt) || !instant(event.endsAt)) malformed();
    try {
      timeZone(string(event.timezoneId));
    } catch {
      malformed();
    }
  }
  if (
    op.method === "GET" &&
    path.id &&
    !op.path.includes("/events/{id}/") &&
    !op.path.includes("/opportunities/{id}/")
  ) {
    const entity = v.entry ? record(v.entry) : v;
    if (entity.id && entity.id !== path.id) malformed();
  }
  if (
    id === "get_api_v1_events_by_id_registration_my" &&
    (v.eventId !== path.id ||
      !uuid.test(string(v.id)) ||
      !uuid.test(string(v.version)))
  )
    malformed();
  if (
    id === "get_api_v1_events_by_id_attendance_qr_my" &&
    (v.eventId !== path.id ||
      typeof v.token !== "string" ||
      !v.token ||
      new TextEncoder().encode(v.token).length > 2000 ||
      !Number.isInteger(v.version))
  )
    malformed();
  if (
    id === "get_api_v1_certificates_verify_by_code" &&
    typeof v.valid !== "boolean"
  )
    malformed();
  if (id === "post_api_v1_attendance_scan" && !string(v.result)) malformed();
  if (
    (id === "post_api_v1_events_by_id_register" ||
      id === "post_api_v1_admin_events_by_id_registrations") &&
    !string(v.status)
  )
    malformed();
  if (op.method !== "GET") {
    if (id === "post_api_v1_admin_events_by_id_certificates_issue") {
      if (!Number.isInteger(v.queued) || Number(v.queued) < 0) malformed();
    } else if (
      id === "post_api_v1_admin_events_by_id_waitlist_promote_next" ||
      id ===
        "post_api_v1_admin_events_by_id_waitlist_by_entryId_override_promote"
    ) {
      if (!Number.isInteger(v.promoted) || Number(v.promoted) < 0) malformed();
    } else if (
      [
        "post_api_v1_opportunities_by_id_save",
        "delete_api_v1_opportunities_by_id_save",
        "put_api_v1_opportunities_by_id_reminder_preference",
      ].includes(id)
    ) {
      if (
        v.success !== true &&
        (!uuid.test(string(v.id)) || !uuid.test(string(v.version)))
      )
        malformed();
    } else if (!uuid.test(string(v.id)) || !uuid.test(string(v.version)))
      malformed();
  }
  if (op.method !== "GET" && "success" in v && v.success !== true) malformed();
  if ("version" in v && typeof v.version === "string" && !uuid.test(v.version))
    malformed();
  if (
    op.method !== "GET" &&
    "id" in v &&
    (!uuid.test(string(v.id)) || !uuid.test(string(v.version)))
  )
    malformed();
  return value;
}
export function engagementCommand(api: ApiClient) {
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
    const signature = JSON.stringify([owner, id, input], (key, v) =>
        key === "signal" || key === "idempotencyKey" ? undefined : v,
      ),
      key =
        string(record(input).idempotencyKey) ||
        keys.get(signature) ||
        createRecordId();
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
