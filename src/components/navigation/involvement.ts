import type { SiteContent } from "../../types/content";
export const involvementItems = [
  { id: "events", href: "/events", label: { en: "Events", ar: "الفعاليات" } },
  {
    id: "opportunities",
    href: "/opportunities",
    label: { en: "Opportunities", ar: "الفرص" },
  },
  {
    id: "contributions",
    href: "/contribute",
    label: { en: "Contribute", ar: "ساهم" },
  },
];
export const involvedLabel = { en: "Get involved", ar: "شارك" };
export const isInvolvementPath = (path: string) =>
  path === "/get-involved" ||
  involvementItems.some(
    ({ href }) => path === href || path.startsWith(href + "/"),
  );
const key = "medclub:navigation:involvement:v1";
export function lastInvolvementPath() {
  try {
    const value = localStorage.getItem(key);
    return (
      involvementItems.find((item) => item.href === value)?.href || "/events"
    );
  } catch {
    return "/events";
  }
}
export function rememberInvolvement(path: string) {
  const item = involvementItems.find(
    (item) => path === item.href || path.startsWith(item.href + "/"),
  );
  if (item)
    try {
      localStorage.setItem(key, item.href);
    } catch {
      /* Storage is optional. */
    }
}
// Group at presentation time, including locally edited site navigation. Existing URLs survive.
export function publicMainItems(site: SiteContent) {
  const rest = site.navigation.main.filter(
    (item) => !isInvolvementPath(item.href),
  );
  const storeIndex = rest.findIndex((item) => item.id === "store");
  rest.splice(storeIndex < 0 ? rest.length : storeIndex, 0, {
    id: "get-involved",
    href: "/get-involved",
    label: involvedLabel,
  });
  return rest;
}
