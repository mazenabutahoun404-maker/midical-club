import { STORAGE_KEYS } from "../constants/config";
import {
  emptyWorkspace,
  normalizeWorkspace,
  reduceWorkspace,
} from "../lib/workspace-state";
import type { PersonalWorkspace, WorkspaceService } from "../types/workspace";

/** Mock persistence boundary. Replace this service with authenticated API calls, not UI edits.
 * Cross-tab changes refresh subscribers. Simultaneous cross-tab writes are last-write-wins;
 * a real backend should use record versions/ETags.
 */
export function createLocalWorkspaceService(): WorkspaceService {
  const memory = new Map<string, PersonalWorkspace>();
  const volatile = new Set<string>();
  const key = (studentId: string) => `${STORAGE_KEYS.workspace}.${studentId}`;
  function read(studentId: string) {
    if (volatile.has(studentId))
      return {
        state: structuredClone(memory.get(studentId) || emptyWorkspace()),
        persistent: false,
      };
    try {
      const raw = localStorage.getItem(key(studentId));
      if (raw)
        return { state: normalizeWorkspace(JSON.parse(raw)), persistent: true };
      const state = emptyWorkspace();
      // Migrate V0.1/V0.2 demo saves only. Never import demo data into another account.
      if (studentId === "demo-student") {
        try {
          const legacy = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.saved) || "[]",
          );
          state.savedIds = normalizeWorkspace({ savedIds: legacy }).savedIds;
        } catch {
          /* Malformed legacy data is ignored; its original bytes are not erased. */
        }
      }
      return { state, persistent: true };
    } catch {
      return {
        state: structuredClone(memory.get(studentId) || emptyWorkspace()),
        persistent: false,
      };
    }
  }
  return {
    get: async (id) => read(id),
    dispatch: async (id, action) => {
      const state = reduceWorkspace(read(id).state, action);
      memory.set(id, state);
      try {
        localStorage.setItem(key(id), JSON.stringify(state));
        volatile.delete(id);
        return { state: structuredClone(state), persistent: true };
      } catch {
        volatile.add(id);
        return { state: structuredClone(state), persistent: false };
      }
    },
    subscribe: (id, callback) => {
      const sync = (event: StorageEvent) => {
        if (event.key === key(id) || event.key === null) callback();
      };
      window.addEventListener("storage", sync);
      return () => window.removeEventListener("storage", sync);
    },
  };
}
