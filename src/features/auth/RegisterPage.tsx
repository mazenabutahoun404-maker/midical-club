import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, UserRoundPlus } from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { authErrorKey, safeReturnTo } from "../../lib/auth";
import { routes } from "../../constants/routes";
import { AuthenticatedState } from "./AuthenticatedState";
import { useAuthJourney } from "./AuthJourney";
import {
  authMilestones,
  isEmailReady,
  isPasswordReady,
  normalizeUniversityNumber,
  isUniversityNumberReady,
} from "./auth-progress";

export default function RegisterPage() {
  const auth = useAuth();
  const journey = useAuthJourney();
  const { label, t } = useLocale();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activePath = useRef(pathname);
  activePath.current = pathname;
  const [search] = useSearchParams();
  const returnTo = safeReturnTo(search.get("returnTo"));
  const [form, setForm] = useState({
    fullName: "",
    universityNumber: "",
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
    () => isPasswordReady(form.password),
    [form.password],
  );
  const readyIds = useMemo(() => {
    const ready = [
      !!form.fullName.trim(),
      isUniversityNumberReady(form.universityNumber),
      isEmailReady(form.email),
      !!form.batch.trim(),
      form.year >= 1 && form.year <= 6,
      passwordReady,
      passwordReady && form.password === form.confirm,
    ];
    const keys = [
      "fullName",
      "universityNumber",
      "email",
      "batch",
      "year",
      "password",
      "confirm",
    ] as const;
    return authMilestones.filter(
      (_, index) => ready[index] && touched[keys[index]],
    );
  }, [form, touched, passwordReady]);
  useEffect(() => {
    if (pathname !== routes.register) return;
    const timer = setTimeout(() => journey.setProgress(readyIds), 180);
    return () => clearTimeout(timer);
  }, [readyIds, journey.setProgress, pathname]);
  useEffect(() => {
    if (lastStep.current !== step)
      document
        .getElementById(step === 1 ? "register-password" : "register-name")
        ?.focus();
    lastStep.current = step;
  }, [step]);
  if (auth.snapshot.status === "authenticated") return <AuthenticatedState />;
  const update = (key: keyof typeof form, value: string | number) => {
    journey.setFeedback("idle");
    setForm((current) => ({ ...current, [key]: value }));
    setTouched((current) => ({ ...current, [key]: true }));
    setInvalid(null);
    setError(null);
  };
  const reject = (key: keyof typeof form, message: string, id: string) => {
    journey.setFeedback("error");
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
    if (!isUniversityNumberReady(form.universityNumber))
      return reject(
        "universityNumber",
        t({
          en: "Enter your university number using digits (up to 24).",
          ar: "أدخل الرقم الجامعي بالأرقام، بحد أقصى ٢٤ رقماً.",
        }),
        "register-university-number",
      );
    if (!isEmailReady(form.email))
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
    journey.setFeedback("submitting");
    try {
      await auth.register({
        fullName: form.fullName,
        universityNumber: normalizeUniversityNumber(form.universityNumber),
        email: form.email.trim(),
        password: form.password,
        year: form.year,
        batch: form.batch,
      });
      if (activePath.current !== routes.register) return;
      navigate(`${routes.verify}?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      });
    } catch (caught) {
      if (activePath.current !== routes.register) return;
      journey.setFeedback("error");
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
        <h2>{label("createAccount")}</h2>
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
      <div
        className="auth-account-progress"
        role="progressbar"
        aria-label={t({
          en: "Account details complete",
          ar: "بيانات الحساب المكتملة",
        })}
        aria-valuemin={0}
        aria-valuemax={authMilestones.length}
        aria-valuenow={readyIds.length}
      >
        <span>
          {t({ en: "Your account is taking shape", ar: "حسابك يتشكّل" })}
          <small>
            {readyIds.length} / {authMilestones.length}
          </small>
        </span>
        <i className="auth-account-progress-track" aria-hidden="true">
          <i
            style={{
              width: `${(readyIds.length / authMilestones.length) * 100}%`,
            }}
          />
        </i>
      </div>
      <form
        className="auth-form"
        onSubmit={submit}
        noValidate
        aria-busy={auth.isPending}
      >
        {step === 0 ? (
          <div className="auth-step-fields" key="details">
            <label
              className="auth-field"
              htmlFor="register-name"
              data-complete={readyIds.includes("fullName") || undefined}
            >
              <span>{label("fullName")}</span>
              <input
                id="register-name"
                disabled={auth.isPending}
                autoComplete="name"
                value={form.fullName}
                onChange={(event) => update("fullName", event.target.value)}
                required
                aria-invalid={invalid === "fullName" || undefined}
                aria-describedby={described("fullName")}
              />
            </label>
            <label
              className="auth-field"
              htmlFor="register-university-number"
              data-complete={readyIds.includes("universityNumber") || undefined}
            >
              <span>{t({ en: "University number", ar: "الرقم الجامعي" })}</span>
              <input
                id="register-university-number"
                disabled={auth.isPending}
                type="text"
                inputMode="numeric"
                dir="ltr"
                autoComplete="off"
                maxLength={24}
                value={form.universityNumber}
                onChange={(event) =>
                  update(
                    "universityNumber",
                    normalizeUniversityNumber(event.target.value),
                  )
                }
                required
                aria-invalid={invalid === "universityNumber" || undefined}
                aria-describedby={described("universityNumber")}
              />
            </label>
            <label
              className="auth-field"
              htmlFor="register-email"
              data-complete={readyIds.includes("email") || undefined}
            >
              <span>{label("email")}</span>
              <input
                id="register-email"
                disabled={auth.isPending}
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
              <label
                className="auth-field"
                htmlFor="register-batch"
                data-complete={readyIds.includes("batch") || undefined}
              >
                <span>{label("batchName")}</span>
                <input
                  id="register-batch"
                  disabled={auth.isPending}
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
              <label
                className="auth-field"
                htmlFor="register-year"
                data-complete={readyIds.includes("year") || undefined}
              >
                <span>{label("studyYear")}</span>
                <select
                  id="register-year"
                  disabled={auth.isPending}
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
            <label
              className="auth-field"
              htmlFor="register-password"
              data-complete={readyIds.includes("password") || undefined}
            >
              <span>{label("password")}</span>
              <span className="auth-password-field">
                <input
                  id="register-password"
                  disabled={auth.isPending}
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
            <label
              className="auth-field"
              htmlFor="register-confirm"
              data-complete={readyIds.includes("confirm") || undefined}
            >
              <span>{label("confirmPassword")}</span>
              <input
                id="register-confirm"
                disabled={auth.isPending}
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
          onPointerEnter={() => {
            if (step === 1 && readyIds.length === authMilestones.length)
              journey.finishRestoration();
          }}
          onFocus={() => {
            if (step === 1 && readyIds.length === authMilestones.length)
              journey.finishRestoration();
          }}
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
