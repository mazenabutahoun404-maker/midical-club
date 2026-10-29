import type { StudentApi } from "./student-api";
import { ApiError } from "./client";
import { record, array, string, number } from "./mapping";
/** Content-type vocabulary belongs to the server. Do not guess an enum from a UI card kind. */
export async function resolveLearningTarget(
  api: StudentApi,
  id: string,
  title: string,
  signal?: AbortSignal,
) {
  const matches = new Map<string, { contentType: string; contentId: string }>();
  for (let page = 1; page <= 20; page++) {
    const response = await api.get_api_v1_search({
        query: { Q: title, Page: page, PageSize: 100 },
        signal,
      }),
      envelope = record(response);
    const results = Array.isArray(response) ? response : envelope.results;
    if (!Array.isArray(results))
      throw new ApiError(
        "The search response is invalid.",
        502,
        "INVALID_RESPONSE",
      );
    for (const row of array(results).map(record))
      if (row.resourceId === id && string(row.resourceType))
        matches.set(string(row.resourceType), {
          contentType: string(row.resourceType),
          contentId: id,
        });
    if (
      Array.isArray(response) ||
      page * 100 >= number(envelope.total) ||
      results.length === 0
    )
      break;
    if (page === 20)
      throw new ApiError(
        "Narrow the search before saving this material.",
        422,
        "LIST_TOO_LARGE",
      );
  }
  if (matches.size !== 1)
    throw new ApiError(
      "This material has no unambiguous published learning target yet. Open Search to choose its published result.",
      422,
      "LEARNING_TARGET_UNAVAILABLE",
    );
  return [...matches.values()][0];
}

/** Server canonical routes must remain inside this app, including on a base-path deployment. */
export function canonicalPath(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^\/(?!\/)/.test(value) ||
    /[\\\u0000-\u0020]/.test(value)
  )
    return null;
  try {
    const u = new URL(value, "https://medclub.invalid");
    return u.origin === "https://medclub.invalid"
      ? u.pathname + u.search + u.hash
      : null;
  } catch {
    return null;
  }
}
