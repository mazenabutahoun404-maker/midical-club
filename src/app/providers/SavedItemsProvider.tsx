import { type ReactNode } from "react";
import { toast } from "sonner";
import { useLocale } from "./LocaleProvider";
import { useWorkspace } from "./WorkspaceProvider";
/** Compatibility facade: existing V0.1/V0.2 cards keep the same API. */
export function SavedItemsProvider({ children }: { children: ReactNode }) {
  return children;
}
export function useSavedItems() {
  const { state, send, isPending, isError } = useWorkspace();
  const { label } = useLocale();
  return {
    saved: state.savedIds,
    isPending: isPending || isError,
    toggle: async (id: string) => {
      const removing = state.savedIds.includes(id);
      if (await send({ type: "toggle-save", id }))
        toast(label(removing ? "removed" : "saved"));
    },
  };
}
