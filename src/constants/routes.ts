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
} as const;
export const coursePath = (slug: string) =>
  `/learn/courses/${encodeURIComponent(slug)}`;

export const isPersonalPath = (path: string) =>
  path === "/my" || path.startsWith("/my/");
export const personalCoursePath = (slug: string) =>
  `/my/learning/${encodeURIComponent(slug)}`;
