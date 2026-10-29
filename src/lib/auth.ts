import { ApiError } from "../services/api/client";
export function authErrorMessage(
  error: unknown,
  locale: string,
  fallback: string,
) {
  if (!(error instanceof ApiError)) return fallback;
  if (error.code === "NETWORK_ERROR")
    return locale === "ar"
      ? "تعذّر الاتصال بالخادم. حاول مرة أخرى."
      : "Cannot reach the server. Please try again.";
  if (error.code === "API_TIMEOUT")
    return locale === "ar"
      ? "استغرق الخادم وقتاً طويلاً. حاول مرة أخرى."
      : "The server took too long to respond. Please try again.";
  if (error.status === 429)
    return locale === "ar"
      ? "طلبات كثيرة. انتظر قليلاً ثم حاول مجدداً."
      : "Too many attempts. Wait a moment before trying again.";
  const title =
    error.details && typeof error.details === "object"
      ? String((error.details as Record<string, unknown>).title || "")
      : "";
  if (/invalid.credentials/i.test(`${error.code} ${title}`))
    return locale === "ar"
      ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
      : "The email or password is incorrect.";
  if (error.status === 400 || error.status === 422) {
    const problem =
      error.details && typeof error.details === "object"
        ? (error.details as Record<string, unknown>)
        : {};
    const fields = problem.errors || problem.details;
    if (fields && typeof fields === "object" && !Array.isArray(fields)) {
      const messages = Object.entries(fields).flatMap(([field, value]) =>
        (Array.isArray(value) ? value : [value])
          .filter((x) => typeof x === "string")
          .map((message) => `${field}: ${message}`),
      );
      if (messages.length) return messages.slice(0, 3).join(" · ");
    }
  }
  return error.message || fallback;
}
export function safeReturnTo(value: string | null, fallback = "/my") {
  if (!value || !value.startsWith("/") || value.startsWith("//"))
    return fallback;
  try {
    const parsed = new URL(value, "https://medclub.local");
    return parsed.origin === "https://medclub.local"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}

export function authErrorKey(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const keys = {
    "invalid-credentials": "invalidCredentials",
    "email-in-use": "emailInUse",
    "university-number-invalid": "universityNumberInvalid",
    "invalid-code": "invalidCode",
    "verification-missing": "verificationMissing",
  } as const;
  return keys[message as keyof typeof keys] || "authUnexpected";
}
