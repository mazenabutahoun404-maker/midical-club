import type { MessageKey } from "../../constants/messages";

export const personalActivityItems = [
  { href: "/my/events", label: "myEvents" },
  { href: "/my/opportunities", label: "myOpportunities" },
  { href: "/my/contributions", label: "myContributions" },
] satisfies { href: string; label: MessageKey }[];

export function isPersonalActivityPath(path: string) {
  return (
    path === "/my/activities" ||
    personalActivityItems.some(
      ({ href }) => path === href || path.startsWith(href + "/"),
    )
  );
}
