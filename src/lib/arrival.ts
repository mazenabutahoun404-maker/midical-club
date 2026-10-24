/** Entrance effects run once per document, across all workspaces and routes. */
type Arrival = "shell" | "welcome" | "campus" | "chest";
const shown = new WeakMap<Document, Set<Arrival>>();
export function arrivalPlayed(kind: Arrival) {
  return shown.get(document)?.has(kind) ?? false;
}
export function rememberArrival(kind: Arrival) {
  let entries = shown.get(document);
  if (!entries) {
    entries = new Set();
    shown.set(document, entries);
  }
  entries.add(kind);
}
