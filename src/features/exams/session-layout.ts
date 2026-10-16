/** Only active learning sessions use the distraction-free shell. Results and browsing keep normal navigation. */
export function isExamSessionPath(path: string) {
  return /^\/(?:my\/exams|learn\/electronic-exams)\/(?:attempt\/[^/]+(?:\/recall)?|set\/[^/]+\/recall)\/?$/.test(path) || path === "/my/study/recall";
}
