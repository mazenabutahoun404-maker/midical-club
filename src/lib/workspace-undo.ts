import type { PersonalWorkspace, WorkspaceAction } from "../types/workspace";
export function workspaceInverse(
  before: PersonalWorkspace,
  action: WorkspaceAction,
): WorkspaceAction | null {
  switch (action.type) {
    case "delete-collection": {
      const collection = before.collections.find((c) => c.id === action.id);
      return collection
        ? {
            type: "restore-collection",
            collection: structuredClone(collection),
          }
        : null;
    }
    case "rename-collection": {
      const old = before.collections.find((c) => c.id === action.id);
      return old ? { ...action, name: old.name } : null;
    }
    case "collection-item":
      return {
        ...action,
        included: !!before.collections
          .find((c) => c.id === action.collectionId)
          ?.itemIds.includes(action.itemId),
      };
    case "upsert-study": {
      const entry = before.studyEntries.find((e) => e.id === action.entry.id);
      return entry
        ? { ...action, entry: structuredClone(entry) }
        : { type: "delete-study", id: action.entry.id };
    }
    case "delete-study": {
      const entry = before.studyEntries.find((e) => e.id === action.id);
      return entry
        ? { type: "upsert-study", entry: structuredClone(entry) }
        : null;
    }
    case "toggle-reviewed":
      return action;
    case "toggle-save":
      return before.savedIds.includes(action.id)
        ? {
            type: "restore-saved",
            id: action.id,
            savedAt: before.savedAt[action.id],
            collectionIds: before.collections
              .filter((c) => c.itemIds.includes(action.id))
              .map((c) => c.id),
          }
        : null;
    default:
      return null;
  }
}
/** Compare only the affected record: unrelated saves must survive Undo. */
export function workspaceActionFingerprint(
  state: PersonalWorkspace,
  action: WorkspaceAction,
): string {
  switch (action.type) {
    case "delete-collection":
    case "rename-collection":
      return JSON.stringify(
        state.collections.find((c) => c.id === action.id) ?? null,
      );
    case "collection-item":
      return JSON.stringify(
        state.collections
          .find((c) => c.id === action.collectionId)
          ?.itemIds.includes(action.itemId) ?? null,
      );
    case "upsert-study":
      return JSON.stringify(
        state.studyEntries.find((e) => e.id === action.entry.id) ?? null,
      );
    case "delete-study":
      return JSON.stringify(
        state.studyEntries.find((e) => e.id === action.id) ?? null,
      );
    case "toggle-reviewed":
      return JSON.stringify(state.reviewedResourceIds.includes(action.id));
    case "toggle-save":
      return JSON.stringify([
        state.savedIds.includes(action.id),
        state.savedAt[action.id],
        state.collections
          .filter((c) => c.itemIds.includes(action.id))
          .map((c) => c.id),
      ]);
    default:
      return "";
  }
}
