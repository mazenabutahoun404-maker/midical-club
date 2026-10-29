import { apiOperations, type OperationId } from "./operations.generated";
import type { Operations } from "./schema.generated";
import type { ApiSession } from "./session";
import { isTokenPair } from "./session";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status = 0,
    public readonly code = "API_ERROR",
    public readonly details: unknown = null,
    public readonly correlationId: string | null = null,
    public readonly retryAfter: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export function requiresRecentAuthentication(error: unknown) {
  if (!(error instanceof ApiError) || ![401, 403].includes(error.status))
    return false;
  const title =
    error.details && typeof error.details === "object"
      ? String((error.details as Record<string, unknown>).title || "")
      : "";
  return /recent|reauth|re.auth|step.up|password.auth/i.test(
    `${error.code} ${title} ${error.message}`,
  );
}
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
type Part<K extends string, T> =
  RequiredKeys<T> extends never ? { [P in K]?: T } : { [P in K]: T };
export type ApiInput<K extends OperationId> = Part<
  "path",
  Operations[K]["path"]
> &
  Part<"query", Operations[K]["query"]> & {
    headers?: Partial<Operations[K]["headers"]>;
    signal?: AbortSignal;
    idempotencyKey?: string;
  } & (Operations[K]["body"] extends never
    ? { body?: never }
    : { body: Operations[K]["body"] });
type Args<K extends OperationId> =
  {} extends ApiInput<K> ? [input?: ApiInput<K>] : [input: ApiInput<K>];
type LooseInput = {
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  body?: unknown;
  signal?: AbortSignal;
  idempotencyKey?: string;
};

