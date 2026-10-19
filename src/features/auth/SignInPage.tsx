import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, Stethoscope } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { PREVIEW_CREDENTIALS } from "../../services/local-auth.service";
import { authErrorKey, safeReturnTo } from "../../lib/auth";
import { routes } from "../../constants/routes";
import { AuthenticatedState } from "./AuthenticatedState";
import { useAuthJourney } from "./AuthJourney";

export default function SignInPage() {
  const auth = useAuth();
  const journey = useAuthJourney();
  const [welcoming, setWelcoming] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const { label } = useLocale();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const returnTo = safeReturnTo(search.get("returnTo"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (auth.snapshot.status === "authenticated" && !welcoming)
    return <AuthenticatedState />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (auth.isPending || welcoming) return;
    setError(null);
    if (!email.trim() || !password) {
      journey.setFeedback("error");
      setError(label("requiredField"));
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      journey.setFeedback("error");
      setError(label("emailInvalid"));
      document.getElementById("auth-email")?.focus();
      return;
    }
    setWelcoming(true);
    journey.setFeedback("submitting");
    try {
      await auth.signIn({ email, password });
      if (!mounted.current) return;
      await journey.startWelcome();
      if (mounted.current) navigate(returnTo, { replace: true });
    } catch (caught) {
      journey.stopWelcome();
      journey.setFeedback("error");
      if (mounted.current) setError(label(authErrorKey(caught)));
    } finally {
      if (mounted.current) setWelcoming(false);
    }
  };

  return (
    <section className="auth-panel">
      <div className="auth-panel-heading">
        <p className="auth-eyebrow">
          <Stethoscope />
          {label("signIn")}
        </p>
        <h2>{label("signInTitle")}</h2>
        <p>{label("signInBody")}</p>
      </div>
      <form
        className="auth-form"
        onSubmit={submit}
        noValidate
        aria-busy={auth.isPending || welcoming}
      >
        <label className="auth-field" htmlFor="auth-email">
          <span>{label("email")}</span>
          <input
            id="auth-email"
            disabled={auth.isPending || welcoming}
            type="email"
            dir="ltr"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(null);
              journey.setFeedback("idle");
            }}
            required
            aria-describedby={error ? "signin-error" : undefined}
          />
        </label>
        <label className="auth-field" htmlFor="auth-password">
          <span>{label("password")}</span>
          <span className="auth-password-field">
            <input
              id="auth-password"
              disabled={auth.isPending || welcoming}
              type={visible ? "text" : "password"}
              autoComplete="current-password"
              dir="ltr"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
                journey.setFeedback("idle");
              }}
              required
            />
            <button
              type="button"
              onClick={() => setVisible((value) => !value)}
              aria-label={label(visible ? "hidePassword" : "showPassword")}
              aria-pressed={visible}
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
            disabled={auth.isPending || welcoming}
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
          <p id="signin-error" className="auth-form-error" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={auth.isPending || welcoming}
          className="button button-primary auth-submit"
        >
          {auth.isPending || welcoming ? label("signingIn") : label("signIn")}
          <ArrowRight size={18} className="directional" />
        </Button>
      </form>
      <p className="auth-demo-hint">{label("demoCredentialHint")}</p>
      <p className="auth-switch">
        {label("newHere")}{" "}
        <AppLink
          href={`${routes.register}?returnTo=${encodeURIComponent(returnTo)}`}
        >
          {label("createAccount")}
        </AppLink>
      </p>
      <details className="auth-boundary-note">
        <summary>{label("authPreview")}</summary>
        <span>{label("authPreviewBody")}</span>
      </details>
    </section>
  );
}
