export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string;
  sessionId: string;
}
const key = "medclub.api.session.v1";
export function isTokenPair(value: unknown): value is TokenPair {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<TokenPair>;
  return [v.accessToken, v.refreshToken, v.accessExpiresAt, v.sessionId].every(
    (x) => typeof x === "string" && x.length > 0,
  );
}
/** Tab-scoped sessions never read or migrate the preview's local accounts. */
export function createApiSession(storage: Storage | null = null) {
  let tokens: TokenPair | null = null;
  let revision = 0;
  const listeners = new Set<() => void>();
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(key) || "null");
    if (isTokenPair(parsed)) tokens = parsed;
  } catch {
    /* A blocked/corrupt store starts signed out. */
  }
  const write = (next: TokenPair | null) => {
    tokens = next;
    revision++;
    try {
      if (next) storage?.setItem(key, JSON.stringify(next));
      else storage?.removeItem(key);
    } catch {
      /* Continue in memory for this tab. */
    }
    listeners.forEach((listener) => listener());
  };
  return {
    get: () => tokens,
    revision: () => revision,
    set: (next: TokenPair) => {
      if (!isTokenPair(next)) throw new Error("INVALID_TOKEN_RESPONSE");
      write(next);
    },
    clear: () => write(null),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
export type ApiSession = ReturnType<typeof createApiSession>;
