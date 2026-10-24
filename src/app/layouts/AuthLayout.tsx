import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppearanceSettings } from "../../components/navigation/AppearanceSettings";
import { useLocale } from "../providers/LocaleProvider";
import { useAuth } from "../providers/AuthProvider";
import { AppLink } from "../../components/navigation/AppLink";
import {
  AuthJourneyProvider,
  useAuthJourney,
} from "../../features/auth/AuthJourney";
import { XrayChest } from "../../features/auth/xray/XrayChest";
import { AuthElevator } from "../../features/auth/xray/AuthElevator";
import { authMilestones } from "../../features/auth/auth-progress";
import "../../features/auth/auth-lab.css";
import "../../features/auth/xray/auth-xray-v1363.css";
import "../../features/auth/xray/auth-xray-v1366.css";

function AuthLab() {
  const { label, t, dir } = useLocale();
  const { pathname } = useLocation();
  const { snapshot } = useAuth();
  const journey = useAuthJourney();
  const root = useRef<HTMLDivElement>(null);
  const registering = pathname === "/auth/register";
  const verifying = pathname === "/auth/verify";
  useEffect(() => {
    journey.stopWelcome();
    journey.setFeedback("idle");
    journey.setFocused(null);
    if (!verifying) journey.setProgress([]);
  }, [
    pathname,
    verifying,
    journey.stopWelcome,
    journey.setFeedback,
    journey.setFocused,
    journey.setProgress,
  ]);
  useEffect(() => {
    if (verifying && snapshot.status === "verification-required") {
      journey.setProgress([...authMilestones]);
      journey.finishRestoration();
    }
  }, [
    verifying,
    snapshot.status,
    journey.setProgress,
    journey.finishRestoration,
  ]);
  useEffect(() => {
    const viewport = window.visualViewport;
    const measure = () => {
      const height = Math.round(viewport?.height || window.innerHeight);
      root.current?.style.setProperty("--auth-view-height", `${height}px`);
      if (root.current) root.current.dataset.compact = String(height < 580);
    };
    measure();
    viewport?.addEventListener("resize", measure);
    window.addEventListener("resize", measure);
    return () => {
      viewport?.removeEventListener("resize", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);
  return (
    <div
      className="auth-shell auth-lab auth-xray-shell"
      ref={root}
      dir={dir}
      data-auth-mode={
        registering ? "register" : verifying ? "verify" : "signin"
      }
      data-auth-feedback={journey.feedback}
    >
      <a className="skip-link" href="#main">
        {label("skip")}
      </a>
      <header className="auth-topbar">
        <div className="auth-top-actions">
          <AppLink
            href="/"
            className="auth-home-link"
            aria-label={label("authBackHome")}
          >
            <ArrowLeft size={16} className="directional" />
            <span>{label("authBackHome")}</span>
          </AppLink>
          <AppearanceSettings compact />
        </div>
      </header>
      <main id="main" className="auth-main" tabIndex={-1}>
        <h1 className="sr-only">
          {t({
            en: "MedClub medical student account",
            ar: "حساب ميدكلب لطلبة الطب",
          })}
        </h1>
        <XrayChest registering={registering || verifying} />
        <div
          className="auth-xray-form-host"
          onFocusCapture={(event) => {
            const target = event.target;
            if (
              target instanceof HTMLInputElement ||
              target instanceof HTMLSelectElement
            )
              journey.setFocused(target.id);
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              journey.setFocused(null);
          }}
        >
          <AuthElevator root={root} />
        </div>
      </main>
      <footer className="auth-lab-footer">
        <span>
          {t({
            en: "Made for medical students. Built around you.",
            ar: "لطلبة الطب. ومن أجل رحلتك.",
          })}
        </span>
        <span className="auth-lab-footer-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </footer>
    </div>
  );
}
export function AuthLayout() {
  return (
    <AuthJourneyProvider>
      <AuthLab />
    </AuthJourneyProvider>
  );
}
