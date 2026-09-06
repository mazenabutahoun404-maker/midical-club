import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLocale } from "../providers/LocaleProvider";
export function RouteEffects() {
  const location = useLocation();
  const { label, locale } = useLocale();
  useEffect(() => {
    const keys = {
      "/": "home",
      "/search": "search",
      "/my/search": "personalSearch",
      "/my/calendar": "calendar",
      "/my/notifications": "notifications",
      "/my/events": "myEvents",
      "/my/opportunities": "myOpportunities",
      "/my/mentorship": "myMentorship",
      "/my/contributions": "myContributions",
      "/my/orders": "myOrders",
      "/events": "events",
      "/opportunities": "opportunities",
      "/community": "community",
      "/community/activities": "activities",
      "/community/media": "media",
      "/community/executive-bodies": "executiveBodies",
      "/community/honor-plate": "honorPlate",
      "/community/hall-of-honor": "hallOfHonor",
      "/community/about": "aboutMedClub",
      "/journal": "journal",
      "/mentorship": "mentorship",
      "/mentorship/sessions": "groupSessions",
      "/mentorship/qa": "mentorQA",
      "/contribute": "contribute",
      "/learn": "learn",
      "/learn/basic-sciences": "basic",
      "/learn/clinical-sciences": "clinical",
      "/my": "mySpace",
      "/my/learning": "myLearning",
      "/my/library": "libraryShort",
      "/my/focus": "myFocus",
      "/my/profile": "myProfile",
      "/my/settings": "personalSettings",
      "/utilities": "tools",
      "/store": "store",
      "/store/cart": "cart",
      "/learn/electronic-exams": "exams",
    } as const;
    const key = keys[location.pathname as keyof typeof keys];
    const academicChild =
      location.pathname.includes("/batches/") ||
      /^\/learn\/clinical-sciences\/(fourth|fifth|sixth)-year$/.test(
        location.pathname,
      );
    document.title = `${key ? label(key) : label(location.pathname.startsWith("/events/") ? "event" : location.pathname.startsWith("/opportunities/") ? "opportunity" : location.pathname.startsWith("/journal/") ? "journal" : location.pathname.startsWith("/store/products/") ? "product" : location.pathname.startsWith("/learn/courses/") || location.pathname.startsWith("/my/learning/") ? "course" : academicChild ? "academic" : "notFound")} | MedClub`;
  }, [location.pathname, locale, label]);
  useEffect(() => {
    let observer: MutationObserver | undefined;
    const focusAtNavigation = document.activeElement;
    const frame = requestAnimationFrame(() => {
      if (location.hash) {
        let id = location.hash.slice(1);
        try {
          id = decodeURIComponent(id);
        } catch {}
        const scroll = () => {
          const target = document.getElementById(id);
          if (!target) return false;
          target.scrollIntoView({ behavior: "auto" });
          observer?.disconnect();
          return true;
        };
        // Lazy route content may mount after this effect, including on a direct hash URL.
        if (!scroll()) {
          observer = new MutationObserver(scroll);
          observer.observe(document.getElementById("main") ?? document.body, {
            childList: true,
            subtree: true,
          });
        }
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
        // Do not steal focus if the user already opened a menu/dialog or moved on
        // while a lazy route was committing.
        if (
          !document.querySelector('dialog[open], [role="dialog"]') &&
          (document.activeElement === focusAtNavigation ||
            document.activeElement === document.body)
        ) {
          document.getElementById("main")?.focus({ preventScroll: true });
        }
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [location.pathname, location.hash, location.key]);
  return null;
}