export function createApiClient(options: {
  baseUrl: string;
  session: ApiSession;
  fetch?: typeof fetch;
  timeoutMs?: number;
}) {
  const origin = new URL(options.baseUrl);
  if (!/^https?:$/.test(origin.protocol)) throw new Error("INVALID_API_ORIGIN");
  const base = origin.href.replace(/\/$/, "");
  const fetcher = options.fetch || globalThis.fetch.bind(globalThis);
  let refreshing: Promise<void> | null = null;

  async function exchange(
    id: OperationId,
    input: LooseInput,
    token?: string,
    key?: string,
  ) {
    const operation = apiOperations[id];
    const path = operation.path.replace(/\{([^}]+)\}/g, (_, name: string) => {
      const value = input.path?.[name];
      if (value === undefined || value === null || value === "")
        throw new ApiError(
          `Missing route parameter: ${name}`,
          0,
          "MISSING_PATH_PARAMETER",
        );
      return encodeURIComponent(String(value));
    });
    const url = new URL(base + path);
    for (const [name, value] of Object.entries(input.query || {})) {
      if (value === undefined || value === null) continue;
      for (const item of Array.isArray(value) ? value : [value])
        url.searchParams.append(name, String(item));
    }
    const headers = new Headers({ Accept: operation.accept });
    for (const [name, value] of Object.entries(input.headers || {}))
      if (value !== undefined && value !== null)
        headers.set(name, String(value));
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (key) headers.set("Idempotency-Key", key);
    let body: BodyInit | undefined;
    if (input.body !== undefined) {
      if (operation.multipart) {
        const form = new FormData();
        for (const [name, value] of Object.entries(
          input.body as Record<string, unknown>,
        )) {
          if (value === undefined || value === null) continue;
          form.append(name, value instanceof Blob ? value : String(value));
        }
        body = form;
      } else {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(input.body);
      }
    }
    const controller = new AbortController();
    const abort = () => controller.abort(input.signal?.reason);
    if (input.signal?.aborted) abort();
    else input.signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(
      () => controller.abort(new Error("API_TIMEOUT")),
      options.timeoutMs ?? 25000,
    );
    let response: Response;
    try {
      response = await fetcher(url, {
        method: operation.method,
        headers,
        body,
        signal: controller.signal,
        credentials: "omit",
        redirect: "error",
        cache: "no-store",
      });
      const type = response.headers.get("Content-Type") || "";
      let result: unknown;
      if (response.status === 204 || response.status === 205)
        result = undefined;
      else if (type.includes("json")) {
        const text = await response.text();
        try {
          result = text ? JSON.parse(text) : undefined;
        } catch {
          throw new ApiError(
            "The server returned invalid JSON.",
            response.status,
            "INVALID_RESPONSE",
          );
        }
      } else if (type.startsWith("text/")) result = await response.text();
      else result = await response.blob();
      if (!response.ok) {
        const problem =
          result && typeof result === "object"
            ? (result as Record<string, unknown>)
            : {};
        throw new ApiError(
          String(
            problem.detail ||
              problem.message ||
              problem.title ||
              `Request failed (${response.status}).`,
          ),
          response.status,
          String(
            problem.code ||
              problem.errorCode ||
              (response.status === 401 ? "UNAUTHORIZED" : "HTTP_ERROR"),
          ),
          result,
          response.headers.get("X-Correlation-ID") ||
            (typeof problem.traceId === "string" ? problem.traceId : null),
          response.headers.get("Retry-After"),
        );
      }
      return result;
    } catch (error) {
      if (input.signal?.aborted || error instanceof ApiError) throw error;
      throw new ApiError(
        controller.signal.aborted
          ? "The server took too long to respond."
          : "Cannot reach the API. Check the connection or the server's allowed frontend origins.",
        0,
        controller.signal.aborted ? "API_TIMEOUT" : "NETWORK_ERROR",
      );
    } finally {
      clearTimeout(timer);
      input.signal?.removeEventListener("abort", abort);
    }
  }
  async function refresh() {
    if (refreshing) return refreshing;
    const pair = options.session.get();
    const revision = options.session.revision();
    if (!pair) throw new ApiError("Sign in to continue.", 401, "UNAUTHORIZED");
    refreshing = (async () => {
      try {
        const result = await exchange("post_api_v1_auth_refresh", {
          body: { refreshToken: pair.refreshToken },
        });
        if (options.session.revision() !== revision)
          throw new ApiError("The session changed.", 401, "SESSION_CHANGED");
        if (!isTokenPair(result))
          throw new ApiError(
            "The refresh response is incomplete.",
            502,
            "INVALID_RESPONSE",
          );
        options.session.set(result);
      } catch (error) {
        if (
          options.session.revision() === revision &&
          error instanceof ApiError &&
          (error.status === 400 || error.status === 401 || error.status === 403)
        )
          options.session.clear();
        throw error;
      } finally {
        refreshing = null;
      }
    })();
    return refreshing;
  }
  async function call<K extends OperationId>(
    id: K,
    ...args: Args<K>
  ): Promise<Operations[K]["response"]> {
    const input = (args[0] || {}) as LooseInput;
    input.signal?.throwIfAborted();
    const operation = apiOperations[id];
    const key =
      input.idempotencyKey ||
      (operation.idempotencyRequired ? crypto.randomUUID() : undefined);
    let pair = options.session.get();
    // Infrastructure probes must still work when a user's token has expired.
    const healthProbe =
      id === "get_health_startup" ||
      id === "get_health_live" ||
      id === "get_health_ready";
    const carriesSession =
      !healthProbe &&
      (operation.auth || (!!pair && !id.startsWith("post_api_v1_auth_")));
    if (operation.auth && !pair)
      throw new ApiError("Sign in to continue.", 401, "UNAUTHORIZED");
    if (
      pair &&
      carriesSession &&
      Date.parse(pair.accessExpiresAt) < Date.now() + 15000
    ) {
      await refresh();
      pair = options.session.get();
    }
    const revision = options.session.revision();
    const token = pair?.accessToken;
    const sessionId = pair?.sessionId;
    try {
      const result = await exchange(
        id,
        input,
        carriesSession ? pair?.accessToken : undefined,
        key,
      );
      if (carriesSession && options.session.get()?.sessionId !== sessionId)
        throw new ApiError("The session changed.", 401, "SESSION_CHANGED");
      return result as Operations[K]["response"];
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        error.status !== 401 ||
        error.code === "SESSION_CHANGED" ||
        requiresRecentAuthentication(error) ||
        !carriesSession ||
        id === "post_api_v1_auth_logout"
      )
        throw error;
      if (options.session.get()?.sessionId !== sessionId)
        throw new ApiError("The session changed.", 401, "SESSION_CHANGED");
      if (
        options.session.revision() !== revision &&
        options.session.get()?.accessToken === token
      )
        throw error;
      if (!options.session.get()) throw error;
      if (options.session.get()?.accessToken === token) await refresh();
      if (options.session.get()?.sessionId !== sessionId)
        throw new ApiError("The session changed.", 401, "SESSION_CHANGED");
      const result = await exchange(
        id,
        input,
        options.session.get()?.accessToken,
        key,
      );
      if (options.session.get()?.sessionId !== sessionId)
        throw new ApiError("The session changed.", 401, "SESSION_CHANGED");
      return result as Operations[K]["response"];
    }
  }
  return { call, session: options.session, baseUrl: base };
}
export type ApiClient = ReturnType<typeof createApiClient>;
