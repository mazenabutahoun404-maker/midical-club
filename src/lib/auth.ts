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
