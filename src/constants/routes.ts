export const routes = {
  home: "/",
  learn: "/learn",
  basic: "/learn/basic-sciences",
  clinical: "/learn/clinical-sciences",
  personal: "/my",
  profile: "/my/profile",
  learning: "/my/learning",
  library: "/my/library",
  focus: "/my/focus",
  settings: "/my/settings",
  utilities: "/utilities",
  exams: "/learn/electronic-exams",
  store: "/store",
  events: "/events",
  opportunities: "/opportunities",
  community: "/community",
  activities: "/community/activities",
  media: "/community/media",
  executiveBodies: "/community/executive-bodies",
  honorPlate: "/community/honor-plate",
  hallOfHonor: "/community/hall-of-honor",
  about: "/community/about",
  journal: "/journal",
  myEvents: "/my/events",
  myOpportunities: "/my/opportunities",
} as const;
export const eventPath = (slug: string) =>
  `/events/${encodeURIComponent(slug)}`;
export const opportunityPath = (slug: string) =>
  `/opportunities/${encodeURIComponent(slug)}`;
export const articlePath = (slug: string) =>
  `/journal/${encodeURIComponent(slug)}`;
export const batchPath = (
  slug: string,
  view: "current" | "archive" = "current",
) => `/learn/basic-sciences/batches/${encodeURIComponent(slug)}/${view}`;
export const clinicalYearPath = (slug: string) =>
  `/learn/clinical-sciences/${encodeURIComponent(slug)}`;
export const coursePath = (slug: string) =>
  `/learn/courses/${encodeURIComponent(slug)}`;

export const isPersonalPath = (path: string) =>
  path === "/my" || path.startsWith("/my/");
export const personalCoursePath = (slug: string) =>
  `/my/learning/${encodeURIComponent(slug)}`;
