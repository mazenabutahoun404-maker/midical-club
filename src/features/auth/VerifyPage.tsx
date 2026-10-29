import { useState, type FormEvent } from "react";
import { BadgeCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { authErrorKey, authErrorMessage, safeReturnTo } from "../../lib/auth";
import { useServices } from "../../app/providers/ServicesProvider";
import { routes } from "../../constants/routes";
import { AuthenticatedState } from "./AuthenticatedState";

export default function VerifyPage() {
  const auth = useAuth();
  const services = useServices();
  const live = services.auth.mode === "api";
  const { label, locale, t } = useLocale();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const returnTo = safeReturnTo(search.get("returnTo"));
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [email, setEmail] = useState("");

  if (auth.snapshot.status === "authenticated") return <AuthenticatedState />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (auth.isPending || code.length !== 6) return;
    setError(null);
    try {
      const next = await auth.verifyEmail(code);
      navigate(
        next.status === "authenticated"
          ? returnTo
          : `${routes.signIn}?verified=1&returnTo=${encodeURIComponent(returnTo)}`,
        { replace: true },
      );
    } catch (caught) {
      setError(authErrorMessage(caught, locale, label(authErrorKey(caught))));
    }
  };

  return (
    <section className="auth-panel auth-verify-panel">
      <div className="auth-panel-heading">
        <p className="auth-eyebrow">
          <BadgeCheck />
          {label("verificationCode")}
        </p>
        <h2>{label("verifyTitle")}</h2>
        <p>
          {label("verifyBody")}{" "}
          <strong>{auth.snapshot.pendingEmail || "—"}</strong>
        </p>
      </div>
      <form className="auth-form" onSubmit={submit} aria-busy={auth.isPending}>
        {live && !auth.snapshot.pendingEmail && !auth.snapshot.user?.email && (
          <label className="auth-field" htmlFor="verify-email">
            <span>{label("email")}</span>
            <input
              id="verify-email"
              type="email"
              autoComplete="email"
              dir="ltr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <small>
              {t({
                en: "Enter your email and request a new code.",
                ar: "أدخل بريدك واطلب رمزاً جديداً.",
              })}
            </small>
          </label>
        )}
        <label
          className="auth-field auth-code-field"
          htmlFor="verification-code"
        >
          <span>{label("verificationCode")}</span>
          <input
            id="verification-code"
            aria-label={label("verificationCode")}
            inputMode="numeric"
            dir="ltr"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          />
          {!live && <small>{label("previewCode")}</small>}
        </label>
        {error && (
          <p className="auth-form-error" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={auth.isPending || code.length !== 6}
          className="button button-primary auth-submit"
        >
          {auth.isPending ? label("verifying") : label("verifyEmail")}
        </Button>
      </form>
      {live && services.auth.resendVerification && (
        <Button
          type="button"
          variant="ghost"
          disabled={resending || auth.isPending}
          onClick={async () => {
            if (Date.now() < resendAt) {
              setError(
                t({
                  en: "Wait a minute before requesting another code.",
                  ar: "انتظر دقيقة قبل طلب رمز آخر.",
                }),
              );
              return;
            }
            const address =
              auth.snapshot.pendingEmail ||
              auth.snapshot.user?.email ||
              email.trim();
            if (!/^\S+@\S+\.\S+$/.test(address)) {
              setError(label("emailInvalid"));
              return;
            }
            setResending(true);
            setError(null);
            try {
              await services.auth.resendVerification!(address);
              setResendAt(Date.now() + 60000);
            } catch (caught) {
              setError(
                authErrorMessage(caught, locale, label(authErrorKey(caught))),
              );
            } finally {
              setResending(false);
            }
          }}
        >
          {t({ en: "Send a new code", ar: "إرسال رمز جديد" })}
        </Button>
      )}
      <p className="auth-switch">
        <AppLink href={routes.register}>{label("createAccount")}</AppLink>
        <span aria-hidden="true">·</span>
        <AppLink href={routes.signIn}>{label("backToSignIn")}</AppLink>
      </p>
    </section>
  );
}
