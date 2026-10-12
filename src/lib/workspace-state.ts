import type {
  PersonalWorkspace,
  StudyEntry,
  WorkspaceAction,
} from "../types/workspace";

export const emptyWorkspace = (): PersonalWorkspace => ({
  savedIds: [],
  savedAt: {},
  collections: [],
  recentResources: [],
  reviewedResourceIds: [],
  studyEntries: [],
  readNotificationIds: [],
  recentSearches: [],
});
const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (v): v is string =>
              typeof v === "string" && v.length > 0 && v.length <= 200,
          ),
        ),
      ]
    : [];
const object = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const validDate = (v: unknown): v is string =>
  typeof v === "string" && Number.isFinite(Date.parse(v));
export function validStudyEntry(value: unknown): value is StudyEntry {
  if (!object(value)) return false;
  const { id, title, date, time, durationMinutes, notes, courseId } = value;
  return (
    typeof id === "string" &&
    id.length > 0 &&
    typeof title === "string" &&
    title.trim().length > 0 &&
    title.length <= 100 &&
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    validDate(date) &&
    new Date(date).toISOString().slice(0, 10) === date &&
    typeof time === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(time) &&
    typeof durationMinutes === "number" &&
    Number.isInteger(durationMinutes) &&
    durationMinutes >= 5 &&
    durationMinutes <= 480 &&
    typeof notes === "string" &&
    notes.length <= 500 &&
    (courseId === undefined || typeof courseId === "string")
  );
}
/** Treat persisted JSON as untrusted; retain valid fields without allowing bad records to crash a page. */
export function normalizeWorkspace(value: unknown): PersonalWorkspace {
  const state = emptyWorkspace();
  if (!object(value)) return state;
  state.savedIds = strings(value.savedIds);
  state.reviewedResourceIds = strings(value.reviewedResourceIds);
  state.readNotificationIds = strings(value.readNotificationIds);
  state.recentSearches = strings(value.recentSearches).slice(0, 6);
  if (object(value.savedAt))
    for (const id of state.savedIds) {
      if (validDate(value.savedAt[id])) state.savedAt[id] = value.savedAt[id];
    }
  if (Array.isArray(value.collections)) {
    const ids = new Set<string>();
    state.collections = value.collections
      .flatMap((c) => {
        if (
          !object(c) ||
          typeof c.id !== "string" ||
          ids.has(c.id) ||
          typeof c.name !== "string" ||
          !c.name.trim()
        )
          return [];
        ids.add(c.id);
        return [
          {
            id: c.id,
            name: c.name.trim().slice(0, 60),
            itemIds: strings(c.itemIds).filter((id) =>
              state.savedIds.includes(id),
            ),
          },
        ];
      })
      .slice(0, 50);
  }
  if (Array.isArray(value.recentResources)) {
    const ids = new Set<string>();
    state.recentResources = value.recentResources
      .flatMap((r) => {
        if (
          !object(r) ||
          typeof r.resourceId !== "string" ||
          ids.has(r.resourceId) ||
          !validDate(r.viewedAt)
        )
          return [];
        ids.add(r.resourceId);
        return [{ resourceId: r.resourceId, viewedAt: r.viewedAt }];
      })
      .slice(0, 20);
  }
  if (Array.isArray(value.studyEntries)) {
    const ids = new Set<string>();
    state.studyEntries = value.studyEntries
      .filter(validStudyEntry)
      .filter((e) => {
        if (ids.has(e.id)) return false;
        ids.add(e.id);
        return true;
      });
  }
  return state;
}
export function reduceWorkspace(
  input: PersonalWorkspace,
  action: WorkspaceAction,
  now = new Date().toISOString(),
): PersonalWorkspace {
  const state = structuredClone(input);
  switch (action.type) {
    case "toggle-save": {
      const removing = state.savedIds.includes(action.id);
      state.savedIds = removing
        ? state.savedIds.filter((id) => id !== action.id)
        : [...state.savedIds, action.id];
      if (removing) {
        delete state.savedAt[action.id];
        state.collections.forEach((c) => {
          c.itemIds = c.itemIds.filter((id) => id !== action.id);
        });
      } else state.savedAt[action.id] = now;
      break;
    }
    case "create-collection":
    case "rename-collection": {
      const name = action.name.trim();
      if (
        !name ||
        name.length > 60 ||
        state.collections.some(
          (c) =>
            c.id !== action.id && c.name.toLowerCase() === name.toLowerCase(),
        )
      )
        throw new Error("Invalid or duplicate collection name");
      if (action.type === "create-collection") {
        if (
          state.collections.length >= 50 ||
          state.collections.some((c) => c.id === action.id)
        )
          throw new Error("Collection limit");
        state.collections.push({ id: action.id, name, itemIds: [] });
      } else {
        const c = state.collections.find((c) => c.id === action.id);
        if (!c) throw new Error("Collection not found");
        c.name = name;
      }
      break;
    }
    case "restore-collection": {
      const collection = action.collection,
        name = collection.name.trim();
      if (
        !collection.id ||
        !name ||
        name.length > 60 ||
        state.collections.length >= 50 ||
        state.collections.some(
          (c) =>
            c.id === collection.id ||
            c.name.toLowerCase() === name.toLowerCase(),
        )
      )
        throw new Error("Collection changed or limit reached");
      state.collections.push({
        ...collection,
        name,
        itemIds: [...new Set(collection.itemIds)].filter((id) =>
          state.savedIds.includes(id),
        ),
      });
      break;
    }
    case "restore-saved":
      if (!action.id || state.savedIds.includes(action.id))
        throw new Error("Saved item changed");
      state.savedIds.push(action.id);
      state.savedAt[action.id] = action.savedAt || now;
      state.collections.forEach((c) => {
        if (
          action.collectionIds.includes(c.id) &&
          !c.itemIds.includes(action.id)
        )
          c.itemIds.push(action.id);
      });
      break;
    case "delete-collection":
      state.collections = state.collections.filter((c) => c.id !== action.id);
      break;
    case "collection-item": {
      const c = state.collections.find((c) => c.id === action.collectionId);
      if (!c || !state.savedIds.includes(action.itemId))
        throw new Error("Save the item before organizing it");
      c.itemIds = action.included
        ? [...new Set([...c.itemIds, action.itemId])]
        : c.itemIds.filter((id) => id !== action.itemId);
      break;
    }
    case "view-resource":
      state.recentResources = [
        { resourceId: action.id, viewedAt: now },
        ...state.recentResources.filter((r) => r.resourceId !== action.id),
      ].slice(0, 20);
      break;
    case "toggle-reviewed":
      state.reviewedResourceIds = state.reviewedResourceIds.includes(action.id)
        ? state.reviewedResourceIds.filter((id) => id !== action.id)
        : [...state.reviewedResourceIds, action.id];
      break;
    case "upsert-study":
      if (!validStudyEntry(action.entry))
        throw new Error("Invalid study entry");
      state.studyEntries = [
        ...state.studyEntries.filter((e) => e.id !== action.entry.id),
        { ...action.entry, title: action.entry.title.trim() },
      ];
      break;
    case "delete-study":
      state.studyEntries = state.studyEntries.filter((e) => e.id !== action.id);
      break;
    case "read-notifications":
      state.readNotificationIds = action.read
        ? [...new Set([...state.readNotificationIds, ...action.ids])]
        : state.readNotificationIds.filter((id) => !action.ids.includes(id));
      break;
    case "remember-search": {
      const query = action.query.trim().slice(0, 120);
      if (query)
        state.recentSearches = [
          query,
          ...state.recentSearches.filter(
            (q) => q.toLowerCase() !== query.toLowerCase(),
          ),
        ].slice(0, 6);
      break;
    }
    case "clear-searches":
      state.recentSearches = [];
      break;
  }
  return state;
}
