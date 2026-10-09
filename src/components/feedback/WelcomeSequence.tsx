import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { STORAGE_KEYS } from "../../constants/config";
import logo from "../../assets/brand/medclub-logo.png";

// Fallback is per document, so unavailable sessionStorage cannot replay an intro on remount.
const visitedDocuments = new WeakSet<Document>();
export function WelcomeSequence() {
  const { pathname } = useLocation();
  const { label } = useLocale();
  const [entryPath] = useState(pathname);
  const [visible, setVisible] = useState(() => {
    if (
      typeof window === "undefined" ||
      pathname === "/" ||
      /^\/(?:learn\/courses|my\/learning)\/[^/]+\/?$/.test(pathname) ||
      visitedDocuments.has(document)
    )
      return false;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      return false;
    try {
      if (window.sessionStorage.getItem(STORAGE_KEYS.welcomeSeen) === "yes")
        return false;
      return true;
    } catch {
      return true;
    }
  });
  useEffect(() => {
    visitedDocuments.add(document);
    try {
      window.sessionStorage.setItem(STORAGE_KEYS.welcomeSeen, "yes");
    } catch {
      /* Document fallback above. */
    }
    const timer = window.setTimeout(() => setVisible(false), 1250);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (pathname !== entryPath) setVisible(false);
  }, [pathname, entryPath]);
  if (!visible || pathname !== entryPath || pathname === "/") return null;
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
