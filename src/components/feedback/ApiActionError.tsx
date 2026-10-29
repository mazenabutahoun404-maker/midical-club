import { useState } from "react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import {
  ApiError,
  requiresRecentAuthentication,
} from "../../services/api/client";
import { authErrorMessage } from "../../lib/auth";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/button";
import "../../styles/account-access.css";
export function isRecentAuthError(error: unknown) {
  return requiresRecentAuthentication(error);
}
export function ApiActionError({
  error,
  onReload,
}: {
  error: unknown;
  onReload?: () => void;
}) {
  const auth = useAuth();
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState<unknown>(null),
    [confirmed, setConfirmed] = useState(false);
  if (!error) return null;
  const close = () => {
    setOpen(false);
    setPassword("");
    setFailure(null);
  };
  return (
    <div className="api-action-error" role="alert">
      <p>
        {authErrorMessage(
          error,
          locale,
          t({
            en: "The action could not be completed.",
            ar: "تعذّر إكمال الإجراء.",
          }),
        )}
      </p>
      {error instanceof ApiError && error.status === 409 && onReload && (
        <Button type="button" variant="outline" onClick={onReload}>
          {t({ en: "Reload current data", ar: "تحميل البيانات الحالية" })}
        </Button>
      )}
      {isRecentAuthError(error) && (
        <>
          <p>
            {t({
              en: "Confirm your password, then retry your action.",
              ar: "أكّد كلمة مرورك ثم أعد محاولة الإجراء.",
            })}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmed(false);
              setOpen(true);
            }}
          >
            {t({ en: "Confirm identity", ar: "تأكيد الهوية" })}
          </Button>
        </>
      )}
      {confirmed && (
        <p role="status">
          {t({
            en: "Identity confirmed. You can retry the action.",
            ar: "تم تأكيد الهوية. يمكنك إعادة محاولة الإجراء.",
          })}
        </p>
      )}
      <Modal
        open={open}
        onClose={() => {
          if (!busy) close();
        }}
        title={t({ en: "Confirm your identity", ar: "تأكيد هويتك" })}
        description={t({
          en: "Enter your current password to confirm this session.",
          ar: "أدخل كلمة مرورك الحالية لتأكيد هذه الجلسة.",
        })}
      >
        <form
          className="account-api-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!password || busy) return;
            setBusy(true);
            setFailure(null);
            try {
              await auth.reauthenticate(password);
              setConfirmed(true);
              close();
            } catch (caught) {
              setFailure(caught);
            } finally {
              setBusy(false);
              setPassword("");
            }
          }}
        >
          <label>
            {t({ en: "Current password", ar: "كلمة المرور الحالية" })}
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
              required
            />
          </label>
          {!!failure && (
            <p role="alert">
              {authErrorMessage(
                failure,
                locale,
                t({
                  en: "Could not confirm your identity.",
                  ar: "تعذّر تأكيد هويتك.",
                }),
              )}
            </p>
          )}
          <Button type="submit" disabled={busy || !password}>
            {t({ en: "Confirm", ar: "تأكيد" })}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
