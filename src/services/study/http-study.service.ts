import { assertStudyResponse, type ResponseKind } from "./response-contract";
import { StudyError, type StudyHubService } from "../../types/study-hub";
/** Proposed resource contract. Supply an endpoint mapper for the existing backend. Never put tokens into localStorage. */
export interface StudyHttpOptions {
  baseUrl: string;
  fetch?: typeof fetch;
  token?: () => Promise<string | null>;
  mapPath?: (path: string) => string;
  onUnauthorized?: () => void;
  credentials?: RequestCredentials;
  csrfToken?: () => Promise<string | null>;
  encodeRequest?: (path: string, body: unknown) => unknown;
  decodeResponse?: (path: string, payload: unknown) => unknown;
}
export function createHttpStudyService(
  options: StudyHttpOptions,
): StudyHubService {
  const transport = options.fetch || fetch;
  async function request<T>(
    path: string,
    method = "GET",
    body?: unknown,
    version?: number,
    signal?: AbortSignal,
    requestId?: string,
    kind?: ResponseKind,
  ): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    const multipart = body instanceof FormData;
    if (body !== undefined && !multipart)
      headers["Content-Type"] = "application/json";
    if (method !== "GET") {
      const csrf = await options.csrfToken?.();
      if (csrf) headers["X-CSRF-Token"] = csrf;
    }
    if (version !== undefined) headers["If-Match"] = `"${version}"`;
    if (requestId) headers["Idempotency-Key"] = requestId;
    const token = await options.token?.();
    if (token) headers.Authorization = `Bearer ${token}`;
    let response: Response;
    try {
      response = await transport(
        options.baseUrl.replace(/\/$/, "") + (options.mapPath?.(path) || path),
        {
          method,
          headers,
          body:
            body === undefined
              ? undefined
              : multipart
                ? (body as FormData)
                : JSON.stringify(options.encodeRequest?.(path, body) ?? body),
          credentials: options.credentials || "same-origin",
          signal,
        },
      );
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new StudyError("NETWORK", 0);
    }
    if (!response.ok) {
      if (response.status === 401) options.onUnauthorized?.();
      const code =
        response.status === 401
          ? "UNAUTHORIZED"
          : response.status === 403
            ? "FORBIDDEN"
            : response.status === 404
              ? "NOT_FOUND"
              : response.status === 409 || response.status === 412
                ? "CONFLICT"
                : response.status === 410
                  ? "EXPIRED"
                  : response.status === 507
                    ? "STORAGE"
                    : response.status >= 500 || response.status === 429
                      ? "NETWORK"
                      : "INVALID";
      throw new StudyError(code, response.status);
    }
    if (response.status === 204) return undefined as T;
    let raw: unknown;
    try {
      raw = await response.json();
    } catch {
      throw new StudyError("INVALID", 502);
    }
    const payload = options.decodeResponse?.(path, raw) ?? raw;
    // Our proposed API returns the resource itself, not a guessed envelope.
    if (payload === null || typeof payload !== "object")
      throw new StudyError("INVALID", 502);
    if (kind) assertStudyResponse(kind, payload);
    return payload as T;
  }
  async function list<T>(
    path: string,
    kind: ResponseKind,
    signal?: AbortSignal,
  ): Promise<T[]> {
    const items: T[] = [];
    const cursors = new Set<string>();
    let cursor: string | null = null;
    for (let n = 0; n < 50; n++) {
      const page: { items: unknown[]; nextCursor: string | null } =
        await request<{
          items: unknown[];
          nextCursor: string | null;
        }>(
          path +
            (path.includes("?") ? "&" : "?") +
            "limit=100" +
            (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""),
          "GET",
          undefined,
          undefined,
          signal,
        );
      if (
        !Array.isArray(page.items) ||
        page.items.length > 100 ||
        (page.nextCursor !== null && typeof page.nextCursor !== "string")
      )
        throw new StudyError("INVALID", 502);
      for (const item of page.items) {
        assertStudyResponse(kind, item);
        items.push(item as T);
      }
      if (!page.nextCursor) return items;
      if (cursors.has(page.nextCursor) || page.nextCursor.length > 2000)
        throw new StudyError("INVALID", 502);
      cursor = page.nextCursor;
      cursors.add(page.nextCursor);
    }
    throw new StudyError("CAPACITY", 413);
  }
  const id = encodeURIComponent;
  return {
    source: "api",
    uploadPrivatePdf: (courseId, file, c) => {
      const form = new FormData();
      form.set("courseId", courseId);
      form.set("file", file);
      return request(
        "/me/study-files",
        "POST",
        form,
        undefined,
        c?.signal,
        undefined,
        "resource",
      );
    },
    listMargins: (resource, c) =>
      list(`/me/margin-notes${resource ? `?resourceId=${id(resource)}` : ""}`, "margin", c?.signal),
    saveMargin: (input, e) =>
      request(
        e ? `/me/margin-notes/${id(e.id)}` : "/me/margin-notes",
        e ? "PATCH" : "POST",
        input,
        e?.version,
        undefined,
        undefined,
        "margin",
      ),
    deleteMargin: (i, v) =>
      request(`/me/margin-notes/${id(i)}`, "DELETE", undefined, v),
    restoreMargin: (n) =>
      request(
        `/me/margin-notes/${id(n.id)}/restore`,
        "POST",
        { tombstoneVersion: n.version },
        n.version,
        undefined,
        undefined,
        "margin",
      ),
    listRecall: (course, c) =>
      list(
        "/me/recall-cards" + (course ? `?courseId=${id(course)}` : ""),
        "recall",
        c?.signal,
      ),
    saveRecall: (input, e) =>
      request(
        e ? `/me/recall-cards/${id(e.id)}` : "/me/recall-cards",
        e ? "PATCH" : "POST",
        input,
        e?.version,
        undefined,
        undefined,
        "recall",
      ),
    deleteRecall: (i, v) =>
      request(`/me/recall-cards/${id(i)}`, "DELETE", undefined, v),
    restoreRecall: (r) =>
      request(
        `/me/recall-cards/${id(r.id)}/restore`,
        "POST",
        { tombstoneVersion: r.version },
        r.version,
        undefined,
        undefined,
        "recall",
      ),
    reviewRecall: (i, v, grade, key) =>
      request(
        `/me/recall-cards/${id(i)}/reviews`,
        "POST",
        { grade },
        v,
        undefined,
        key,
        "recall",
      ),
    listReviews: (c) => list("/me/recall-reviews", "review", c?.signal),
    packManifest: (course, c) =>
      request(
        `/courses/${id(course)}/offline-manifest`,
        "GET",
        undefined,
        undefined,
        c?.signal,
        undefined,
        "manifest",
      ),
    listClaims: (c) => list("/me/portfolio/claims", "claim", c?.signal),
    saveClaim: (input, e) =>
      request(
        e ? `/me/portfolio/claims/${id(e.id)}` : "/me/portfolio/claims",
        e ? "PATCH" : "POST",
        input,
        e?.version,
        undefined,
        undefined,
        "claim",
      ),
    deleteClaim: (i, v) =>
      request(`/me/portfolio/claims/${id(i)}`, "DELETE", undefined, v),
    restoreClaim: (r) =>
      request(
        `/me/portfolio/claims/${id(r.id)}/restore`,
        "POST",
        { tombstoneVersion: r.version },
        r.version,
        undefined,
        undefined,
        "claim",
      ),
    submitClaim: (i, v) =>
      request(
        `/me/portfolio/claims/${id(i)}/submit`,
        "POST",
        {},
        v,
        undefined,
        undefined,
        "claim",
      ),
    reviewQueue: (c) => list("/portfolio/review-queue", "claim", c?.signal),
    reviewClaim: (i, v, decision, note) =>
      request(
        `/portfolio/claims/${id(i)}/review`,
        "POST",
        { decision, note },
        v,
        undefined,
        undefined,
        "claim",
      ),
    revokeClaim: (i, v, note) =>
      request(
        `/portfolio/claims/${id(i)}/revoke`,
        "POST",
        { note },
        v,
        undefined,
        undefined,
        "claim",
      ),
    getShare: (c) =>
      request(
        "/me/portfolio/share",
        "GET",
        undefined,
        undefined,
        c?.signal,
        undefined,
        "share",
      ),
    setShare: (enabled) =>
      request(
        "/me/portfolio/share",
        "PUT",
        { enabled },
        undefined,
        undefined,
        undefined,
        "share",
      ),
    sharedPortfolio: (token, c) =>
      request(
        `/portfolios/${id(token)}`,
        "GET",
        undefined,
        undefined,
        c?.signal,
        undefined,
        "portfolio",
      ),
    listRooms: (c) => list("/me/quiet-rooms", "room", c?.signal),
    createRoom: (input) =>
      request(
        "/quiet-rooms",
        "POST",
        input,
        undefined,
        undefined,
        undefined,
        "room",
      ),
    joinRoom: (code, goal) =>
      request(
        "/quiet-rooms/join",
        "POST",
        { code, goal },
        undefined,
        undefined,
        undefined,
        "room",
      ),
    getRoom: (i, c) =>
      request(
        `/quiet-rooms/${id(i)}`,
        "GET",
        undefined,
        undefined,
        c?.signal,
        undefined,
        "room",
      ),
    heartbeatRoom: (i) =>
      request(
        `/quiet-rooms/${id(i)}/presence`,
        "PUT",
        {},
        undefined,
        undefined,
        undefined,
        "room",
      ),
    leaveRoom: (i) => request(`/quiet-rooms/${id(i)}/members/me`, "DELETE"),
    advanceRoom: (i, v, action) =>
      request(
        `/quiet-rooms/${id(i)}/timer`,
        "POST",
        { action },
        v,
        undefined,
        undefined,
        "room",
      ),
  };
}
