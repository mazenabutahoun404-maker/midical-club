import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { campusDestinations, type CampusMode } from "./campus-state";
import type { CampusController } from "./campus-renderer";
import activePoster from "../../assets/campus/campus-active.webp";
import dormantPoster from "../../assets/campus/campus-dormant.webp";
import "./campus.css";

export function CampusScene({ mode = "active", links = true }: { mode?: CampusMode; links?: boolean }) {
  const { locale } = useLocale();
  const navigate = useNavigate();
  const ar = locale === "ar";
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controller = useRef<CampusController | null>(null);
  const inView = useRef(false);
  const [requested, setRequested] = useState(false);
  const [status, setStatus] = useState<"poster" | "loading" | "ready" | "failed">("poster");
  const [motion, setMotion] = useState(true);
  const [view, setView] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const navigateRef = useRef(navigate); navigateRef.current = navigate;
  const linksRef = useRef(links); linksRef.current = links;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const economy = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced.matches) setMotion(false);
    const eligible = !economy && !reduced.matches && window.matchMedia("(min-width: 768px)").matches;
    const observe = (visible: boolean) => {
      inView.current = visible; controller.current?.setVisible(visible);
      if (visible && eligible) setRequested(true);
    };
    if (typeof IntersectionObserver === "undefined") { observe(true); return; }
    const observer = new IntersectionObserver(([entry]) => observe(entry.isIntersecting), { threshold: .05 });
    if (stage.current) observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!requested || !canvas.current) return;
    const abort = new AbortController();
    let instance: CampusController | undefined;
    setStatus("loading");
    import("./campus-renderer").then(({ mountCampus }) => {
      if (abort.signal.aborted || !canvas.current) return;
      return mountCampus(canvas.current, {
        mode, signal: abort.signal,
        onChoose: id => {
          if (!linksRef.current) return;
          const destination = campusDestinations.find(item => item.id === id);
          if (destination) navigateRef.current(destination.href);
        },
        onFailure: () => { if (!abort.signal.aborted) setStatus("failed"); },
      });
    }).then(value => {
      if (!value) return;
      if (abort.signal.aborted) { value.dispose(); return; }
      instance = value; controller.current = value;
      value.setVisible(inView.current); setStatus("ready");
    }).catch(() => { if (!abort.signal.aborted) setStatus("failed"); });
    return () => { abort.abort(); instance?.dispose(); controller.current = null; };
  }, [requested, mode, attempt]);

  useEffect(() => { controller.current?.setMotion(motion && mode === "active"); }, [motion, status, mode]);
  useEffect(() => { controller.current?.setView(view); }, [view, status]);
  const title = mode === "active"
    ? (ar ? "حرم ميدكلب: ستة مجالات يجمعها مجتمع واحد" : "MedClub campus: six spaces, one community")
    : (ar ? "حرمك في البداية: مبانٍ هادئة تنتظر أولى خطواتك" : "Your starting campus: quiet buildings awaiting your first steps");
  return <div className="campus-scene" data-campus-mode={mode} data-campus-status={status}>
    <div className="campus-stage" ref={stage}>
      <img className="campus-poster" src={mode === "active" ? activePoster : dormantPoster} alt={title} width={1600} height={900} fetchPriority="high" />
      <canvas key={`${mode}-${attempt}`} ref={canvas} className="campus-canvas" aria-hidden="true" />
      <div className="campus-controls" role="group" aria-label={ar ? "عرض الحرم" : "Campus view"}>
        {status !== "ready" ? <button type="button" disabled={status === "loading"} onClick={() => { setRequested(true); setAttempt(a => a + 1); }}>
          {status === "loading" ? (ar ? "جارٍ فتح الحرم…" : "Opening campus…") : status === "failed" ? (ar ? "إعادة محاولة العرض الثلاثي" : "Retry 3D") : (ar ? "استكشف بالعرض الثلاثي" : "Explore in 3D")}
        </button> : <>
          <button type="button" aria-label={ar ? "عرض من اليسار" : "View from the left"} disabled={view <= -2} onClick={() => setView(v => v - 1)}>←</button>
          <button type="button" onClick={() => setView(0)}>{ar ? "توسيط" : "Center"}</button>
          <button type="button" aria-label={ar ? "عرض من اليمين" : "View from the right"} disabled={view >= 2} onClick={() => setView(v => v + 1)}>→</button>
          {mode === "active" && <button type="button" aria-pressed={!motion} onClick={() => setMotion(value => !value)}>{motion ? (ar ? "إيقاف الحركة" : "Pause motion") : (ar ? "تشغيل الحركة" : "Play motion")}</button>}
        </>}
      </div>
      <span className="campus-state-label">{mode === "active" ? (ar ? "حرم المجتمع" : "Community campus") : (ar ? "مساحة لبدايتك" : "Room for your beginning")}</span>
      <span className="sr-only" role="status">{status === "failed" ? (ar ? "العرض الثلاثي غير متاح. معاينة الحرم ظاهرة." : "3D is unavailable. The campus preview remains visible.") : ""}</span>
    </div>
    {links && <nav className="campus-destinations" aria-label={ar ? "مساحات الحرم" : "Campus destinations"}>
      {campusDestinations.map((item, i) => <AppLink key={item.id} href={item.href} onMouseEnter={() => controller.current?.highlight(item.id)} onMouseLeave={() => controller.current?.highlight(null)} onFocus={() => controller.current?.highlight(item.id)} onBlur={() => controller.current?.highlight(null)}>
        <span aria-hidden="true">0{i + 1}</span>{item[locale]}<span aria-hidden="true">↗</span>
      </AppLink>)}
    </nav>}
  </div>;
}
