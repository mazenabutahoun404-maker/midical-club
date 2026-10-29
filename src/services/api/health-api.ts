import { ApiError, type ApiClient } from "./client";

export type HealthResponse = { status?: string; [key: string]: unknown };

/** Swagger allows an object with an optional status, not a fabricated default. */
function healthResponse(value: unknown): HealthResponse {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    value instanceof Blob ||
    ("status" in value && typeof value.status !== "string")
  )
    throw new ApiError(
      "The health check returned an invalid response.",
      502,
      "INVALID_RESPONSE",
    );
  return value as HealthResponse;
}

export function createHttpHealthApi(api: ApiClient) {
  return {
    startup: async (signal?: AbortSignal) =>
      healthResponse(await api.call("get_health_startup", { signal })),
    live: async (signal?: AbortSignal) =>
      healthResponse(await api.call("get_health_live", { signal })),
    ready: async (signal?: AbortSignal) =>
      healthResponse(await api.call("get_health_ready", { signal })),
  };
}

export type HealthApi = ReturnType<typeof createHttpHealthApi>;
