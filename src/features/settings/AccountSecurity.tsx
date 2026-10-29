import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServices } from "../../app/providers/ServicesProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { isPasswordReady } from "../auth/auth-progress";
import { routes } from "../../constants/routes";
import "../../styles/account-access.css";
export function AccountSecurity() {
  const { account } = useServices();
  const { snapshot } = useAuth();
  const { t, label } = useLocale();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"password" | "email" | "delete" | null>(
    null,
  );
  const [password, setPassword] = useState(""),
    [nextPassword, setNextPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [challenge, setChallenge] = useState(""),
    [deletePhrase, setDeletePhrase] = useState("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const reset = () => {
    setMode(null);
    setPassword("");
    setNextPassword("");
    setConfirm("");
    setEmail("");
    setCode("");
    setChallenge("");
    setDeletePhrase("");
    setError(null);
  };
  useEffect(() => {
    reset();
  }, [snapshot.user?.id]);
  if (!account) return null;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "password") {
        await account.changePassword(password, nextPassword);
      } else if (mode === "email" && !challenge) {
        const result = await account.requestEmailChange(password, email);
        setChallenge(result.challengeId);
        setPassword("");
        return;
      } else if (mode === "email") {
        await account.confirmEmailChange(challenge, code);
      } else if (mode === "delete") {
        if (deletePhrase !== "DELETE") return;
        await account.deleteAccount(password);
      }
      reset();
      navigate(routes.signIn, { replace: true });
    } catch (caught) {
      setError(caught);
    } finally {
      setBusy(false);
      setPassword("");
      setNextPassword("");
      setConfirm("");
    }
  };
  const title =
    mode === "password"
      ? t({ en: "Change password", ar: "تغيير كلمة المرور" })
      : mode === "email"
        ? t({ en: "Change email", ar: "تغيير البريد الإلكتروني" })
        : t({ en: "Delete account", ar: "حذف الحساب" });
  return (
    <section className="account-security-card">
      <h2>{t({ en: "Account security", ar: "أمان الحساب" })}</h2>
      <p>
        {t({
          en: "Manage your sign-in email and password.",
          ar: "إدارة بريد تسجيل الدخول وكلمة المرور.",
        })}
      </p>
      <div className="account-security-actions">
        <Button variant="outline" onClick={() => setMode("password")}>
          {t({ en: "Change password", ar: "تغيير كلمة المرور" })}
        </Button>
        <Button variant="outline" onClick={() => setMode("email")}>
          {t({ en: "Change email", ar: "تغيير البريد الإلكتروني" })}
        </Button>
        <Button variant="ghost" onClick={() => setMode("delete")}>
          {t({ en: "Delete account", ar: "حذف الحساب" })}
        </Button>
      </div>
      <Modal
        open={!!mode}
        onClose={() => {
          if (!busy) reset();
        }}
        title={title}
        description={t({
          en: "After a successful change, sign in again to continue.",
          ar: "بعد نجاح التغيير، سجّل الدخول مجدداً للمتابعة.",
        })}
      >
        <form className="account-api-form" onSubmit={submit} aria-busy={busy}>
          {(mode !== "email" || !challenge) && (
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
          )}
          {mode === "password" && (
            <>
              <label>
                {t({ en: "New password", ar: "كلمة المرور الجديدة" })}
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={15}
                  maxLength={128}
                  value={nextPassword}
                  onChange={(event) => setNextPassword(event.target.value)}
                  disabled={busy}
                  required
                />
                <small>{label("passwordRules")}</small>
              </label>
              <label>
                {t({
                  en: "Confirm new password",
                  ar: "تأكيد كلمة المرور الجديدة",
                })}
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  disabled={busy}
                  required
                />
              </label>
              {confirm && nextPassword !== confirm && (
                <p role="status">{label("passwordMismatch")}</p>
              )}
            </>
          )}
          {mode === "email" && !challenge && (
            <label>
              {t({ en: "New email", ar: "البريد الإلكتروني الجديد" })}
              <input
                type="email"
                autoComplete="email"
                dir="ltr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy}
                required
              />
            </label>
          )}
          {mode === "email" && challenge && (
            <label>
              {t({
                en: "Verification code sent to your new email",
                ar: "رمز التحقق المرسل إلى بريدك الجديد",
              })}
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                dir="ltr"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, ""))
                }
                disabled={busy}
                required
              />
            </label>
          )}
          {mode === "delete" && (
            <>
              <p>
                {t({
                  en: "This requests account deletion. Type DELETE to confirm this action.",
                  ar: "هذا الإجراء يطلب حذف الحساب. اكتب DELETE لتأكيد الإجراء.",
                })}
              </p>
              <label>
                {t({ en: "Confirmation", ar: "التأكيد" })}
                <input
                  dir="ltr"
                  autoComplete="off"
                  value={deletePhrase}
                  onChange={(event) => setDeletePhrase(event.target.value)}
                  disabled={busy}
                  required
                />
              </label>
            </>
          )}
          <ApiActionError error={error} />
          <div className="account-security-actions">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={reset}
            >
              {label("cancelEditing")}
            </Button>
            <Button
              type="submit"
              disabled={
                busy ||
                ((mode !== "email" || !challenge) && !password) ||
                (mode === "password" &&
                  (!isPasswordReady(nextPassword) ||
                    nextPassword !== confirm)) ||
                (mode === "email" && !!challenge && code.length !== 6) ||
                (mode === "delete" && deletePhrase !== "DELETE")
              }
            >
              {challenge
                ? t({ en: "Confirm email", ar: "تأكيد البريد" })
                : title}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
