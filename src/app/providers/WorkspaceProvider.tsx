import { useAuth } from "./AuthProvider";
import {
  workspaceInverse,
  workspaceActionFingerprint,
} from "../../lib/workspace-undo";
import { offerUndo } from "../../components/feedback/undo-action";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServices } from "./ServicesProvider";
import { useLocale } from "./LocaleProvider";
import { useStudentProfile } from "../../hooks/useContent";
import { emptyWorkspace } from "../../lib/workspace-state";
import type { PersonalWorkspace, WorkspaceAction } from "../../types/workspace";
const empty = emptyWorkspace();
interface WorkspaceContext {
  state: PersonalWorkspace;
  isPending: boolean;
  isError: boolean;
  persistent: boolean;
  send: (action: WorkspaceAction) => Promise<boolean>;
  retry: () => void;
}
const Context = createContext<WorkspaceContext | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { workspace, auth } = useServices();
  const { snapshot: authSnapshot } = useAuth();
  const account = `${authSnapshot.status}:${authSnapshot.user?.id || "guest"}`;
  const { label, t } = useLocale();
  const profile = useStudentProfile();
  const id = profile.data?.id;
  const currentId = useRef(id);
  currentId.current = id;
  const client = useQueryClient();
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const key = ["workspace", id];
  const query = useQuery({
    queryKey: key,
    queryFn: () => workspace.get(id!),
    enabled: !!id,
  });
  useEffect(() => {
    if (!id) return;
    return workspace.subscribe?.(id, () => {
      void client.invalidateQueries({ queryKey: ["workspace", id] });
    });
  }, [id, workspace, client]);
  async function send(action: WorkspaceAction) {
    if (!id || !query.data) {
      toast.error(label("workspaceNotReady"));
      return false;
    }
    const job = queue.current
      .catch(() => undefined)
      .then(async () => {
        try {
          const before = (await workspace.get(id)).state;
          const snapshot = await workspace.dispatch(id, action);
          const inverse = workspaceInverse(before, action);
          if (inverse) {
            const expected = workspaceActionFingerprint(snapshot.state, action);
            offerUndo({
              message: t(
                action.type.startsWith("delete") ||
                  action.type === "toggle-save"
                  ? { en: "Item removed", ar: "حُذف العنصر" }
                  : { en: "Changes saved", ar: "حُفظت التغييرات" },
              ),
              label: t({ en: "Undo", ar: "تراجع" }),
              restored: t({ en: "Action undone", ar: "تم التراجع" }),
              failed: t({
                en: "Could not undo. This item may have changed.",
                ar: "تعذّر التراجع. ربما تغيّر هذا العنصر.",
              }),
              canRestore: () => currentId.current === id,
              undo: async () => {
                const job = queue.current
                  .catch(() => undefined)
                  .then(async () => {
                    const fresh = await auth.getSnapshot();
                    if (
                      currentId.current !== id ||
                      `${fresh.status}:${fresh.user?.id || "guest"}` !== account
                    )
                      throw new Error("ACCOUNT_CHANGED");
                    const current = await workspace.get(id);
                    if (
                      workspaceActionFingerprint(current.state, action) !==
                      expected
                    )
                      throw new Error("ITEM_CHANGED");
                    const restored = await workspace.dispatch(id, inverse);
                    client.setQueryData(["workspace", id], restored);
                  });
                queue.current = job;
                await job;
              },
            });
          }
          client.setQueryData(["workspace", id], snapshot);
          if (!snapshot.persistent) toast(label("sessionOnly"));
          return true;
        } catch {
          toast.error(label("workspaceSaveFailed"));
          return false;
        }
      });
    queue.current = job;
    return job;
  }
  return (
    <Context.Provider
      value={{
        state: query.data?.state || empty,
        isPending:
          !(profile.isError || query.isError) &&
          (profile.isPending || query.isPending),
        isError: profile.isError || query.isError,
        persistent: query.data?.persistent ?? true,
        send,
        retry: () => {
          void profile.refetch();
          void query.refetch();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("WorkspaceProvider required");
  return context;
}
