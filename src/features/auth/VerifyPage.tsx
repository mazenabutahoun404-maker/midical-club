import { useState, type FormEvent } from "react";
import { BadgeCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { authErrorKey, safeReturnTo } from "../../lib/auth";
import { routes } from "../../constants/routes";
import { AuthenticatedState } from "./AuthenticatedState";

export default function VerifyPage() {
  const auth = useAuth();
  const { label } = useLocale();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const returnTo = safeReturnTo(search.get("returnTo"));
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (auth.snapshot.status === "authenticated") return <AuthenticatedState />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (auth.isPending || code.length !== 6) return;
    setError(null);
    try {
      await auth.verifyEmail(code);
      navigate(returnTo, { replace: true });
    } catch (caught) {
      setError(label(authErrorKey(caught)));
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
          <small>{label("previewCode")}</small>
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
      <p className="auth-switch">
        <AppLink href={routes.register}>{label("createAccount")}</AppLink>
        <span aria-hidden="true">·</span>
        <AppLink href={routes.signIn}>{label("backToSignIn")}</AppLink>
      </p>
    </section>
  );
}
