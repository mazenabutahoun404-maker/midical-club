import { ApiError } from "./client";
import type { ApiClient } from "./client";
import type { Text } from "../../types/content";
export const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
export const string = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;
export const number = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
export const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];
export const text = (value: unknown): Text => {
  if (typeof value === "string") return { en: value, ar: value };
  const v = record(value),
    en = string(v.en || v.text),
    ar = string(v.ar || v.text);
  return { en: en || ar, ar: ar || en };
};
export const localized = (en: unknown, ar: unknown): Text => ({
  en: string(en) || string(ar),
  ar: string(ar) || string(en),
});
export const json = (value: unknown): Record<string, unknown> => {
  try {
    return record(typeof value === "string" ? JSON.parse(value) : value);
  } catch {
    return {};
  }
};
export const safeUrl = (value: unknown, base?: string) => {
  if (!string(value).trim()) return null;
  try {
    const url = new URL(string(value), base);
    return /^https?:$/.test(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0] || "")
    .join("")
    .toUpperCase();
export function requireId(value: unknown) {
  if (typeof value !== "string" || !value)
    throw new ApiError(
      "The server response is missing an identifier.",
      502,
      "INVALID_RESPONSE",
    );
  return value;
}
/** The retained UI consumes arrays. Follow the server's page envelope, never guess a cursor. */
export async function collectPages(
  load: (page: number) => Promise<unknown>,
  signal?: AbortSignal,
) {
  const result: Record<string, unknown>[] = [];
  for (let page = 1; page <= 100; page++) {
    signal?.throwIfAborted();
    const response = record(await load(page));
    if (!Array.isArray(response.items))
      throw new ApiError(
        "The server returned an invalid page.",
        502,
        "INVALID_RESPONSE",
      );
    result.push(...response.items.map(record));
    const totalPages = number(
      response.totalPages,
      Math.ceil(
        number(response.totalItems ?? response.total) /
          number(response.pageSize, 100),
      ),
    );
    if (page >= totalPages || response.items.length === 0) return result;
  }
  throw new ApiError(
    "This list requires a narrower filter.",
    422,
    "LIST_TOO_LARGE",
  );
}
export function assertOwner(api: ApiClient, owner: string | undefined) {
  if (api.session.get()?.sessionId !== owner)
    throw new ApiError("The session changed.", 401, "SESSION_CHANGED");
}
export function collectApiPages(
  api: ApiClient,
  load: (page: number) => Promise<unknown>,
) {
  const owner = api.session.get()?.sessionId;
  return collectPages(async (page) => {
    assertOwner(api, owner);
    const value = await load(page);
    assertOwner(api, owner);
    return value;
  });
}
export function notConnected(feature: string): never {
  throw new ApiError(
    `${feature} is not connected in this integration phase.`,
    503,
    "FEATURE_NOT_CONNECTED",
  );
}
export function unavailable<T extends object>(feature: string): T {
  return new Proxy({} as T, {
    get: (target, name, receiver) =>
      name in target
        ? Reflect.get(target, name, receiver)
        : name === "subscribe"
          ? () => () => {}
          : async () => notConnected(feature),
  });
}
