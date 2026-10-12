export const bookMaterials = [
  "pebbled",
  "smooth",
  "saffiano",
  "suede",
  "embossed",
  "woven",
  "ostrich",
  "fluted",
] as const;
/** Stable material per course: catalogue, shelf and opened notebook always agree. */
export function bookMaterial(id: string) {
  let hash = 2166136261;
  for (const character of id)
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  return bookMaterials[hash % bookMaterials.length];
}
