import { useServices } from "../../app/providers/ServicesProvider";
import { useRef } from "react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { offerUndo } from "./undo-action";
export function useUndoNotice() {
  const services = useServices();
  const { t } = useLocale(),
    { snapshot } = useAuth();
  const account = `${snapshot.status}:${snapshot.user?.id || "guest"}`;
  const latest = useRef(account);
  latest.current = account;
  return (
    message: string | { en: string; ar: string },
    undo: () => void | Promise<void>,
  ) =>
    offerUndo({
      message: typeof message === "string" ? message : t(message),
      undo: async () => {
        const fresh = await services.auth.getSnapshot();
        if (`${fresh.status}:${fresh.user?.id || "guest"}` !== account)
          throw new Error("ACCOUNT_CHANGED");
        await undo();
      },
      canRestore: () => latest.current === account,
      label: t({ en: "Undo", ar: "تراجع" }),
      restored: t({ en: "Action undone", ar: "تم التراجع" }),
      failed: t({
        en: "Could not undo. This item may have changed. You can retry while Undo is available.",
        ar: "تعذّر التراجع. ربما تغيّر العنصر. يمكنك إعادة المحاولة أثناء إتاحة التراجع.",
      }),
    });
}
