import { useMemo, useState, type FormEvent } from "react";
import { Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { authErrorKey, safeReturnTo } from "../../lib/auth";
import { routes } from "../../constants/routes";
import { AuthenticatedState } from "./AuthenticatedState";

export default function RegisterPage() {
  const auth = useAuth();
  const { label } = useLocale();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const returnTo = safeReturnTo(search.get("returnTo"));
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    batch: "Shifaa",
    year: 3,
    password: "",
    confirm: "",
  });
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordReady = useMemo(
    () =>
      form.password.length >= 8 &&
      /[A-Za-z]/.test(form.password) &&
      /\d/.test(form.password),
    [form.password],
  );

  if (auth.snapshot.status === "authenticated") return <AuthenticatedState />;

  const update = (key: keyof typeof form, value: string | number) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!form.fullName.trim() || !form.email.trim() || !form.batch.trim()) {
      setError(label("requiredField"));
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError(label("emailInvalid"));
      return;
    }
    if (!passwordReady) {
      setError(label("passwordRules"));
      return;
    }
    if (form.password !== form.confirm) {
      setError(label("passwordMismatch"));
      return;
    }
    try {
      await auth.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        year: form.year,
        batch: form.batch,
      });
      navigate(`${routes.verify}?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      });
    } catch (caught) {
      setError(label(authErrorKey(caught)));
    }
  };

  return (
    <section className="auth-panel auth-register-panel">
      <div className="auth-panel-heading">
        <p className="auth-eyebrow">
          <UserRoundPlus />
          {label("createAccount")}
        </p>
        <h2>{label("registerTitle")}</h2>
        <p>{label("registerBody")}</p>
      </div>
      <form className="auth-form" onSubmit={submit} noValidate>
        <div className="auth-field-pair">
          <label className="auth-field" htmlFor="register-name">
            <span>{label("fullName")}</span>
            <input
              id="register-name"
              autoComplete="name"
              value={form.fullName}
              onChange={(event) => update("fullName", event.target.value)}
            />
          </label>
          <label className="auth-field" htmlFor="register-email">
            <span>{label("email")}</span>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </label>
        </div>
        <div className="auth-field-pair">
          <label className="auth-field" htmlFor="register-batch">
            <span>{label("batchName")}</span>
            <input
              id="register-batch"
              value={form.batch}
              onChange={(event) => update("batch", event.target.value)}
            />
          </label>
          <label className="auth-field" htmlFor="register-year">
            <span>{label("studyYear")}</span>
            <select
              id="register-year"
              value={form.year}
              onChange={(event) => update("year", Number(event.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((year) => (
                <option key={year} value={year}>
                  {label("year")} {year}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="auth-field" htmlFor="register-password">
          <span>{label("password")}</span>
          <span className="auth-password-field">
            <input
              id="register-password"
              aria-label={label("password")}
              type={visible ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              aria-describedby="password-rules"
            />
            <button
              type="button"
              onClick={() => setVisible((value) => !value)}
              aria-label={label(visible ? "hidePassword" : "showPassword")}
            >
              {visible ? <EyeOff /> : <Eye />}
            </button>
          </span>
          <small id="password-rules" data-ready={passwordReady || undefined}>
            {label("passwordRules")}
          </small>
        </label>
        <label className="auth-field" htmlFor="register-confirm">
          <span>{label("confirmPassword")}</span>
          <input
            id="register-confirm"
            aria-label={label("confirmPassword")}
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            value={form.confirm}
            onChange={(event) => update("confirm", event.target.value)}
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
          {auth.isPending ? label("creatingAccount") : label("createAccount")}
        </Button>
      </form>
      <p className="auth-switch">
        {label("alreadyAccount")}{" "}
        <AppLink href={routes.signIn}>{label("signIn")}</AppLink>
      </p>
    </section>
  );
}
