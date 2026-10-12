import { StudyError } from "../../types/study-hub";
type Obj = Record<string, unknown>;
function object(value: unknown): Obj {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new StudyError("INVALID", 502);
  return value as Obj;
}
function string(o: Obj, key: string) {
  if (typeof o[key] !== "string") throw new StudyError("INVALID", 502);
}
function version(o: Obj) {
  string(o, "id");
  string(o, "updatedAt");
  if (!Number.isInteger(o.version) || Number(o.version) < 1)
    throw new StudyError("INVALID", 502);
}
function pageAnchor(value: unknown) {
  const a = object(value);
  string(a, "resourceId");
  string(a, "resourceRevision");
  if (!Number.isInteger(a.page) || Number(a.page) < 1)
    throw new StudyError("INVALID", 502);
  for (const k of ["x", "y"])
    if (
      typeof a[k] !== "number" ||
      !Number.isFinite(a[k]) ||
      Number(a[k]) < 0 ||
      Number(a[k]) > 1
    )
      throw new StudyError("INVALID", 502);
}
export type ResponseKind =
  | "margin"
  | "recall"
  | "review"
  | "claim"
  | "room"
  | "share"
  | "portfolio"
  | "manifest"
  | "resource";
export function assertStudyResponse(kind: ResponseKind, value: unknown) {
  const o = object(value);
  if (["margin", "recall", "claim", "room"].includes(kind)) version(o);
  if (kind === "margin") {
    string(o, "ownerId");
    string(o, "courseId");
    string(o, "body");
    pageAnchor(o.anchor);
    if (!["amber", "mint", "rose"].includes(String(o.color)))
      throw new StudyError("INVALID", 502);
  }
  if (kind === "recall") {
    for (const k of ["ownerId", "courseId", "prompt", "answer", "dueAt"])
      string(o, k);
    if (
      !Number.isFinite(Date.parse(String(o.dueAt))) ||
      !Number.isInteger(o.reviews) ||
      !Number.isInteger(o.intervalDays)
    )
      throw new StudyError("INVALID", 502);
    if (o.source) pageAnchor(o.source);
  }
  if (kind === "review") {
    for (const k of ["id", "cardId", "grade", "reviewedAt", "nextDueAt"])
      string(o, k);
    if (!["again", "hard", "good", "easy"].includes(String(o.grade)))
      throw new StudyError("INVALID", 502);
  }
  if (kind === "claim") {
    for (const k of [
      "ownerId",
      "kind",
      "title",
      "description",
      "occurredAt",
      "evidenceUrl",
    ])
      string(o, k);
    if (
      !["draft", "pending", "verified", "rejected", "revoked"].includes(
        String(o.status),
      )
    )
      throw new StudyError("INVALID", 502);
    if (o.status === "verified" && !o.review)
      throw new StudyError("INVALID", 502);
  }
  if (kind === "room") {
    for (const k of ["hostId", "title", "inviteCode", "phase"]) string(o, k);
    if (
      !Array.isArray(o.members) ||
      !Number.isInteger(o.capacity) ||
      !["waiting", "focus", "rest", "finished"].includes(String(o.phase)) ||
      !Number.isInteger(o.focusMinutes) ||
      !Number.isInteger(o.restMinutes)
    )
      throw new StudyError("INVALID", 502);
    for (const m of o.members) {
      const r = object(m);
      for (const k of [
        "userId",
        "displayName",
        "goal",
        "joinedAt",
        "lastSeenAt",
      ])
        string(r, k);
    }
    if (
      o.endsAt !== null &&
      (typeof o.endsAt !== "string" || !Number.isFinite(Date.parse(o.endsAt)))
    )
      throw new StudyError("INVALID", 502);
  }
  if (kind === "share") {
    if (
      typeof o.enabled !== "boolean" ||
      (o.token !== null && typeof o.token !== "string")
    )
      throw new StudyError("INVALID", 502);
    string(o, "displayName");
    string(o, "updatedAt");
  }
  if (kind === "portfolio") {
    string(o, "displayName");
    string(o, "updatedAt");
    if (
      !["api", "device-preview"].includes(String(o.source)) ||
      !Array.isArray(o.claims)
    )
      throw new StudyError("INVALID", 502);
    for (const c of o.claims) {
      const r = object(c);
      for (const k of [
        "id",
        "title",
        "description",
        "kind",
        "occurredAt",
        "verifiedAt",
      ])
        string(r, k);
      if (r.status !== "verified" || "ownerId" in r || "evidenceUrl" in r)
        throw new StudyError("INVALID", 502);
    }
  }
  if (kind === "resource") {
    for (const k of [
      "id",
      "courseId",
      "updatedAt",
      "fileUrl",
      "personalFileOwnerId",
    ])
      string(o, k);
    object(o.title);
    if (o.mediaType !== "pdf" || !String(o.fileUrl).startsWith("https://"))
      throw new StudyError("INVALID", 502);
  }
  if (kind === "manifest") {
    string(o, "id");
    string(o, "revision");
    string(o, "expiresAt");
    if (!Number.isFinite(Date.parse(String(o.expiresAt))))
      throw new StudyError("INVALID", 502);
    const c = object(o.course);
    string(c, "id");
    string(c, "slug");
    object(c.title);
    if (!Array.isArray(o.resources) || typeof o.allowedOffline !== "boolean")
      throw new StudyError("INVALID", 502);
    for (const r of o.resources) {
      const f = object(r);
      for (const k of ["id", "courseId", "updatedAt"]) string(f, k);
      object(f.title);
      if (f.fileUrl !== null && typeof f.fileUrl !== "string")
        throw new StudyError("INVALID", 502);
    }
  }
  return value;
}
