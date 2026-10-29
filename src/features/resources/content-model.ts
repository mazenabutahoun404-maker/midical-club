import { record, array, string } from "../../services/api/mapping";
export function contentValue(value: unknown, locale: string): string {
  if (typeof value === "string") return value;
  const v = record(value);
  return string(v.text ?? v[locale] ?? v.en ?? v.ar);
}
export function configValue(config: unknown, ...names: string[]): unknown {
  const c = record(config);
  for (const name of names) {
    const key = Object.keys(c).find(
      (k) => k.toLowerCase() === name.toLowerCase(),
    );
    if (key !== undefined) return c[key];
  }
}
export function contentLink(value: unknown): string | null {
  if (typeof value !== "string" || /[\\\u0000-\u0020]/.test(value)) return null;
  if (/^\/(?!\/)/.test(value)) return value;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export function trustedEmbed(value: unknown): string | null {
  const link = contentLink(value);
  if (!link || link.startsWith("/")) return null;
  const u = new URL(link),
    h = u.hostname.toLowerCase();
  if (u.port && u.port !== "443") return null;
  if (
    ["www.canva.com", "canva.com"].includes(h) &&
    /^\/design\/[\w-]+\/[\w-]+\/view\/?$/.test(u.pathname)
  ) {
    u.hostname = "www.canva.com";
    u.search = "embed";
    u.hash = "";
    return u.href;
  }
  if (
    [
      "www.youtube.com",
      "youtube.com",
      "youtu.be",
      "www.youtube-nocookie.com",
    ].includes(h)
  ) {
    const id =
      h === "youtu.be"
        ? u.pathname.slice(1)
        : u.pathname.startsWith("/embed/")
          ? u.pathname.split("/")[2]
          : u.searchParams.get("v");
    return id && /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  }
  if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(h)) {
    const id = u.pathname.match(/(?:\/video)?\/(\d+)\/?$/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}
export function publishedSections(doc: unknown) {
  const v = record(doc);
  if (v.visible !== true) return [];
  return array(v.sections)
    .map(record)
    .filter((s) => s.status !== "Archived" && s.status !== "Inactive")
    .sort(
      (a, b) =>
        Number(!!b.isPinned) - Number(!!a.isPinned) ||
        (Number(a.position) || 0) - (Number(b.position) || 0),
    );
}
export function nestedBlocks(config: unknown) {
  return array(configValue(config, "children", "blocks")).map(record);
}
export function snapshotBlocks(config: unknown) {
  const snapshot = record(
    configValue(config, "publishedSnapshot", "resolvedSnapshot", "snapshot"),
  );
  if (snapshot.blockType) return [snapshot];
  if (Array.isArray(snapshot.blocks)) return snapshot.blocks.map(record);
  return array(snapshot.sections)
    .map(record)
    .flatMap((s) => array(s.blocks).map(record));
}
/** Text extraction for the documented rich-text JSON, never HTML interpretation. */
export function richTextValue(
  value: unknown,
  locale: string,
  depth = 0,
): string {
  if (depth > 12) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value))
    return value.map((v) => richTextValue(v, locale, depth + 1)).join("\n");
  const v = record(value);
  if (typeof v.text === "string") return v.text;
  if (v[locale] !== undefined || v.en !== undefined || v.ar !== undefined)
    return richTextValue(v[locale] ?? v.en ?? v.ar, locale, depth + 1);
  if (Array.isArray(v.children))
    return v.children
      .map((c) => richTextValue(c, locale, depth + 1))
      .join(
        [
          "bulleted-list",
          "bulletList",
          "unordered-list",
          "orderedList",
          "numbered-list",
        ].includes(string(v.type))
          ? "\n"
          : "",
      );
  if (Array.isArray(v.content))
    return richTextValue(v.content, locale, depth + 1);
  return "";
}
/** Preserve supported formatting when editing a rich-text block as readable text. */
export function richTextSource(
  value: unknown,
  locale: string,
  depth = 0,
): string {
  if (depth > 12) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value))
    return value.map((v) => richTextSource(v, locale, depth + 1)).join("\n\n");
  const v = record(value);
  if (v[locale] !== undefined || v.en !== undefined || v.ar !== undefined)
    return richTextSource(v[locale] ?? v.en ?? v.ar, locale, depth + 1);
  if (typeof v.text === "string") {
    let text = v.text;
    const marks = array(v.marks).map((m) =>
      typeof m === "string" ? m : string(record(m).type),
    );
    if (v.bold || marks.includes("bold")) text = "**" + text + "**";
    if (v.italic || marks.includes("italic")) text = "*" + text + "*";
    return text;
  }
  if (
    ["bulleted-list", "bulletList", "unordered-list"].includes(string(v.type))
  )
    return array(v.children ?? v.content)
      .map((c) => "- " + richTextSource(c, locale, depth + 1))
      .join("\n");
  return array(v.children ?? v.content)
    .map((c) => richTextSource(c, locale, depth + 1))
    .join(v.type === "paragraph" ? "" : "\n");
}
export function richTextParagraphs(source: string) {
  return source.split(/\n\s*\n/).map((part) => {
    const lines = part.split("\n");
    return lines.every((line) => /^\s*[-*] /.test(line))
      ? {
          type: "bulleted-list",
          children: lines.map((line) => ({
            type: "list-item",
            children: [
              {
                type: "paragraph",
                children: [
                  { type: "text", text: line.replace(/^\s*[-*] /, "") },
                ],
              },
            ],
          })),
        }
      : { type: "paragraph", children: [{ type: "text", text: part }] };
  });
}
