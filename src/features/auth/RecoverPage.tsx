import { useState, type FormEvent } from "react";
import { CheckCircle2, RotateCcwKey } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { routes } from "../../constants/routes";
import { authErrorKey } from "../../lib/auth";
import { authErrorMessage } from "../../lib/auth";
import { useServices } from "../../app/providers/ServicesProvider";
import { isPasswordReady } from "./auth-progress";

export default function RecoverPage() {
  const auth = useAuth();
  const service = useServices().auth;
  const live = service.mode === "api";
  const { label, t, locale } = useLocale();
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"email" | "code" | "password" | "done">(
    "email",
  );
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (auth.isPending || busy) return;
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(label("emailInvalid"));
      return;
    }
    try {
      setBusy(true);
      await auth.requestPasswordReset(email.trim());
      setStage(live ? "code" : "done");
    } catch (caught) {
      setError(authErrorMessage(caught, locale, label(authErrorKey(caught))));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-panel">
      <div className="auth-panel-heading">
        <p className="auth-eyebrow">
          <RotateCcwKey />
          {label("forgotPassword")}
        </p>
        <h2>{label("recoverTitle")}</h2>
        <p>{label("recoverBody")}</p>
      </div>
      {stage === "done" ? (
        <div className="auth-recovery-result" role="status">
          <CheckCircle2 />
          <p>
            {live
              ? t({
                  en: "Password updated. Sign in with your new password.",
                  ar: "تم تحديث كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.",
                })
              : label("recoverySent")}
          </p>
        </div>
      ) : stage === "code" ? (
        <form
          className="auth-form"
          aria-busy={busy}
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy || code.length !== 6) return;
            setBusy(true);
            setError(null);
            try {
              await service.verifyPasswordReset!(code);
              setStage("password");
              setCode("");
            } catch (caught) {
              setError(
                authErrorMessage(caught, locale, label(authErrorKey(caught))),
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <p>{label("recoverySent")}</p>
          <label className="auth-field" htmlFor="reset-code">
            <span>{label("verificationCode")}</span>
            <input
              id="reset-code"
              inputMode="numeric"
              dir="ltr"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
              disabled={busy}
              required
            />
          </label>
          {error && (
            <p className="auth-form-error" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={busy || code.length !== 6}
            className="button button-primary auth-submit"
          >
            {label("verifyEmail")}
          </Button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setStage("email");
              setError(null);
            }}
          >
            {t({ en: "Request another code", ar: "طلب رمز آخر" })}
          </button>
        </form>
      ) : stage === "password" ? (
        <form
          className="auth-form"
          aria-busy={busy}
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            setError(null);
            if (!isPasswordReady(password)) {
              setError(label("passwordRules"));
              return;
            }
            if (password !== confirm) {
              setError(label("passwordMismatch"));
              return;
            }
            setBusy(true);
            try {
              await service.resetPassword!(password);
              setPassword("");
              setConfirm("");
              setStage("done");
            } catch (caught) {
              setError(
                authErrorMessage(caught, locale, label(authErrorKey(caught))),
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="auth-field" htmlFor="reset-password">
            <span>{label("password")}</span>
            <input
              id="reset-password"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              value={password}
              maxLength={128}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
              required
            />
            <small>{label("passwordRules")}</small>
          </label>
          <label className="auth-field" htmlFor="reset-confirm">
            <span>
              {t({ en: "Confirm password", ar: "تأكيد كلمة المرور" })}
            </span>
            <input
              id="reset-confirm"
              type="password"
              dir="ltr"
              autoComplete="new-password"
              value={confirm}
              maxLength={128}
              onChange={(event) => setConfirm(event.target.value)}
              disabled={busy}
              required
            />
          </label>
          {error && (
            <p className="auth-form-error" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={
              busy || !isPasswordReady(password) || password !== confirm
            }
            className="button button-primary auth-submit"
          >
            {t({ en: "Update password", ar: "تحديث كلمة المرور" })}
          </Button>
        </form>
      ) : (
        <form
          className="auth-form"
          onSubmit={submit}
          noValidate
          aria-busy={auth.isPending}
        >
          <label className="auth-field" htmlFor="recover-email">
            <span>{label("email")}</span>
            <input
              id="recover-email"
              type="email"
              dir="ltr"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {error && (
            <p className="auth-form-error" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={auth.isPending || busy}
            className="button button-primary auth-submit"
          >
            {label("sendRecovery")}
          </Button>
        </form>
      )}
      <p className="auth-switch">
        <AppLink href={routes.signIn}>{label("backToSignIn")}</AppLink>
      </p>
      {!live && (
        <div className="auth-boundary-note">
          <strong>{label("authPreview")}</strong>
          <span>{label("authPreviewBody")}</span>
        </div>
      )}
    </section>
  );
}
