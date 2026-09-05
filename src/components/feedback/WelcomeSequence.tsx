import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { STORAGE_KEYS } from "../../constants/config";
import logo from "../../assets/brand/medclub-logo.png";

export function WelcomeSequence() {
  const { label } = useLocale();
  const [visible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      return false;
    try {
      if (window.sessionStorage.getItem(STORAGE_KEYS.welcomeSeen) === "yes")
        return false;
      window.sessionStorage.setItem(STORAGE_KEYS.welcomeSeen, "yes");
      return true;
    } catch {
      return true;
    }
  });
  if (!visible) return null;
  return (
    <div className="welcome-sequence" aria-hidden="true">
      <div className="welcome-ring">
        <img src={logo} alt="" />
        <i />
        <i />
      </div>
      <div className="welcome-copy">
        <strong>{label("welcomeToMedClub")}</strong>
        <span>{label("welcomePromise")}</span>
      </div>
    </div>
  );
}
