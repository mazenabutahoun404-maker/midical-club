export const routes = {
  home: "/",
  learn: "/learn",
  basic: "/learn/basic-sciences",
  clinical: "/learn/clinical-sciences",
  personal: "/my",
  profile: "/my/profile",
  learning: "/my/learning",
  progress: "/my/progress",
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
  mentorship: "/mentorship",
  mentorshipSessions: "/mentorship/sessions",
  mentorshipQuestions: "/mentorship/qa",
  contributions: "/contribute",
  recruitment: "/recruitment",
  myEvents: "/my/events",
  myOpportunities: "/my/opportunities",
  myMentorship: "/my/mentorship",
  myContributions: "/my/contributions",
  cart: "/store/cart",
  myOrders: "/my/orders",
  myApplications: "/my/applications",
  myTeam: "/my/team",
  signIn: "/auth/sign-in",
  register: "/auth/register",
  verify: "/auth/verify",
  recover: "/auth/recover",
  admin: "/admin",
  adminContent: "/admin/content",
  adminActivity: "/admin/activity",
  adminVersions: "/admin/versions",
  adminBuilder: "/admin/builder",
  adminGovernance: "/admin/governance",
  adminUsers: "/admin/users",
  adminRoles: "/admin/roles",
  adminApprovals: "/admin/approvals",
  adminAnalytics: "/admin/analytics",
  adminContentHealth: "/admin/content-health",
} as const;
export const eventPath = (slug: string) =>
  `/events/${encodeURIComponent(slug)}`;
export const opportunityPath = (slug: string) =>
  `/opportunities/${encodeURIComponent(slug)}`;
export const articlePath = (slug: string) =>
  `/journal/${encodeURIComponent(slug)}`;
export const mentorPath = (slug: string) =>
  `/mentorship?mentor=${encodeURIComponent(slug)}`;
export const productPath = (slug: string) =>
  `/store/products/${encodeURIComponent(slug)}`;
export const positionPath = (slug: string) =>
  `/recruitment/${encodeURIComponent(slug)}`;
export const builderPath = (pageId: string) =>
  `/admin/builder/${encodeURIComponent(pageId)}`;
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
export const isAdminPath = (path: string) =>
  path === "/admin" || path.startsWith("/admin/");
export const personalCoursePath = (slug: string) =>
  `/my/learning/${encodeURIComponent(slug)}`;
export const signInPath = (returnTo = "/my") =>
  `${routes.signIn}?returnTo=${encodeURIComponent(returnTo)}`;
