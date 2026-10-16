export type FooterBuilding =
  | "learning"
  | "media"
  | "community"
  | "mentorship"
  | "contribution"
  | "journals"
  | "campus";
const within = (path: string, root: string) =>
  path === root || path.startsWith(root + "/");
export function footerBuildingForPath(pathname: string): FooterBuilding {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (within(path, "/community/media")) return "media";
  if (within(path, "/journal")) return "journals";
  if (["/mentorship", "/my/mentorship"].some((root) => within(path, root)))
    return "mentorship";
  if (
    [
      "/contribute",
      "/my/contributions",
      "/recruitment",
      "/my/applications",
    ].some((root) => within(path, root))
  )
    return "contribution";
  if (
    [
      "/learn",
      "/utilities",
      "/my/learning",
      "/my/exams",
      "/my/study",
      "/my/progress",
      "/my/library",
      "/my/focus",
      "/search",
      "/my/search",
    ].some((root) => within(path, root))
  )
    return "learning";
  if (
    [
      "/community",
      "/events",
      "/opportunities",
      "/my/activities",
      "/my/events",
      "/my/opportunities",
      "/my/team",
      "/my/calendar",
      "/my/notifications",
    ].some((root) => within(path, root))
  )
    return "community";
  return "campus";
}
