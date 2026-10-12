export interface NotificationArrivalState {
  accountId: string;
  seen: ReadonlySet<string>;
}

/** Baseline the first successful load; only previously unseen IDs count as arrivals. */
export function noticeNotificationArrival(
  previous: NotificationArrivalState | null,
  accountId: string | null,
  ids: readonly string[],
  ready: boolean,
): { state: NotificationArrivalState | null; arrived: boolean } {
  if (!accountId) return { state: null, arrived: false };
  const sameAccount = previous?.accountId === accountId;
  if (!ready)
    return { state: sameAccount ? previous : null, arrived: false };
  if (!sameAccount || !previous)
    return { state: { accountId, seen: new Set(ids) }, arrived: false };
  const arrived = ids.some((id) => !previous.seen.has(id));
  return {
    state: { accountId, seen: new Set([...previous.seen, ...ids]) },
    arrived,
  };
}

export function animateNotificationArrival(icon: HTMLElement | SVGSVGElement | null): Animation | null {
  return animateNotificationBell(icon, "arrival");
}

/** Explicit pointer/click feedback also works when a theme overrides CSS animations. */
export function animateNotificationBell(
  icon: HTMLElement | SVGSVGElement | null,
  action: "hover" | "click" | "arrival",
): Animation | null {
  if (!icon || typeof icon.animate !== "function") return null;
  const angle = action === "click" ? 24 : action === "hover" ? 18 : 7;
  const duration = action === "click" ? 500 : action === "hover" ? 420 : 420;
  try {
    return icon.animate([
      { transform: "rotate(0deg)", offset: 0 },
      { transform: `rotate(${angle}deg)`, offset: 0.25 },
      { transform: `rotate(-${Math.round(angle * 0.7)}deg)`, offset: 0.55 },
      { transform: `rotate(${Math.round(angle * 0.3)}deg)`, offset: 0.8 },
      { transform: "rotate(0deg)", offset: 1 },
    ], { duration, easing: "ease-out" });
  } catch {
    return null;
  }
}
