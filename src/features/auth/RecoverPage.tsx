import { useState, type FormEvent } from "react";
import { CheckCircle2, RotateCcwKey } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { routes } from "../../constants/routes";

export default function RecoverPage() {
  const auth = useAuth();
  const { label } = useLocale();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(label("emailInvalid"));
      return;
    }
    await auth.requestPasswordReset(email);
    setSent(true);
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
      {sent ? (
        <div className="auth-recovery-result" role="status">
          <CheckCircle2 />
          <p>{label("recoverySent")}</p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit} noValidate>
          <label className="auth-field" htmlFor="recover-email">
            <span>{label("email")}</span>
            <input
              id="recover-email"
              type="email"
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
            disabled={auth.isPending}
            className="button button-primary auth-submit"
          >
            {label("sendRecovery")}
          </Button>
        </form>
      )}
      <p className="auth-switch">
        <AppLink href={routes.signIn}>{label("backToSignIn")}</AppLink>
      </p>
      <div className="auth-boundary-note">
        <strong>{label("authPreview")}</strong>
        <span>{label("authPreviewBody")}</span>
      </div>
    </section>
  );
}
