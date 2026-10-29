import type { Schemas } from "../../services/api/schema.generated";
import { createRecordId } from "../../lib/record-id";
import { record, array, string } from "../../services/api/mapping";
export type Draft = Schemas["ContentDocument"];
export type Section = Schemas["SectionDocument"];
export type Block = Schemas["BlockDocument"];
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length)
    return items;
  const next = [...items];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}
export function cloneBlock(block: Block): Block {
  const next = structuredClone(block);
  next.id = createRecordId();
  const c = record(next.configuration),
    key = Object.keys(c).find((k) =>
      ["children", "blocks"].includes(k.toLowerCase()),
    );
  if (key && Array.isArray(c[key]))
    c[key] = (c[key] as Block[]).map(cloneBlock);
  next.configuration = c;
  return next;
}
export function draftPreview(doc: Draft, locale: string) {
  return {
    ...doc,
    visible: true,
    title: record(doc.title)[locale] ?? record(doc.title).en,
    description: record(doc.description)[locale] ?? record(doc.description).en,
    sections: (doc.sections || []).map((s) => ({
      ...s,
      title: record(s.title)[locale] ?? record(s.title).en,
    })),
  };
}
export function freshBlock(
  type: Block["blockType"],
  schema?: { schemaVersion?: number; allowedFields: string[] },
): Block {
  const configuration: Record<string, unknown> = {};
  const versionField = schema?.allowedFields.find(
    (k) => k.toLowerCase() === "schemaversion",
  );
  if (versionField && Number.isInteger(schema?.schemaVersion))
    configuration[versionField] = schema!.schemaVersion;
  if (type === "Group")
    configuration[childField({}, schema?.allowedFields)] = [];
  return {
    id: createRecordId(),
    blockType: type,
    position: 0,
    configuration,
    visibility: [],
  };
}
export function canonicalDraft(doc: Draft): Draft {
  const copy = structuredClone(doc);
  const normalize = (items: Block[]): Block[] =>
    items.map((b, i) => {
      const next = { ...b, position: i, configuration: { ...b.configuration } };
      if (b.blockType === "Group")
        next.configuration[childField(b.configuration)] = normalize(
          blockChildren(b),
        );
      return next;
    });
  copy.sections = (copy.sections || []).map((s, i) => ({
    ...s,
    position: i,
    blocks: normalize(s.blocks || []),
  }));
  return copy;
}
export function childField(config: unknown, allowed?: string[]) {
  return (
    Object.keys(record(config)).find((k) =>
      ["children", "blocks"].includes(k.toLowerCase()),
    ) ||
    allowed?.find((k) => ["children", "blocks"].includes(k.toLowerCase())) ||
    "Children"
  );
}
export function blockChildren(block: Block) {
  return array(
    record(block.configuration)[childField(block.configuration)],
  ).map(record) as Block[];
}
export function assertDraft(doc: Draft) {
  const ids = new Set<string>();
  function blocks(items: Block[], depth: number) {
    if (depth > 8) throw new Error("Content nesting exceeds eight levels.");
    for (const b of items) {
      if (!string(b.id) || ids.has(b.id!))
        throw new Error(
          "Each section and block needs its own unique identity.",
        );
      ids.add(b.id!);
      if (b.blockType === "Group") blocks(blockChildren(b), depth + 1);
    }
  }
  for (const s of doc.sections || []) {
    if (!s.id || ids.has(s.id))
      throw new Error("Each section and block needs its own unique identity.");
    ids.add(s.id);
    blocks(s.blocks || [], 0);
  }
}
