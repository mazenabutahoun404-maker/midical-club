import { useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Sparkles } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { PREVIEW_CREDENTIALS } from "../../services/local-auth.service";
import { authErrorKey, safeReturnTo } from "../../lib/auth";
import { routes } from "../../constants/routes";
import { AuthenticatedState } from "./AuthenticatedState";

export default function SignInPage() {
  const auth = useAuth();
  const { label } = useLocale();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const returnTo = safeReturnTo(search.get("returnTo"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (auth.snapshot.status === "authenticated") return <AuthenticatedState />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError(label("requiredField"));
      return;
    }
    try {
      await auth.signIn({ email, password });
      navigate(returnTo, { replace: true });
    } catch (caught) {
      setError(label(authErrorKey(caught)));
    }
  };

  return (
    <section className="auth-panel">
      <div className="auth-panel-heading">
        <p className="auth-eyebrow">
          <Sparkles />
          {label("signIn")}
        </p>
        <h2>{label("signInTitle")}</h2>
        <p>{label("signInBody")}</p>
      </div>
      <form className="auth-form" onSubmit={submit} noValidate>
        <label className="auth-field" htmlFor="auth-email">
          <span>{label("email")}</span>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="auth-field" htmlFor="auth-password">
          <span>{label("password")}</span>
          <span className="auth-password-field">
            <input
              id="auth-password"
              type={visible ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setVisible((value) => !value)}
              aria-label={label(visible ? "hidePassword" : "showPassword")}
            >
              {visible ? <EyeOff /> : <Eye />}
            </button>
          </span>
        </label>
        <div className="auth-form-between">
          <AppLink href={routes.recover}>{label("forgotPassword")}</AppLink>
          <button
            type="button"
            className="auth-demo-fill"
            onClick={() => {
              setEmail(PREVIEW_CREDENTIALS.email);
              setPassword(PREVIEW_CREDENTIALS.password);
              setError(null);
            }}
          >
            <KeyRound />
            {label("useDemoCredentials")}
          </button>
        </div>
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
          {auth.isPending ? label("signingIn") : label("signIn")}
        </Button>
      </form>
      <p className="auth-demo-hint">{label("demoCredentialHint")}</p>
      <p className="auth-switch">
        {label("newHere")}{" "}
        <AppLink href={routes.register}>{label("createAccount")}</AppLink>
      </p>
      <div className="auth-boundary-note">
        <strong>{label("authPreview")}</strong>
        <span>{label("authPreviewBody")}</span>
      </div>
    </section>
  );
}
