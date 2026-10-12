import { toast } from "sonner";
export type UndoStatus = "available" | "busy" | "restored" | "expired";
/** Keep a before-image only while Undo is offered. Never restore over newer work. */
export function createUndoAction(
  revert: () => void | Promise<void>,
  {
    canRestore = () => true,
    duration = 15000,
    release = () => {},
  }: {
    canRestore?: () => boolean;
    duration?: number;
    release?: () => void;
  } = {},
) {
  let restoreRecord: (() => void | Promise<void>) | undefined = revert;
  let state: UndoStatus = "available",
    deadline = Date.now() + duration;
  const expire = () => {
    if (state === "busy") return;
    if (state === "available") {
      state = "expired";
      restoreRecord = undefined;
      release();
    }
  };
  const undo = async () => {
    if (state !== "available") return false;
    if (Date.now() > deadline || !canRestore()) {
      expire();
      return false;
    }
    state = "busy";
    try {
      await restoreRecord!();
      restoreRecord = undefined;
      state = "restored";
      release();
      return true;
    } catch (error) {
      state = "available";
      deadline = Date.now() + duration;
      throw error;
    }
  };
  return {
    undo,
    expire,
    get status() {
      return state;
    },
  };
}
export function offerUndo({
  message,
  undo,
  canRestore,
  label,
  restored,
  failed,
  release,
}: {
  message: string;
  undo: () => void | Promise<void>;
  canRestore?: () => boolean;
  label: string;
  restored: string;
  failed: string;
  release?: () => void;
}) {
  let expiry: ReturnType<typeof setTimeout>;
  const action = createUndoAction(undo, {
    canRestore,
    release: () => {
      clearTimeout(expiry);
      release?.();
    },
  });
  const renew = () => {
    clearTimeout(expiry);
    expiry = setTimeout(() => {
      action.expire();
      if (action.status === "expired") toast.dismiss(id);
    }, 15000);
  };
  renew();
  let id: string | number;
  const restore = () => {
    if (action.status !== "available") return;
    void action
      .undo()
      .then((ok) => {
        if (ok) toast.success(restored);
        else toast.error(failed);
      })
      .catch(() => {
        renew();
        id = toast.error(failed, {
          duration: 15000,
          action: { label, onClick: restore },
          onDismiss: action.expire,
          onAutoClose: action.expire,
        });
      });
  };
  id = toast.success(message, {
    duration: 15000,
    action: { label, onClick: restore },
    onDismiss: action.expire,
    onAutoClose: action.expire,
  });
  return {
    undo: action.undo,
    get status() {
      return action.status;
    },
    dismiss: () => {
      action.expire();
      toast.dismiss(id);
    },
  };
}
