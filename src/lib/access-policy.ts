/** Guest locks mirror destinations whose live content requires a verified account.
 * Public catalogues remain browsable. Server permissions remain authoritative. */
export function needsSignIn(href: string, live = true): boolean {
  if (!/^\/(?!\/)/.test(href) || /[\\\u0000-\u0020]/.test(href)) return false;
  let path: string;
  try {
    path =
      new URL(href, "https://medclub.invalid").pathname
        .toLowerCase()
        .replace(/\/+$/, "") || "/";
  } catch {
    return false;
  }
  if (/^\/(?:my|admin)(?:\/|$)/.test(path)) return true;
  if (/^\/store\/(?:cart|checkout|orders)(?:\/|$)/.test(path)) return true;
  if (!live) return false;
  return (
    /^\/store(?:\/|$)/.test(path) ||
    /^\/learn\/courses\/[^/]+$/.test(path) ||
    /^\/learn\/basic-sciences\/batches\/[^/]+(?:\/(?:current|archive))?$/.test(
      path,
    ) ||
    /^\/learn\/clinical-sciences\/[^/]+$/.test(path) ||
    /^\/learn\/electronic-exams(?:\/|$)/.test(path) ||
    /^\/(?:opportunities|contribute|recruitment)(?:\/|$)/.test(path)
  );
}

export function academicBackPath(
  course: { track?: string; year?: number } | undefined,
  personal: boolean,
  from: unknown,
): string {
  if (
    typeof from === "string" &&
    /^\/(?!\/)/.test(from) &&
    !/[\\\u0000-\u0020]/.test(from)
  ) {
    const path = from.split(/[?#]/, 1)[0];
    if (
      /^\/learn(?:\/(?:basic-sciences(?:\/batches\/[^/]+(?:\/(?:current|archive))?)?|clinical-sciences(?:\/[^/]+)?))?\/?$/.test(
        path,
      ) ||
      /^\/my\/learning\/?$/.test(path)
    )
      return from;
  }
  if (personal) return "/my/learning";
  if (course?.track === "clinical") {
    const slug = (
      { 4: "fourth-year", 5: "fifth-year", 6: "sixth-year" } as Record<
        number,
        string
      >
    )[course.year || 0];
    return "/learn/clinical-sciences" + (slug ? "/" + slug : "");
  }
  return course ? "/learn/basic-sciences" : "/learn";
}
