import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { authErrorKey, safeReturnTo } from "../../lib/auth";
import { routes } from "../../constants/routes";
import { AuthenticatedState } from "./AuthenticatedState";
import { useAuthJourney } from "./AuthJourney";
import { campusDestinations } from "../homepage/living-campus";

export default function RegisterPage() {
  const auth = useAuth();
  const journey = useAuthJourney();
  const { label, t } = useLocale();
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
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState<
    Partial<Record<keyof typeof form, boolean>>
  >({});
  const lastStep = useRef(0);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<keyof typeof form | null>(null);
  const passwordReady = useMemo(
    () =>
      form.password.length >= 8 &&
      /[A-Za-z]/.test(form.password) &&
      /\d/.test(form.password),
    [form.password],
  );
  const readyIds = useMemo(() => {
    const ready = [
      !!form.fullName.trim(),
      /^\S+@\S+\.\S+$/.test(form.email.trim()),
      !!form.batch.trim(),
      form.year >= 1 && form.year <= 6,
      passwordReady,
      passwordReady && form.password === form.confirm,
    ];
    const keys = [
      "fullName",
      "email",
      "batch",
      "year",
      "password",
      "confirm",
    ] as const;
    return campusDestinations
      .filter((_, index) => ready[index] && touched[keys[index]])
      .map((destination) => destination.id);
  }, [form, touched, passwordReady]);
  useEffect(() => {
    const timer = setTimeout(() => journey.setProgress(readyIds), 180);
    return () => clearTimeout(timer);
  }, [readyIds, journey.setProgress]);
  useEffect(() => {
    if (lastStep.current !== step)
      document
        .getElementById(step === 1 ? "register-password" : "register-name")
        ?.focus();
    lastStep.current = step;
  }, [step]);
  if (auth.snapshot.status === "authenticated") return <AuthenticatedState />;
  const update = (key: keyof typeof form, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
    setTouched((current) => ({ ...current, [key]: true }));
    setInvalid(null);
    setError(null);
  };
  const reject = (key: keyof typeof form, message: string, id: string) => {
    setInvalid(key);
    setError(message);
    document.getElementById(id)?.focus();
  };
  const back = () => {
    setError(null);
    setInvalid(null);
    setStep(0);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (auth.isPending) return;
    setError(null);
    setInvalid(null);
    if (!form.fullName.trim())
      return reject("fullName", label("requiredField"), "register-name");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      return reject("email", label("emailInvalid"), "register-email");
    if (!form.batch.trim())
      return reject("batch", label("requiredField"), "register-batch");
    if (step === 0) {
      setTouched((current) => ({ ...current, batch: true, year: true }));
      setStep(1);
      return;
    }
    if (!passwordReady)
      return reject("password", label("passwordRules"), "register-password");
    if (form.password !== form.confirm)
      return reject("confirm", label("passwordMismatch"), "register-confirm");
    journey.finishRestoration();
    try {
      await auth.register({
        fullName: form.fullName,
        email: form.email.trim(),
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
  const described = (key: keyof typeof form) =>
    invalid === key ? "register-error" : undefined;
  return (
    <section
      className="auth-panel auth-register-panel"
      data-auth-step={step + 1}
    >
      <div className="auth-panel-heading">
        <p className="auth-eyebrow">
          <UserRoundPlus />
          {label("createAccount")}
        </p>
        <h2>{label("registerTitle")}</h2>
        <p>{label("registerBody")}</p>
      </div>
      <ol
        className="auth-registration-steps"
        aria-label={t({
          en: "Account creation steps",
          ar: "خطوات إنشاء الحساب",
        })}
      >
        <li>
          <button
            type="button"
            onClick={back}
            disabled={auth.isPending}
            aria-current={step === 0 ? "step" : undefined}
          >
            <b>01</b>
            {t({ en: "Your details", ar: "بياناتك" })}
          </button>
        </li>
        <li>
          <span aria-current={step === 1 ? "step" : undefined}>
            <b>02</b>
            {t({ en: "Your account", ar: "حسابك" })}
          </span>
        </li>
      </ol>
      <form
        className="auth-form"
        onSubmit={submit}
        noValidate
        aria-busy={auth.isPending}
      >
        {step === 0 ? (
          <div className="auth-step-fields" key="details">
            <label className="auth-field" htmlFor="register-name">
              <span>{label("fullName")}</span>
              <input
                id="register-name"
                autoComplete="name"
                value={form.fullName}
                onChange={(event) => update("fullName", event.target.value)}
                required
                aria-invalid={invalid === "fullName" || undefined}
                aria-describedby={described("fullName")}
              />
            </label>
            <label className="auth-field" htmlFor="register-email">
              <span>{label("email")}</span>
              <input
                id="register-email"
                type="email"
                dir="ltr"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                required
                aria-invalid={invalid === "email" || undefined}
                aria-describedby={described("email")}
              />
            </label>
            <div className="auth-field-pair">
              <label className="auth-field" htmlFor="register-batch">
                <span>{label("batchName")}</span>
                <input
                  id="register-batch"
                  value={form.batch}
                  onBlur={() =>
                    setTouched((current) => ({ ...current, batch: true }))
                  }
                  onChange={(event) => update("batch", event.target.value)}
                  required
                  aria-invalid={invalid === "batch" || undefined}
                  aria-describedby={described("batch")}
                />
              </label>
              <label className="auth-field" htmlFor="register-year">
                <span>{label("studyYear")}</span>
                <select
                  id="register-year"
                  value={form.year}
                  onBlur={() =>
                    setTouched((current) => ({ ...current, year: true }))
                  }
                  onChange={(event) =>
                    update("year", Number(event.target.value))
                  }
                >
                  {[1, 2, 3, 4, 5, 6].map((year) => (
                    <option key={year} value={year}>
                      {label("year")} {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : (
          <div className="auth-step-fields" key="account">
            <div className="auth-account-summary">
              <div>
                <strong>{form.fullName}</strong>
                <small dir="ltr">{form.email}</small>
              </div>
              <button type="button" onClick={back} disabled={auth.isPending}>
                {t({ en: "Edit", ar: "تعديل" })}
              </button>
            </div>
            <label className="auth-field" htmlFor="register-password">
              <span>{label("password")}</span>
              <span className="auth-password-field">
                <input
                  id="register-password"
                  type={visible ? "text" : "password"}
                  dir="ltr"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  required
                  aria-invalid={invalid === "password" || undefined}
                  aria-describedby={
                    invalid === "password"
                      ? "password-rules register-error"
                      : "password-rules"
                  }
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
              <small
                id="password-rules"
                data-ready={passwordReady || undefined}
              >
                {label("passwordRules")}
              </small>
            </label>
            <label className="auth-field" htmlFor="register-confirm">
              <span>{label("confirmPassword")}</span>
              <input
                id="register-confirm"
                type={visible ? "text" : "password"}
                dir="ltr"
                autoComplete="new-password"
                value={form.confirm}
                onChange={(event) => update("confirm", event.target.value)}
                required
                aria-invalid={invalid === "confirm" || undefined}
                aria-describedby={described("confirm")}
              />
            </label>
          </div>
        )}
        {error && (
          <p id="register-error" className="auth-form-error" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={auth.isPending}
          className="button button-primary auth-submit"
          onPointerEnter={() => { if (step === 1 && readyIds.length === 6) journey.finishRestoration(); }}
          onFocus={() => { if (step === 1 && readyIds.length === 6) journey.finishRestoration(); }}
        >
          {auth.isPending
            ? label("creatingAccount")
            : step === 0
              ? t({ en: "Continue", ar: "متابعة" })
              : label("createAccount")}
          <ArrowRight size={18} className="directional" />
        </Button>
        {step === 1 && (
          <button
            type="button"
            className="auth-step-back"
            onClick={back}
            disabled={auth.isPending}
          >
            {t({ en: "Back to your details", ar: "العودة إلى بياناتك" })}
          </button>
        )}
      </form>
      <p className="auth-switch">
        {label("alreadyAccount")}{" "}
        <AppLink
          href={`${routes.signIn}?returnTo=${encodeURIComponent(returnTo)}`}
        >
          {label("signIn")}
        </AppLink>
      </p>
    </section>
  );
}
