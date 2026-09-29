import { useAppearance } from "../../app/providers/AppearanceProvider";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { campusDestinations, type CampusMode } from "./campus-state";
import type { CampusController } from "./campus-renderer";
import activePoster from "../../assets/campus/campus-active.webp";
import dormantPoster from "../../assets/campus/campus-dormant.webp";
import "./campus.css";

export function CampusScene({
  mode = "active",
  links = true,
}: {
  mode?: CampusMode;
  links?: boolean;
}) {
  const { locale } = useLocale();
  const { resolvedTheme } = useAppearance();
  const navigate = useNavigate();
  const ar = locale === "ar";
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<CampusController | null>(null);
  const inView = useRef(false);
  const [requested, setRequested] = useState(false);
  const [status, setStatus] = useState<
    "poster" | "loading" | "ready" | "failed"
  >("poster");
  const [motion, setMotion] = useState(true);
  const [eveningOverride, setEvening] = useState<boolean | null>(null);
  const evening = resolvedTheme === "dark" || eveningOverride === true;
  const eveningRef = useRef(evening);
  eveningRef.current = evening;
  useEffect(() => setEvening(null), [resolvedTheme]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [view, setView] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const linksRef = useRef(links);
  linksRef.current = links;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const economy = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;
    const changeMotion = () => {
      if (reduced.matches) setMotion(false);
    };
    changeMotion();
    reduced.addEventListener("change", changeMotion);
    const memory = (navigator as Navigator & { deviceMemory?: number })
      .deviceMemory;
    const eligible = !economy && !reduced.matches && (!memory || memory >= 4);
    const observe = (visible: boolean) => {
      inView.current = visible;
      setVisible(visible);
      controller.current?.setVisible(visible);
      if (visible && eligible) setRequested(true);
    };
    if (typeof IntersectionObserver === "undefined") {
      if (typeof WebGLRenderingContext !== "undefined") observe(true);
      return () => reduced.removeEventListener("change", changeMotion);
    }
    const observer = new IntersectionObserver(
      ([entry]) => observe(entry.isIntersecting),
      { threshold: 0.05 },
    );
    if (stage.current) observer.observe(stage.current);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", changeMotion);
    };
  }, []);

  useEffect(() => {
    const changed = () => setDocumentVisible(!document.hidden);
    changed();
    document.addEventListener("visibilitychange", changed);
    return () => document.removeEventListener("visibilitychange", changed);
  }, []);

  useEffect(() => {
    if (!requested || !canvas.current) return;
    const abort = new AbortController();
    let instance: CampusController | undefined;
    setStatus("loading");
    import("./campus-renderer")
      .then(({ mountCampus }) => {
        if (abort.signal.aborted || !canvas.current) return;
        return mountCampus(canvas.current, {
          mode,
          signal: abort.signal,
          onChoose: (id) => {
            if (!linksRef.current) return;
            const destination = campusDestinations.find(
              (item) => item.id === id,
            );
            if (destination) navigateRef.current(destination.href);
          },
          onHover: setHovered,
          onFailure: () => {
            if (!abort.signal.aborted) setStatus("failed");
          },
        });
      })
      .then((value) => {
        if (!value) return;
        if (abort.signal.aborted) {
          value.dispose();
          return;
        }
        instance = value;
        controller.current = value;
        value.setEvening(eveningRef.current);
        value.setVisible(inView.current);
        setStatus("ready");
      })
      .catch(() => {
        if (!abort.signal.aborted) setStatus("failed");
      });
    return () => {
      abort.abort();
      instance?.dispose();
      controller.current = null;
    };
  }, [requested, mode, attempt]);

  useEffect(() => {
    controller.current?.setMotion(motion && mode === "active");
  }, [motion, status, mode]);
  useEffect(() => {
    controller.current?.setView(view);
  }, [view, status]);
  useEffect(() => {
    controller.current?.setEvening(evening);
  }, [evening, status]);
  const selected = campusDestinations.find((item) => item.id === hovered);
  const highlight = (id: string | null) => {
    setHovered(id);
    controller.current?.highlight(id);
  };
  const title =
    mode === "active"
      ? ar
        ? "حرم ميدكلب: ستة مجالات يجمعها مجتمع واحد"
        : "MedClub campus: six spaces, one community"
      : ar
        ? "حرمك في البداية: مبانٍ هادئة تنتظر أولى خطواتك"
        : "Your starting campus: quiet buildings awaiting your first steps";
  return (
    <div
      className="campus-scene"
      data-campus-mode={mode}
      data-campus-status={status}
      data-campus-light={evening ? "evening" : "golden"}
      data-campus-moving={
        mode === "active" && motion && visible && documentVisible
      }
    >
      <div className="campus-stage" ref={stage}>
        <img
          className="campus-poster"
          src={mode === "active" ? activePoster : dormantPoster}
          alt={title}
          width={1600}
          height={900}
          fetchPriority="high"
        />
        {mode === "active" && (
          <div className="campus-atmosphere" aria-hidden="true">
            <i className="campus-sun" />
            <i className="campus-warmth" />
          </div>
        )}
        <canvas
          key={`${mode}-${attempt}`}
          ref={canvas}
          className="campus-canvas"
          aria-hidden="true"
        />
        <div
          className="campus-controls"
          role="group"
          aria-label={ar ? "عرض الحرم" : "Campus view"}
        >
          {status !== "ready" ? (
            <button
              type="button"
              disabled={status === "loading"}
              onClick={() => {
                setRequested(true);
                setAttempt((a) => a + 1);
              }}
            >
              {status === "loading"
                ? ar
                  ? "جارٍ فتح الحرم…"
                  : "Opening campus…"
                : status === "failed"
                  ? ar
                    ? "إعادة محاولة العرض الثلاثي"
                    : "Retry 3D"
                  : ar
                    ? "استكشف بالعرض الثلاثي"
                    : "Explore in 3D"}
            </button>
          ) : (
            <>
              <button
                type="button"
                aria-label={ar ? "عرض من اليسار" : "View from the left"}
                disabled={view <= -2}
                onClick={() => setView((v) => v - 1)}
              >
                ←
              </button>
              <button type="button" onClick={() => setView(0)}>
                {ar ? "توسيط" : "Center"}
              </button>
              <button
                type="button"
                aria-label={ar ? "عرض من اليمين" : "View from the right"}
                disabled={view >= 2}
                onClick={() => setView((v) => v + 1)}
              >
                →
              </button>
              {mode === "active" && (
                <button
                  type="button"
                  aria-pressed={evening}
                  disabled={resolvedTheme === "dark"}
                  title={
                    resolvedTheme === "dark"
                      ? ar
                        ? "الإضاءة تتبع المظهر الداكن"
                        : "Lighting follows dark mode"
                      : undefined
                  }
                  onClick={() => setEvening(!evening)}
                >
                  {ar ? "أضواء المساء" : "Evening lights"}
                </button>
              )}
            </>
          )}
          {mode === "active" && (
            <button
              type="button"
              aria-pressed={!motion}
              onClick={() => setMotion((value) => !value)}
            >
              {motion
                ? ar
                  ? "إيقاف الحركة"
                  : "Pause motion"
                : ar
                  ? "تشغيل الحركة"
                  : "Play motion"}
            </button>
          )}
        </div>
        {links && (
          <span className="campus-explore-hint">
            {selected
              ? selected[locale]
              : ar
                ? "اختر مبنى وابدأ الاستكشاف"
                : "Choose a building. Find your place."}
          </span>
        )}
        <span className="campus-state-label">
          {mode === "active"
            ? ar
              ? "حرمك. ينبض بالحياة."
              : "Your campus, brought to life."
            : ar
              ? "مساحة لبدايتك"
              : "Room for your beginning"}
        </span>
        <span className="sr-only" role="status">
          {status === "failed"
            ? ar
              ? "العرض الثلاثي غير متاح. معاينة الحرم ظاهرة."
              : "3D is unavailable. The campus preview remains visible."
            : ""}
        </span>
      </div>
      {links && (
        <nav
          className="campus-destinations"
          aria-label={ar ? "مساحات الحرم" : "Campus destinations"}
        >
          {campusDestinations.map((item, i) => (
            <AppLink
              key={item.id}
              href={item.href}
              data-highlighted={hovered === item.id || undefined}
              onMouseEnter={() => highlight(item.id)}
              onMouseLeave={() => highlight(null)}
              onFocus={() => highlight(item.id)}
              onBlur={() => highlight(null)}
            >
              <span aria-hidden="true">0{i + 1}</span>
              {item[locale]}
              <span aria-hidden="true">↗</span>
            </AppLink>
          ))}
        </nav>
      )}
    </div>
  );
}
