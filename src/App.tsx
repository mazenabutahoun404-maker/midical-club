import { useState, useEffect, useRef, useCallback } from "react";
import coach1Img from "./assets/coach1.jpg";
import sub1Img from "./assets/sub11.jpg";
import sub11Img from "./assets/sub1.jpg";
import sub2Img from "./assets/sub2.jpg";
import sub22Img from "./assets/sub22.jpg";
import sub3Img from "./assets/sub3.jpg";
import sub33Img from "./assets/sub33.jpg";
import sub4Img from "./assets/sub4.jpg";
import sub44Img from "./assets/sub44.jpg";

import portalWall from "./assets/thaer-portal-wall.webp";
import riftWall from "./assets/thaer-rift-wall.webp";
import tunnelWall from "./assets/thaer-tunnel-wall.webp";
import vaultWall from "./assets/thaer-vault-wall.webp";
import destinationWall from "./assets/thaer-destination-wall.webp";

/* ============================================================
   كابتن ثائر — COACH THAER · v5 — OBSIDIAN ASCENSION
   A cinematic, mobile-first scroll narrative:
   portal entry, transformation rift, 3D coaching tunnel, generated
   environment walls, daily discipline ritual, persistent action dock,
   isolated rAF progress controllers, and complete reduced-motion fallbacks.
   ============================================================ */

const RED = "#FF2233";
const GOLD = "#D4AF37";
const BLACK = "#050505";
const ASH = "#8A8A8A";
const COACH_WHATSAPP = "962787614424"; // Replace with the real number before launch.

const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${COACH_WHATSAPP}?text=${encodeURIComponent(message)}`;

/* ----------------------------- DATA ----------------------------- */

export interface SubscriberData {
  id: number;
  name: string;
  beforeImg: string;
  afterImg: string;
  stats: {
    bodyFatBefore: number;
    bodyFatAfter: number;
    fatLoss: string;
    muscleGain: string;
    strengthMetric: string;
    timeframe: string;
  };
  quote: string;
}

const SUBSCRIBERS: SubscriberData[] = [
  {
    id: 1, name: "Alex Vance", beforeImg: sub1Img, afterImg: sub11Img,
    stats: { bodyFatBefore: 24.5, bodyFatAfter: 10.2, fatLoss: "-14.3 kg", muscleGain: "+5.8 kg", strengthMetric: "+35 kg BENCH", timeframe: "16 WKS" },
    quote: "The biomechanical approach completely rebuilt my posture, strength and body composition."
  },
  {
    id: 2, name: "Marcus Cole", beforeImg: sub2Img, afterImg: sub22Img,
    stats: { bodyFatBefore: 21.0, bodyFatAfter: 9.5, fatLoss: "-11.5 kg", muscleGain: "+4.2 kg", strengthMetric: "+45 kg SQUAT", timeframe: "12 WKS" },
    quote: "Dropped 11kg of pure fat while every compound lift went up. The precision is unreal."
  },
  {
    id: 3, name: "David Reyes", beforeImg: sub3Img, afterImg: sub33Img,
    stats: { bodyFatBefore: 26.0, bodyFatAfter: 11.8, fatLoss: "-16.2 kg", muscleGain: "+7.5 kg", strengthMetric: "+50 kg DEADLIFT", timeframe: "20 WKS" },
    quote: "Weekly video form analysis and custom targets made 20 weeks feel inevitable."
  },
  {
    id: 4, name: "Viktor Steel", beforeImg: sub4Img, afterImg: sub44Img,
    stats: { bodyFatBefore: 19.8, bodyFatAfter: 8.8, fatLoss: "-10.0 kg", muscleGain: "+4.9 kg", strengthMetric: "+30% POWER", timeframe: "14 WKS" },
    quote: "Competition-ready conditioning with full muscle. A master of his craft."
  }
];

const MANTRAS: Array<{ t: string; ar?: boolean }> = [
  { t: "NO SHORTCUTS" }, { t: "لا اختصارات", ar: true },
  { t: "EARN EVERY REP" }, { t: "استحق كل تكرار", ar: true },
  { t: "DISCIPLINE OVER MOOD" }, { t: "الانضباط قبل المزاج", ar: true },
  { t: "BUILT NOT BORN" }, { t: "يُبنى ولا يولد", ar: true },
];

/* real pricing — JOD primary, USD secondary; 3M Basic = 50 JOD (raised discount) */
type Duration = "1M" | "3M" | "6M" | "12M";
const DURATIONS: Array<{ key: Duration; label: string; months: number; save: string | null }> = [
  { key: "1M", label: "1 MONTH", months: 1, save: null },
  { key: "3M", label: "3 MONTHS", months: 3, save: "−17%" },
  { key: "6M", label: "6 MONTHS", months: 6, save: "−20%" },
  { key: "12M", label: "1 YEAR", months: 12, save: "−25%" },
];
const PRICES: Record<"basic" | "vip", Record<Duration, { jod: number; usd: number }>> = {
  basic: {
    "1M": { jod: 20, usd: 29 },
    "3M": { jod: 50, usd: 71 },
    "6M": { jod: 96, usd: 135 },
    "12M": { jod: 180, usd: 254 },
  },
  vip: {
    "1M": { jod: 30, usd: 42 },
    "3M": { jod: 75, usd: 106 },
    "6M": { jod: 144, usd: 203 },
    "12M": { jod: 270, usd: 381 },
  },
};

/* ----------------------------- HOOKS ----------------------------- */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);
  return reduced;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, [query]);

  return matches;
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return y;
}

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}


/**
 * Measures one tall scene only while it is close to the viewport.
 * This avoids a permanent global state update for every cinematic section.
 */
function usePinnedProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let listening = false;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const travel = Math.max(1, rect.height - window.innerHeight);
        const next = clamp01(-rect.top / travel);
        setProgress((previous) => Math.abs(previous - next) > 0.001 ? next : previous);
      });
    };

    const start = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      update();
    };

    const stop = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting ? start() : stop(),
      { rootMargin: "100% 0px 100% 0px" }
    );

    observer.observe(el);
    update();

    return () => {
      observer.disconnect();
      stop();
      cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, progress };
}

const range01 = (value: number, start: number, end: number) =>
  clamp01((value - start) / Math.max(0.0001, end - start));

const sceneOpacity = (value: number, start: number, end: number, edge = 0.055) => {
  const enter = start <= 0 ? 1 : range01(value, start, start + edge);
  const exit = end >= 1 ? 1 : 1 - range01(value, end - edge, end);
  return Math.min(enter, exit);
};

/* ------------------------ KINETIC PRIMITIVES ------------------------ */

/** Words punch up one by one when the block enters the viewport */
function PunchIn({ text, className = "", style = {}, stagger = 60, as: Tag = "div" }: {
  text: string; className?: string; style?: React.CSSProperties; stagger?: number; as?: any;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className} style={style} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden="true">
          <span className="inline-block will-change-transform"
            style={{
              transform: inView ? "translateY(0)" : "translateY(110%)",
              transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * stagger}ms`
            }}>
            {w}{"\u00A0"}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Number that counts up when it enters the viewport */
function CountUp({ to, suffix = "", duration = 1400, className = "", style = {} }: {
  to: number; suffix?: string; duration?: number; className?: string; style?: React.CSSProperties;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.5);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = clamp01((t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref} className={`tabular-nums ${className}`} style={style}>{val.toLocaleString()}{suffix}</span>;
}

/** Giant outlined word that fills as it crosses the viewport.
 * Uses CSS view timelines where supported, so it does not add another scroll listener. */
function FillWord({ word, ar, sub }: { word: string; ar: string; sub: string }) {
  return (
    <div className="fill-word relative py-12 sm:py-20 select-none overflow-hidden" style={{ background: BLACK }} aria-label={`${word} — ${sub}`}>
      <div aria-hidden="true" className="absolute inset-0 grid place-items-center pointer-events-none" dir="rtl"
        style={{ fontFamily: "'Changa', sans-serif", fontWeight: 800, fontSize: "clamp(5rem, 26vw, 19rem)", color: "rgba(212,175,55,0.05)", lineHeight: 1 }}>
        {ar}
      </div>
      <div className="relative mx-auto w-fit leading-none"
        style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(4rem, 18vw, 14rem)", letterSpacing: "0.02em" }}>
        <span aria-hidden="true" style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.22)" }}>{word}</span>
        <span aria-hidden="true" className="fill-word__ink absolute inset-0"
          style={{ color: RED, WebkitTextStroke: `1.5px ${RED}`, textShadow: "0 0 44px rgba(255,34,51,0.42)" }}>
          {word}
        </span>
      </div>
      <div className="fill-word__sub text-center mt-3 text-[10px] sm:text-xs tracking-[0.5em] uppercase font-bold"
        style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
        {sub}
      </div>
    </div>
  );
}

/** Infinite bilingual marquee */
function Marquee({ items, reverse = false, tone = "red", angled = false }: {
  items: Array<{ t: string; ar?: boolean }>; reverse?: boolean; tone?: "red" | "gold"; angled?: boolean;
}) {
  const row = [...items, ...items, ...items];
  const bg = tone === "red" ? RED : GOLD;
  return (
    <div className="relative overflow-hidden py-3 sm:py-4"
      style={{ background: bg, transform: angled ? "rotate(-2deg) scale(1.06)" : "none", borderTop: "2px solid #000", borderBottom: "2px solid #000" }}
      aria-hidden="true">
      <div className="flex whitespace-nowrap w-max items-center"
        style={{ animation: `thaer-marquee ${reverse ? 30 : 24}s linear infinite ${reverse ? "reverse" : ""}` }}>
        {row.map((m, i) => (
          <span key={i} className="mx-5 sm:mx-8 uppercase flex items-center gap-5 sm:gap-8"
            style={{
              color: "#0A0A0A",
              fontFamily: m.ar ? "'Changa', sans-serif" : "'Anton', sans-serif",
              fontWeight: m.ar ? 800 : 400,
              fontSize: m.ar ? "1.05rem" : "1rem",
              letterSpacing: m.ar ? "0" : "0.25em",
            }}>
            {m.t}
            <span style={{ color: "rgba(0,0,0,0.45)" }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- UI ATOMS --------------------------- */

function Cta({ children, tone = "red", onClick, block = false }: {
  children: React.ReactNode; tone?: "red" | "ghost" | "gold"; onClick?: () => void; block?: boolean;
}) {
  const base = "group relative overflow-hidden font-black uppercase text-[11px] sm:text-xs tracking-[0.3em] px-7 sm:px-9 py-4 transition-transform duration-300 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const style: React.CSSProperties =
    tone === "red"
      ? { background: RED, color: "#fff", clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }
      : tone === "gold"
        ? { background: GOLD, color: "#0A0A0A", clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)" }
        : { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" };
  return (
    <button onClick={onClick} className={`${base} ${block ? "w-full" : ""}`} style={{ ...style, fontFamily: "'Archivo', sans-serif", outlineColor: GOLD }}>
      <span aria-hidden="true" className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
        style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)" }} />
      <span className="relative">{children}</span>
    </button>
  );
}

function Eyebrow({ rep, label, ar }: { rep: string; label: string; ar: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8 flex-wrap">
      <span className="text-[10px] sm:text-xs font-black tracking-[0.3em] px-2.5 py-1"
        style={{ background: RED, color: "#fff", fontFamily: "'Archivo', sans-serif", clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
        REP {rep}
      </span>
      <span className="h-px flex-none w-6 sm:w-12" style={{ background: GOLD }} aria-hidden="true" />
      <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
        {label}
      </span>
      <span className="text-sm sm:text-base font-bold" dir="rtl" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Changa', sans-serif" }}>
        {ar}
      </span>
    </div>
  );
}

/**
 * Keeps portraits and transformation photos fully visible on wide screens.
 * A soft cover-sized echo fills any empty space without cropping the subject.
 */
function CinematicImage({
  src,
  alt,
  className = "",
  subjectClassName = "",
  subjectStyle = {},
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  subjectClassName?: string;
  subjectStyle?: React.CSSProperties;
  priority?: boolean;
}) {
  return (
    <div className={`cinematic-image relative overflow-hidden bg-black ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="cinematic-image__echo absolute inset-0 h-full w-full object-cover"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      <img
        src={src}
        alt={alt}
        className={`cinematic-image__subject relative z-[1] block h-full w-full object-contain ${subjectClassName}`}
        style={subjectStyle}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}

/* ------------------- EXPERIENCE LAYER + SCENE WRAPPER ------------------- */

function ExperienceLayer({ reduced }: { reduced: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const root = rootRef.current;
    if (!root) return;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty("--mx", `${event.clientX}px`);
        root.style.setProperty("--my", `${event.clientY}px`);
      });
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div ref={rootRef} className="experience-layer fixed inset-0 z-[2] pointer-events-none" aria-hidden="true">
      <div className="experience-layer__grid absolute inset-0" />
      <div className="experience-layer__aura absolute inset-0" />
      <div className="experience-layer__progress fixed top-0 left-0 h-[2px] origin-left" />
    </div>
  );
}

function SceneSection({ id, bg, index, children }: { id?: string; bg: string; index: string; children: React.ReactNode }) {
  const { ref, inView } = useInView<HTMLElement>(0.06);
  return (
    <section id={id} ref={ref} className={`experience-scene relative isolate ${inView ? "is-visible" : ""}`} style={{ background: bg }}>
      <div aria-hidden="true" className="experience-scene__index absolute top-6 right-4 sm:right-10">{index}</div>
      <div aria-hidden="true" className="experience-scene__seam absolute top-0 left-0 right-0 h-px" />
      {children}
    </section>
  );
}



function DisciplineRitual() {
  const today = new Date().toISOString().slice(0, 10);
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("thaer-discipline-history") || "[]");
    } catch {
      return [];
    }
  });
  const committed = history.includes(today);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().slice(0, 10);
  });
  const score = days.filter((day) => history.includes(day)).length;
  const message = score >= 6
    ? "You are no longer chasing motivation. You built a standard."
    : score >= 3
      ? "Momentum is visible. Protect it today."
      : "One honest session is enough to restart the machine.";

  const commit = () => {
    if (committed) return;
    const next = Array.from(new Set([...history, today])).slice(-45);
    setHistory(next);
    localStorage.setItem("thaer-discipline-history", JSON.stringify(next));
    navigator.vibrate?.(24);
  };

  return (
    <div className="relative overflow-hidden py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-10 lg:pl-24">
        <Eyebrow rep="04" label="THE RITUAL" ar="الانضباط" />
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-14 items-center">
          <div>
            <PunchIn as="h2" text="MOTIVATION OPENS THE DOOR. DISCIPLINE WALKS THROUGH IT."
              className="uppercase leading-[0.9]"
              style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.35rem, 8vw, 5.4rem)", color: "#fff" }} />
            <p className="max-w-xl mt-6 text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.64)", fontFamily: "'Archivo', sans-serif" }}>
              Leave a mark before you leave the site. This seven-day chain lives only on your device — a small ritual that turns browsing into a decision.
            </p>
          </div>

          <div className="ritual-card relative p-5 sm:p-7 overflow-hidden"
            style={{ background: "linear-gradient(145deg, rgba(255,34,51,0.12), rgba(255,255,255,0.025) 58%)", border: "1px solid rgba(255,255,255,0.14)" }}>
            <div aria-hidden="true" className="absolute -right-10 -top-14 w-44 h-44 rounded-full blur-3xl" style={{ background: "rgba(255,34,51,0.16)" }} />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="text-[9px] font-black tracking-[0.35em] uppercase" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>LAST 7 DAYS</div>
                <div className="mt-2 text-4xl sm:text-5xl leading-none" style={{ fontFamily: "'Anton', sans-serif" }}>
                  {score}<span style={{ color: ASH }}>/7</span>
                </div>
              </div>
              <div className="ritual-ring w-20 h-20 sm:w-24 sm:h-24 rounded-full grid place-items-center" style={{ background: `conic-gradient(${RED} ${(score / 7) * 360}deg, rgba(255,255,255,0.08) 0deg)` }}>
                <div className="w-[82%] h-[82%] rounded-full grid place-items-center text-[9px] font-black tracking-[0.2em] text-center" style={{ background: "#080808", color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
                  SHOW<br />UP
                </div>
              </div>
            </div>

            <div className="relative grid grid-cols-7 gap-2 mt-7" aria-label={`${score} completed days in the last seven days`}>
              {days.map((day, i) => {
                const done = history.includes(day);
                return (
                  <div key={day} className="text-center">
                    <div className="aspect-square rounded-lg grid place-items-center transition-all" style={{ background: done ? RED : "rgba(255,255,255,0.05)", border: `1px solid ${done ? RED : "rgba(255,255,255,0.1)"}`, boxShadow: done ? "0 0 18px rgba(255,34,51,0.28)" : "none" }}>
                      <span className="text-[10px] font-black" style={{ color: done ? "#fff" : "rgba(255,255,255,0.32)", fontFamily: "'Archivo', sans-serif" }}>{i + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="relative mt-6 min-h-10 text-sm leading-relaxed" aria-live="polite" style={{ color: "rgba(255,255,255,0.74)", fontFamily: "'Archivo', sans-serif" }}>{message}</p>
            <button disabled={committed} onClick={commit} className="relative mt-5 w-full min-h-14 rounded-xl text-[10px] sm:text-xs font-black tracking-[0.28em] uppercase transition-all active:scale-[0.98] disabled:cursor-default"
              style={{ background: committed ? "rgba(212,175,55,0.16)" : RED, color: committed ? GOLD : "#fff", border: `1px solid ${committed ? "rgba(212,175,55,0.5)" : RED}`, fontFamily: "'Archivo', sans-serif" }}>
              {committed ? "TODAY IS MARKED ✓" : "I SHOWED UP TODAY"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* =====================================================================
   OBSIDIAN ASCENSION — three different scroll grammars
   ===================================================================== */

function StaticWall({ image, children, id }: { image: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="relative isolate overflow-hidden px-4 py-24 sm:px-10 sm:py-32">
      <img src={image} alt="" aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/65" />
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}

/** Scene 1: a long vertical scroll physically opens the environment. */
function AscensionPortal({ reduced, onGo }: { reduced: boolean; onGo: (id: string) => void }) {
  const { ref, progress } = usePinnedProgress<HTMLElement>();
  const SCENES = [
    { eyebrow: "THE THRESHOLD", title: "YOU DIDN'T COME HERE TO BROWSE.", ar: "أنت هنا لتتغيّر", body: "This is not a catalogue of workouts. It is the point where intention becomes a measurable system." },
    { eyebrow: "THE DECISION", title: "MOTIVATION IS ALLOWED TO DISAPPEAR.", ar: "النظام يبقى", body: "Your plan must keep moving on the days when your mood does not. That is what coaching is built to do." },
    { eyebrow: "THE STANDARD", title: "EVERY REP LEAVES EVIDENCE.", ar: "كل تكرار يصنع دليلاً", body: "Execution, recovery, nutrition and feedback are not separate. They are one closed loop." },
    { eyebrow: "THE ENTRY", title: "STEP IN. THE OLD VERSION STAYS OUTSIDE.", ar: "ادخل واترك النسخة القديمة", body: "Scroll through the gate. The next sections show the method, the proof and the commitment." },
  ];

  if (reduced) {
    return (
      <StaticWall id="journey" image={portalWall}>
        <Eyebrow rep="00" label="THE ENTRY" ar="بوابة البداية" />
        <div className="grid gap-5 md:grid-cols-2">
          {SCENES.map((scene, index) => (
            <article key={scene.title} className="border border-white/15 bg-black/65 p-6 backdrop-blur-md">
              <div className="mb-4 text-[10px] font-black tracking-[0.35em]" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>0{index + 1} · {scene.eyebrow}</div>
              <h2 className="text-3xl leading-[0.92]" style={{ fontFamily: "'Anton', sans-serif" }}>{scene.title}</h2>
              <div className="mt-3 text-lg font-bold" dir="rtl" style={{ color: GOLD, fontFamily: "'Changa', sans-serif" }}>{scene.ar}</div>
              <p className="mt-4 text-sm leading-relaxed text-white/65" style={{ fontFamily: "'Archivo', sans-serif" }}>{scene.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8"><Cta tone="red" onClick={() => onGo("manifesto")}>ENTER THE METHOD</Cta></div>
      </StaticWall>
    );
  }

  const door = range01(progress, 0.02, 0.24);
  const ignition = range01(progress, 0.7, 0.98);

  return (
    <section ref={ref} id="journey" className="relative h-[390svh]" aria-label="The coaching entry sequence">
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: BLACK }}>
        <img
          src={portalWall}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{
            transform: `scale(${1.17 - progress * 0.13}) translateY(${-progress * 2.5}%)`,
            filter: `brightness(${0.58 + progress * 0.3}) saturate(${0.9 + progress * 0.25})`,
          }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.62),rgba(0,0,0,.14)_42%,rgba(0,0,0,.82))]" />
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[54%] origin-left will-change-transform"
          style={{ background: "linear-gradient(90deg,#020202 0%,rgba(2,2,2,.98) 75%,rgba(2,2,2,.55) 100%)", clipPath: "polygon(0 0,100% 0,84% 100%,0 100%)", transform: `translateX(${-door * 94}%)` }} />
        <div aria-hidden="true" className="absolute inset-y-0 right-0 w-[54%] origin-right will-change-transform"
          style={{ background: "linear-gradient(270deg,#020202 0%,rgba(2,2,2,.98) 75%,rgba(2,2,2,.55) 100%)", clipPath: "polygon(0 0,100% 0,100% 100%,16% 100%)", transform: `translateX(${door * 94}%)` }} />

        <div aria-hidden="true" className="absolute left-1/2 top-0 h-full -translate-x-1/2"
          style={{ width: `${2 + door * 12}px`, background: `linear-gradient(180deg,transparent,${GOLD},#fff,${RED},transparent)`, boxShadow: `0 0 ${18 + door * 72}px rgba(212,175,55,.8)`, opacity: 0.4 + door * 0.6 }} />
        <div aria-hidden="true" className="portal-orbit absolute left-1/2 top-[44%] h-[58vw] max-h-[520px] w-[58vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d4af3759]"
          style={{ transform: `translate(-50%,-50%) rotate(${progress * 140}deg) scale(${0.72 + door * 0.34})`, opacity: 0.12 + door * 0.42 }} />
        <div aria-hidden="true" className="portal-orbit portal-orbit--inner absolute left-1/2 top-[44%] h-[42vw] max-h-[380px] w-[42vw] max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
          style={{ transform: `translate(-50%,-50%) rotate(${-progress * 190}deg) scale(${0.78 + door * 0.25})`, opacity: 0.1 + door * 0.3 }} />

        <div className="absolute inset-0 z-10 mx-auto flex max-w-6xl items-center px-4 sm:px-10">
          {SCENES.map((scene, index) => {
            const start = index / SCENES.length;
            const end = (index + 1) / SCENES.length;
            const opacity = sceneOpacity(progress, start, end, 0.07);
            const local = range01(progress, start, end);
            return (
              <article key={scene.title} className="absolute left-4 right-4 sm:left-10 sm:right-10" style={{ opacity, transform: `translateY(${(0.5 - local) * 46}px) scale(${0.97 + opacity * 0.03})`, pointerEvents: opacity > 0.65 ? "auto" : "none" }}>
                <div className="max-w-4xl">
                  <div className="mb-5 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.42em] sm:text-[11px]" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
                    <span className="h-px w-8" style={{ background: RED }} />
                    0{index + 1} / 04 · {scene.eyebrow}
                  </div>
                  <h2 className="max-w-4xl text-[clamp(3.2rem,13vw,8.5rem)] leading-[0.84] tracking-[-0.02em]" style={{ fontFamily: "'Anton', sans-serif", textShadow: "0 20px 70px rgba(0,0,0,.8)" }}>{scene.title}</h2>
                  <div className="mt-4 text-xl font-bold sm:text-3xl" dir="rtl" style={{ color: GOLD, fontFamily: "'Changa', sans-serif" }}>{scene.ar}</div>
                  <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/68 sm:text-base" style={{ fontFamily: "'Archivo', sans-serif" }}>{scene.body}</p>
                  {index === 3 && (
                    <div className="mt-7" style={{ opacity: ignition }}>
                      <Cta tone="red" onClick={() => onGo("manifesto")}>ENTER THE METHOD</Cta>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="absolute bottom-5 left-4 right-4 z-20 flex items-end justify-between sm:left-10 sm:right-10">
          <div>
            <div className="text-[8px] font-black tracking-[0.35em] text-white/45" style={{ fontFamily: "'Archivo', sans-serif" }}>ASCENSION DEPTH</div>
            <div className="mt-2 h-[2px] w-36 overflow-hidden bg-white/15 sm:w-56"><div className="h-full origin-left" style={{ background: `linear-gradient(90deg,${GOLD},${RED})`, transform: `scaleX(${progress})` }} /></div>
          </div>
          <div className="text-4xl tabular-nums sm:text-6xl" style={{ fontFamily: "'Anton', sans-serif", color: "rgba(255,255,255,.25)" }}>{Math.round(progress * 100).toString().padStart(2, "0")}</div>
        </div>
      </div>
    </section>
  );
}

/** Scene 2: each client is reconstructed through a luminous split. */
function TransformationRift({ reduced }: { reduced: boolean }) {
  const { ref, progress } = usePinnedProgress<HTMLElement>();

  if (reduced) {
    return (
      <StaticWall image={riftWall}>
        <Eyebrow rep="02" label="THE RIFT" ar="التحول" />
        <div className="grid gap-5 sm:grid-cols-2">
          {SUBSCRIBERS.map((subscriber) => (
            <article key={subscriber.id} className="overflow-hidden border border-white/15 bg-black/70">
              <div className="grid grid-cols-2">
                <img src={subscriber.beforeImg} alt={`${subscriber.name} before`} className="aspect-[3/4] h-full w-full object-cover object-center grayscale" />
                <img src={subscriber.afterImg} alt={`${subscriber.name} after`} className="aspect-[3/4] h-full w-full object-cover object-center" />
              </div>
              <div className="p-5"><h3 className="text-2xl" style={{ fontFamily: "'Anton', sans-serif" }}>{subscriber.name}</h3><p className="mt-2 text-xs text-white/60">{subscriber.stats.timeframe}</p></div>
            </article>
          ))}
        </div>
      </StaticWall>
    );
  }

  return (
    <section ref={ref} className="relative h-[420svh]" aria-label="Transformation evidence sequence">
      <div className="sticky top-0 h-[100svh] overflow-hidden" style={{ background: BLACK }}>
        <img src={riftWall} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" style={{ transform: `scale(${1.08 + progress * 0.04})`, filter: `brightness(${0.48 + progress * 0.13})` }} />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,.18)_40%,rgba(0,0,0,.86)_100%)]" />
        <div aria-hidden="true" className="absolute left-1/2 top-0 h-full -translate-x-1/2" style={{ width: `${2 + Math.sin(progress * Math.PI) * 11}px`, background: `linear-gradient(180deg,transparent,${GOLD},#fff,${RED},transparent)`, boxShadow: `0 0 42px ${GOLD}`, opacity: 0.75 }} />

        <div className="absolute inset-x-0 top-6 z-20 px-4 sm:top-10 sm:px-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div><div className="text-[9px] font-black tracking-[0.42em]" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>SCROLL-CONTROLLED EVIDENCE</div><div className="mt-1 text-sm text-white/45">The split closes as the work becomes visible.</div></div>
            <div className="text-5xl text-white/20 sm:text-7xl" style={{ fontFamily: "'Anton', sans-serif" }}>{String(Math.min(SUBSCRIBERS.length, Math.floor(progress * SUBSCRIBERS.length) + 1)).padStart(2, "0")}</div>
          </div>
        </div>

        {SUBSCRIBERS.map((subscriber, index) => {
          const start = index / SUBSCRIBERS.length;
          const end = (index + 1) / SUBSCRIBERS.length;
          const local = range01(progress, start, end);
          const opacity = sceneOpacity(progress, start, end, 0.055);
          const reveal = range01(local, 0.12, 0.82);
          return (
            <article key={subscriber.id} className="absolute inset-0 z-10 flex items-center justify-center px-4 pt-16 sm:px-10" style={{ opacity, pointerEvents: opacity > 0.7 ? "auto" : "none" }}>
              <div className="grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.2fr_.8fr] lg:gap-12">
                <div className="relative mx-auto h-[54svh] min-h-[360px] w-full max-w-[680px] overflow-hidden border border-white/20 bg-black shadow-[0_40px_110px_rgba(0,0,0,.75)]">
                  <img
                    src={subscriber.beforeImg}
                    alt={`${subscriber.name} before coaching`}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    style={{ filter: `grayscale(1) brightness(${0.58 + reveal * 0.1}) contrast(1.12)` }}
                  />
                  <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - reveal * 100}% 0 0)` }}>
                    <img
                      src={subscriber.afterImg}
                      alt={`${subscriber.name} after coaching`}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      style={{ filter: "contrast(1.1) saturate(1.08)" }}
                    />
                  </div>
                  <div aria-hidden="true" className="absolute inset-y-0 z-20 w-[2px]" style={{ left: `${reveal * 100}%`, background: `linear-gradient(${GOLD},#fff,${RED})`, boxShadow: `0 0 24px ${RED}` }} />
                  <span className="absolute bottom-4 left-4 z-30 bg-black/80 px-3 py-2 text-[9px] font-black tracking-[0.25em]">DAY ONE</span>
                  <span className="absolute bottom-4 right-4 z-30 px-3 py-2 text-[9px] font-black tracking-[0.25em]" style={{ background: RED }}>{subscriber.stats.timeframe}</span>
                </div>

                <div style={{ transform: `translateY(${(0.5 - local) * 35}px)` }}>
                  <div className="text-[9px] font-black tracking-[0.4em]" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>ATHLETE 0{index + 1}</div>
                  <h2 className="mt-3 text-[clamp(3.3rem,11vw,7rem)] leading-[0.86]" style={{ fontFamily: "'Anton', sans-serif" }}>{subscriber.name}</h2>
                  <p className="mt-5 max-w-md text-sm italic leading-relaxed text-white/68 sm:text-base">“{subscriber.quote}”</p>
                </div>
              </div>
            </article>
          );
        })}

        <div className="absolute bottom-4 left-4 right-4 z-30 flex gap-2 sm:left-10 sm:right-10">
          {SUBSCRIBERS.map((subscriber, index) => {
            const active = progress >= index / SUBSCRIBERS.length && (index === SUBSCRIBERS.length - 1 || progress < (index + 1) / SUBSCRIBERS.length);
            return <div key={subscriber.id} className="h-[3px] flex-1 overflow-hidden bg-white/15"><div className="h-full origin-left transition-transform duration-300" style={{ background: active ? RED : GOLD, transform: `scaleX(${progress >= (index + 1) / SUBSCRIBERS.length ? 1 : active ? range01(progress, index / SUBSCRIBERS.length, (index + 1) / SUBSCRIBERS.length) : 0})` }} /></div>;
          })}
        </div>
      </div>
    </section>
  );
}

/** Scene 3: vertical scrolling becomes forward movement through a 3D tunnel. */
function SystemTunnel({ reduced }: { reduced: boolean }) {
  const { ref, progress } = usePinnedProgress<HTMLElement>();
  const PHASES = [
    { n: "01", t: "INTAKE", ar: "التقييم", d: "Goals, history, measurements and lifestyle. Nothing is guessed before the first plan is written.", signal: "READ THE MACHINE" },
    { n: "02", t: "BLUEPRINT", ar: "الخطة", d: "Training and nutrition are engineered around your body, schedule, ability and actual target.", signal: "BUILD THE ROUTE" },
    { n: "03", t: "FEEDBACK LOOP", ar: "المتابعة", d: "Execution is reviewed. Errors, fatigue and progress become instructions for the next adjustment.", signal: "CORRECT THE COURSE" },
    { n: "04", t: "ADAPTATION", ar: "التطوير", d: "The system changes as you change. The goal is not a static PDF; it is controlled evolution.", signal: "BECOME THE RESULT" },
  ];

  if (reduced) {
    return (
      <StaticWall id="system" image={tunnelWall}>
        <Eyebrow rep="03" label="THE SYSTEM" ar="النظام" />
        <div className="grid gap-4 sm:grid-cols-2">
          {PHASES.map((phase) => <article key={phase.n} className="border border-white/15 bg-black/70 p-6"><div className="text-5xl text-white/20" style={{ fontFamily: "'Anton', sans-serif" }}>{phase.n}</div><h2 className="mt-3 text-3xl" style={{ fontFamily: "'Anton', sans-serif" }}>{phase.t}</h2><div className="text-xl font-bold" dir="rtl" style={{ color: GOLD, fontFamily: "'Changa', sans-serif" }}>{phase.ar}</div><p className="mt-4 text-sm leading-relaxed text-white/60">{phase.d}</p></article>)}
        </div>
      </StaticWall>
    );
  }

  const phaseFloat = progress * (PHASES.length - 1);
  const active = Math.min(PHASES.length - 1, Math.round(phaseFloat));

  return (
    <section ref={ref} id="system" className="relative h-[500svh]" aria-label="The coaching system tunnel">
      <div className="sticky top-0 h-[100svh] overflow-hidden [perspective:1100px]" style={{ background: BLACK }}>
        <img src={tunnelWall} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover will-change-transform" style={{ transform: `scale(${1.14 - progress * 0.09}) translateY(${-progress * 3}%)`, filter: `brightness(${0.43 + progress * 0.16}) contrast(1.08)` }} />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.75),rgba(0,0,0,.14)_45%,rgba(0,0,0,.82))]" />
        <div aria-hidden="true" className="absolute bottom-0 left-1/2 h-[55%] w-[70%] -translate-x-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,.22),transparent_67%)]" />

        <div className="absolute left-4 top-5 z-30 sm:left-10 sm:top-9">
          <div className="text-[9px] font-black tracking-[0.42em]" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>VERTICAL SCROLL / FORWARD MOTION</div>
          <h2 className="mt-2 text-4xl leading-none sm:text-6xl" style={{ fontFamily: "'Anton', sans-serif" }}>THE SYSTEM TUNNEL.</h2>
        </div>

        <div className="absolute inset-0 z-20 [transform-style:preserve-3d]">
          {PHASES.map((phase, index) => {
            const distance = index - phaseFloat;
            const absolute = Math.abs(distance);
            const opacity = clamp01(1 - absolute * 0.72);
            const scale = Math.max(0.65, 1 - absolute * 0.13);
            return (
              <article key={phase.n} className="absolute left-4 right-4 top-[35%] mx-auto max-w-3xl border border-white/15 bg-black/65 p-5 shadow-[0_35px_100px_rgba(0,0,0,.8)] backdrop-blur-xl will-change-transform sm:left-10 sm:right-10 sm:p-8"
                style={{
                  opacity,
                  transform: `translate3d(0,${distance * 39}svh,${-absolute * 250}px) rotateX(${distance * -13}deg) scale(${scale})`,
                  zIndex: 20 - Math.round(absolute * 4),
                  pointerEvents: absolute < 0.48 ? "auto" : "none",
                  borderColor: absolute < 0.48 ? "rgba(212,175,55,.65)" : "rgba(255,255,255,.12)",
                }}>
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="text-[9px] font-black tracking-[0.35em]" style={{ color: RED, fontFamily: "'Archivo', sans-serif" }}>{phase.signal}</div>
                    <h3 className="mt-3 text-[clamp(3rem,12vw,6.7rem)] leading-[0.82]" style={{ fontFamily: "'Anton', sans-serif" }}>{phase.t}</h3>
                    <div className="mt-2 text-2xl font-bold" dir="rtl" style={{ color: GOLD, fontFamily: "'Changa', sans-serif" }}>{phase.ar}</div>
                  </div>
                  <span className="text-7xl leading-none text-white/10 sm:text-9xl" style={{ fontFamily: "'Anton', sans-serif" }}>{phase.n}</span>
                </div>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/68 sm:text-base">{phase.d}</p>
                <div className="mt-6 h-px overflow-hidden bg-white/10"><div className="h-full origin-left" style={{ background: `linear-gradient(90deg,${RED},${GOLD})`, transform: `scaleX(${absolute < 0.55 ? 1 - absolute : 0})` }} /></div>
              </article>
            );
          })}
        </div>

        <div className="absolute bottom-5 left-4 right-4 z-30 flex items-end justify-between sm:left-10 sm:right-10">
          <div className="flex gap-2">
            {PHASES.map((phase, index) => <div key={phase.n} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rotate-45 border transition-all" style={{ borderColor: index === active ? GOLD : "rgba(255,255,255,.2)", background: index === active ? RED : "transparent", boxShadow: index === active ? `0 0 18px ${RED}` : "none" }} /><span className="hidden text-[8px] font-black tracking-[0.25em] text-white/45 sm:inline">{phase.t}</span></div>)}
          </div>
          <div className="text-right"><div className="text-[8px] font-black tracking-[0.3em] text-white/40">DISTANCE</div><div className="text-4xl tabular-nums sm:text-5xl" style={{ color: GOLD, fontFamily: "'Anton', sans-serif" }}>{Math.round(progress * 100)}%</div></div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------ INTRO FILM SEQUENCE ------------------------ */

function FilmIntro({ done, onDone, reduced }: { done: boolean; onDone: () => void; reduced: boolean }) {
  const WORDS: Array<[string, string]> = [["DECIDE.", "قرّر"], ["COMMIT.", "التزم"], ["BECOME.", "تغيّر"]];
  const [idx, setIdx] = useState(0);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    if (reduced) { onDone(); return; }
    const t1 = setTimeout(() => setIdx(1), 320);
    const t2 = setTimeout(() => setIdx(2), 640);
    const t3 = setTimeout(() => setExit(true), 1020);
    const t4 = setTimeout(() => onDone(), 1450);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone, reduced]);

  const skip = () => { setExit(true); setTimeout(onDone, 420); };
  if (done) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      style={{ background: "#020202", transform: exit ? "translateY(-100%)" : "translateY(0)", transition: "transform 0.42s cubic-bezier(0.77,0,0.18,1)" }}>
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)" }} />
      <button onClick={skip} className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] px-3 py-2 text-[9px] font-black tracking-[0.28em] uppercase"
        style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.16)", fontFamily: "'Archivo', sans-serif" }}>SKIP</button>
      <div className="relative text-center px-6">
        <div className="text-[9px] tracking-[0.55em] uppercase mb-6 font-bold" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
          COACH THAER · THE MOMENTUM METHOD
        </div>
        <div key={idx} style={{ animation: "thaer-flash 0.32s cubic-bezier(0.16,1,0.3,1)" }}>
          <div className="leading-none" style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(3rem, 13vw, 9rem)", color: idx === 2 ? RED : "#fff", textShadow: idx === 2 ? "0 0 60px rgba(255,34,51,0.6)" : "none" }}>
            {WORDS[idx][0]}
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold" dir="rtl" style={{ fontFamily: "'Changa', sans-serif", color: GOLD }}>
            {WORDS[idx][1]}
          </div>
        </div>
        <div className="mx-auto mt-8 h-[2px] w-40 overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
          <div className="h-full" style={{ background: RED, animation: "thaer-load 1.25s linear forwards" }} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- NAV ------------------------------- */

function Nav({ onGo }: { onGo: (id: string) => void }) {
  const y = useScrollY();
  const [open, setOpen] = useState(false);
  const solid = y > 40;
  const LINKS: Array<[string, string]> = [
    ["hero", "OPENING"], ["manifesto", "THE COACH"], ["proof", "PROOF"], ["system", "THE SYSTEM"], ["videos", "VIDEOS"], ["plans", "JOIN"],
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 transition-all duration-500"
        style={{
          background: solid ? "rgba(4,4,4,0.9)" : "transparent",
          backdropFilter: solid ? "blur(14px)" : "none",
          borderBottom: solid ? "1px solid rgba(212,175,55,0.25)" : "1px solid transparent"
        }}>
        <button onClick={() => onGo("hero")} className="flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2" style={{ outlineColor: GOLD }}>
          <span className="w-2.5 h-2.5" style={{ background: RED, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} aria-hidden="true" />
          <span className="text-lg sm:text-xl tracking-[0.18em]" style={{ fontFamily: "'Anton', sans-serif", color: "#fff" }}>
            THAER<span style={{ color: RED }}>.</span>
          </span>
          <span className="text-sm sm:text-base font-bold mt-0.5" dir="rtl" style={{ fontFamily: "'Changa', sans-serif", color: GOLD }}>
            كابتن ثائر
          </span>
        </button>

        <div className="hidden md:flex items-center gap-7 text-[10px] font-bold tracking-[0.35em] uppercase" style={{ fontFamily: "'Archivo', sans-serif" }}>
          {LINKS.slice(1).map(([id, label]) => (
            <button key={id} onClick={() => onGo(id)} className="text-neutral-400 hover:text-white transition-colors relative group focus-visible:outline focus-visible:outline-2" style={{ outlineColor: GOLD }}>
              {label}
              <span aria-hidden="true" className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full transition-all duration-300" style={{ background: RED }} />
            </button>
          ))}
          <button onClick={() => onGo("plans")}
            className="px-5 py-2.5 font-black text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2"
            style={{ background: RED, clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)", outlineColor: GOLD }}>
            START NOW
          </button>
        </div>

        <button className="md:hidden relative w-10 h-10 flex flex-col items-end justify-center gap-[6px] focus-visible:outline focus-visible:outline-2"
          style={{ outlineColor: GOLD }} onClick={() => setOpen(true)} aria-label="Open menu">
          <span className="block h-[2px] w-7" style={{ background: "#fff" }} />
          <span className="block h-[2px] w-5" style={{ background: RED }} />
          <span className="block h-[2px] w-7" style={{ background: GOLD }} />
        </button>
      </nav>

      <div className="fixed inset-0 z-[150] md:hidden transition-transform duration-500"
        style={{ background: "#040404", transform: open ? "translateX(0)" : "translateX(100%)", transitionTimingFunction: "cubic-bezier(0.77,0,0.18,1)" }}
        aria-hidden={!open}>
        <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 text-center pointer-events-none select-none overflow-hidden" dir="rtl"
          style={{ fontFamily: "'Changa', sans-serif", fontWeight: 800, fontSize: "34vw", lineHeight: 0.9, color: "rgba(255,34,51,0.06)" }}>
          ثائر
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg tracking-[0.18em]" style={{ fontFamily: "'Anton', sans-serif", color: "#fff" }}>THAER<span style={{ color: RED }}>.</span></span>
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="w-10 h-10 grid place-items-center focus-visible:outline focus-visible:outline-2" style={{ outlineColor: GOLD }}>
            <svg className="w-7 h-7" fill="none" stroke={RED} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex flex-col justify-center h-[calc(100%_-_120px)] px-6 gap-1 relative z-10">
          {LINKS.map(([id, label], i) => (
            <button key={id} onClick={() => { setOpen(false); setTimeout(() => onGo(id), 350); }}
              className="text-left py-2 group focus-visible:outline focus-visible:outline-2" style={{ outlineColor: GOLD }}>
              <span className="text-[10px] font-black tracking-[0.4em] mr-4 align-middle" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
                0{i + 1}
              </span>
              <span className="align-middle uppercase leading-none group-active:text-red-500 transition-colors"
                style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.2rem, 10vw, 4rem)", color: "#fff", letterSpacing: "0.03em" }}>
                {label}
              </span>
            </button>
          ))}
        </div>
        <div className="px-6 pb-8 text-[10px] font-bold tracking-[0.4em] uppercase relative z-10" style={{ color: ASH, fontFamily: "'Archivo', sans-serif" }}>
          NO SHORTCUTS ✦ لا اختصارات
        </div>
      </div>
    </>
  );
}

/* ===================================================================
   HERO — THE FULL POSTER, ALWAYS VISIBLE
   =================================================================== */

function Hero({ onGo }: { onGo: (id: string) => void; reduced?: boolean; introDone?: boolean }) {
  const settled = true;

  return (
    <header id="hero" className="hero-shell relative h-[100svh] min-h-[580px] overflow-hidden" style={{ background: BLACK }}>
      <div className="hero-media absolute inset-0">
        <CinematicImage
          src={coach1Img}
          alt="Coach Thaer — كابتن ثائر"
          className="hero-poster h-full w-full"
          subjectClassName="object-[43%_12%] md:object-center"
          priority
        />
      </div>

      <div aria-hidden="true" className="hero-frame absolute inset-3 sm:inset-6 pointer-events-none" />
      <div aria-hidden="true" className="hero-frame__label absolute left-4 top-[68px] sm:left-10 sm:top-[94px] px-2 py-1 text-[7px] font-black tracking-[0.3em]" style={{ color: GOLD, background: "rgba(4,4,4,.68)", fontFamily: "'Archivo', sans-serif" }}>
        FULL FRAME / 001
      </div>

      <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(3,3,3,0.62) 0%, transparent 23%, rgba(3,3,3,0.05) 48%, rgba(3,3,3,0.96) 94%)" }} />
      <div aria-hidden="true" className="hero-scan absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-overlay" />
      <div aria-hidden="true" className="absolute left-4 sm:left-10 top-[18%] h-[42%] w-px" style={{ background: `linear-gradient(180deg, transparent, ${GOLD}, ${RED}, transparent)` }} />

      <div className="absolute inset-x-0 top-[18%] px-4 sm:px-10 z-20">
        <div className="max-w-7xl mx-auto flex justify-end">
          <div className="hero-command hidden sm:block max-w-[230px] p-4 backdrop-blur-md" style={{ background: "rgba(3,3,3,0.42)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="text-[8px] font-black tracking-[0.35em] uppercase" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>TODAY'S COMMAND</div>
            <div className="mt-2 text-xl leading-tight" style={{ fontFamily: "'Anton', sans-serif" }}>DO THE REP YOUR MOOD IS TRYING TO AVOID.</div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-4 sm:px-10 pb-4 sm:pb-10 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-3">
            <span className="w-2 h-2 rounded-full hero-live-dot" style={{ background: RED, boxShadow: `0 0 12px ${RED}` }} aria-hidden="true" />
            <span className="text-[8px] sm:text-xs font-bold tracking-[0.38em] sm:tracking-[0.42em] uppercase" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
              ONLINE COACHING · BUILT AROUND YOU
            </span>
          </div>

          <h1 className="leading-[0.84] uppercase" style={{ fontFamily: "'Anton', sans-serif" }}>
            <span className="block overflow-hidden"><span className="block hero-title-line" style={{ fontSize: "clamp(2.1rem, 9.5vw, 8rem)", color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.92)" }}>BUILD THE</span></span>
            <span className="block overflow-hidden"><span className="block hero-title-line" style={{ fontSize: "clamp(2.5rem, 11.5vw, 9.6rem)", color: RED, textShadow: "0 12px 60px rgba(255,34,51,0.34)" }}>STANDARD</span></span>
          </h1>

          <div className="mt-3 sm:mt-6 grid gap-4 sm:gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid grid-cols-3 gap-2 sm:gap-8 max-w-xl">
              {[[1200, "+", "TRANSFORMED"], [10, "+", "YEARS"], [180, "+", "ACTIVE"]].map(([n, s, l]) => (
                <div key={l as string} className="hero-stat">
                  <div className="text-lg sm:text-4xl leading-none" style={{ fontFamily: "'Anton', sans-serif", color: "#fff" }}><CountUp to={n as number} suffix={s as string} /></div>
                  <div className="text-[7px] sm:text-[9px] font-bold tracking-[0.2em] sm:tracking-[0.24em] mt-1" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>{l}</div>
                </div>
              ))}
            </div>
            <div className="hidden md:flex flex-wrap gap-3">
              <Cta tone="red" onClick={() => onGo("plans")}>START THE WORK</Cta>
              <Cta tone="ghost" onClick={() => onGo("proof")}>SEE THE PROOF</Cta>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none" aria-hidden="true">
        <span className="block w-px h-7 overflow-hidden" style={{ background: "rgba(255,255,255,0.25)" }}><span className="block w-full h-3" style={{ background: RED, animation: "thaer-drip 1.4s ease-in-out infinite" }} /></span>
      </div>
    </header>
  );
}

/* --------------------------- MANIFESTO --------------------------- */

function Manifesto() {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  const PILLARS = [
    { n: "A", t: "BIOMECHANICS FIRST", d: "Exercise selection built around your joint structure. Perfect load paths, zero junk volume, no avoidable injuries." },
    { n: "B", t: "EVIDENCE, NOT HYPE", d: "Nutrition engineered from your metabolic profile — plus supplement guidance that's earned, not sold." },
    { n: "C", t: "BRUTAL ACCOUNTABILITY", d: "Weight, photos and measurements tracked. Form reviewed, errors corrected, follow-up until the goal is reached." },
  ];

  return (
    <div className="relative overflow-hidden">
      <img src={vaultWall} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,.98),rgba(5,5,5,.72)_48%,rgba(5,5,5,.9))]" />
      <div aria-hidden="true" className="absolute -right-4 top-1/2 -translate-y-1/2 select-none pointer-events-none hidden lg:block" dir="rtl"
        style={{ fontFamily: "'Changa', sans-serif", fontWeight: 800, fontSize: "26vh", color: "rgba(255,255,255,0.04)", writingMode: "vertical-rl", lineHeight: 1 }}>
        كابتن ثائر
      </div>

      <div ref={ref} className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-10 lg:pl-24 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="relative"
            style={{
              transform: inView ? "translateY(0)" : "translateY(50px)",
              opacity: inView ? 1 : 0,
              transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s"
            }}>
            <div aria-hidden="true" className="absolute -top-3 -left-3 right-3 bottom-3 border" style={{ borderColor: RED }} />
            <div aria-hidden="true" className="absolute -bottom-3 -right-3 left-3 top-3 border" style={{ borderColor: "rgba(212,175,55,0.5)" }} />
            <div className="relative overflow-hidden" style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 26px), calc(100% - 26px) 100%, 0 100%)" }}>
              <CinematicImage src={coach1Img} alt="Coach Thaer" className="w-full aspect-square" subjectStyle={{ filter: "contrast(1.1)" }} />
              <div aria-hidden="true" className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 60%, rgba(4,4,4,0.92) 100%)" }} />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex items-end justify-between gap-3">
                <div>
                  <div className="text-2xl sm:text-3xl leading-none" style={{ fontFamily: "'Anton', sans-serif", color: "#fff" }}>THAER KHALID</div>
                  <div className="text-[10px] font-bold tracking-[0.35em] uppercase mt-1" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
                    ISSA / NASM CERTIFIED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 order-1 lg:order-2">
          <Eyebrow rep="01" label="THE MANIFESTO" ar="المنهج" />
          <PunchIn as="h2" text="I DON'T SELL WORKOUTS. I REBUILD PEOPLE."
            className="uppercase leading-[0.92] mb-6 sm:mb-8"
            style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.3rem, 7.5vw, 4.8rem)", color: "#fff" }} />
          <p className="max-w-xl text-sm sm:text-base leading-relaxed mb-8 sm:mb-10" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Archivo', sans-serif" }}>
            Ten years. Twelve hundred transformations. One method: precision programming that treats your body
            like a machine worth engineering — <span style={{ color: RED, fontWeight: 700 }}>and a mindset that refuses easy.</span>
          </p>

          <div className="space-y-0 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {PILLARS.map((pl, i) => (
              <div key={pl.n} className="group flex gap-4 sm:gap-6 py-5 sm:py-6 border-b transition-colors hover:bg-white/[0.03]"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  transform: inView ? "translateX(0)" : "translateX(40px)",
                  opacity: inView ? 1 : 0,
                  transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${0.25 + i * 0.12}s`
                }}>
                <span className="flex-none w-9 h-9 sm:w-10 sm:h-10 grid place-items-center text-sm font-black"
                  style={{ border: `1px solid ${GOLD}`, color: GOLD, fontFamily: "'Anton', sans-serif", clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
                  {pl.n}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black tracking-[0.15em] uppercase mb-1 group-hover:text-red-500 transition-colors"
                    style={{ color: "#fff", fontFamily: "'Archivo', sans-serif" }}>
                    {pl.t}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: ASH, fontFamily: "'Archivo', sans-serif" }}>{pl.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-5 flex-wrap">
            <a href="https://www.instagram.com/thaaerfit/" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 hover:text-[#E1306C] transition-colors focus-visible:outline focus-visible:outline-2"
              style={{ fontFamily: "'Archivo', sans-serif", outlineColor: GOLD }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              @THAER_ELITE
            </a>
            <a href="https://wa.me/962787614424" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-400 hover:text-[#25D366] transition-colors focus-visible:outline focus-visible:outline-2"
              style={{ fontFamily: "'Archivo', sans-serif", outlineColor: GOLD }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5.1-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-3-.2-.3A8.2 8.2 0 1112 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.1.2-.3.2-.6.1-.3-.1-1.1-.4-2-1.2-.8-.7-1.3-1.5-1.4-1.8-.1-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.5 1.1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3z" />
              </svg>
              WHATSAPP COACH
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------ PROOF — the only subscribers section ------------------ */

function EvolutionSlider({ subscriber }: { subscriber: SubscriberData }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  }, []);

  useEffect(() => {
    const up = () => { dragging.current = false; };
    const move = (e: MouseEvent) => { if (dragging.current) update(e.clientX); };
    const tmove = (e: TouchEvent) => { if (dragging.current) update(e.touches[0].clientX); };
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", move);
    window.addEventListener("touchend", up);
    window.addEventListener("touchmove", tmove, { passive: true });
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchend", up);
      window.removeEventListener("touchmove", tmove);
    };
  }, [update]);

  const bf = (subscriber.stats.bodyFatBefore - (subscriber.stats.bodyFatBefore - subscriber.stats.bodyFatAfter) * (pos / 100)).toFixed(1);

  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 z-20" style={{ borderColor: GOLD }} />
      <div aria-hidden="true" className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 z-20" style={{ borderColor: RED }} />
      <div aria-hidden="true" className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 z-20" style={{ borderColor: RED }} />
      <div aria-hidden="true" className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 z-20" style={{ borderColor: GOLD }} />

      <div
        ref={containerRef}
        className="relative w-full h-[56vh] min-h-[360px] max-h-[600px] overflow-hidden select-none cursor-ew-resize touch-pan-y"
        style={{ background: "#000", border: "1px solid rgba(255,255,255,0.12)" }}
        onMouseDown={(e) => { dragging.current = true; update(e.clientX); }}
        onTouchStart={(e) => { dragging.current = true; update(e.touches[0].clientX); }}
        role="slider" aria-label="Before and after comparison" aria-valuenow={Math.round(pos)} aria-valuemin={0} aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((v) => Math.max(0, v - 4));
          if (e.key === "ArrowRight") setPos((v) => Math.min(100, v + 4));
        }}>
        <img
          src={subscriber.beforeImg}
          alt={`${subscriber.name} before coaching`}
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ filter: "grayscale(90%) brightness(0.72) contrast(1.08)" }}
        />
        <span className="absolute top-4 left-4 z-10 px-3 py-1.5 text-[9px] sm:text-[10px] font-black tracking-[0.3em] uppercase"
          style={{ background: "rgba(0,0,0,0.85)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", fontFamily: "'Archivo', sans-serif" }}>
          DAY ONE
        </span>

        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img
            src={subscriber.afterImg}
            alt={`${subscriber.name} after coaching`}
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ filter: "contrast(1.12) brightness(1.03) saturate(1.06)" }}
          />
          <span className="absolute top-4 right-4 z-10 px-3 py-1.5 text-[9px] sm:text-[10px] font-black tracking-[0.3em] uppercase"
            style={{ background: RED, color: "#fff", fontFamily: "'Archivo', sans-serif" }}>
            {subscriber.stats.timeframe} LATER
          </span>
        </div>

        <div aria-hidden="true" className="absolute top-0 bottom-0 z-30 pointer-events-none"
          style={{ left: `${pos}%`, width: "2px", background: `linear-gradient(180deg, ${GOLD}, ${RED}, ${GOLD})`, boxShadow: `0 0 18px ${RED}` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center pointer-events-auto cursor-grab active:cursor-grabbing"
            style={{ background: "#070707", border: `2px solid ${GOLD}`, borderRadius: "50%", boxShadow: "0 0 20px rgba(255,34,51,0.6)" }}>
            <svg className="w-5 h-5" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></svg>
          </div>
        </div>

      </div>
    </div>
  );
}

function Proof() {
  const [active, setActive] = useState<SubscriberData>(SUBSCRIBERS[0]);

  return (
    <div className="relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 lg:pl-24 py-20 sm:py-28">
        <Eyebrow rep="02" label="THE PROOF" ar="النتائج" />
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8 sm:mb-12">
          <PunchIn as="h2" text="BODIES DON'T LIE."
            className="uppercase leading-[0.9]"
            style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.6rem, 9vw, 6rem)", color: "#fff" }} />
          <p className="max-w-sm text-xs sm:text-sm leading-relaxed" style={{ color: ASH, fontFamily: "'Archivo', sans-serif" }}>
            Pick an athlete, then drag the divider to travel through their transformation.
          </p>
        </div>

        <div className="flex gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {SUBSCRIBERS.map((s) => {
            const on = active.id === s.id;
            return (
              <button key={s.id} onClick={() => setActive(s)}
                className="flex-none snap-start flex items-center gap-3 pl-1.5 pr-4 py-1.5 transition-all duration-300 focus-visible:outline focus-visible:outline-2"
                style={{
                  background: on ? "rgba(255,34,51,0.12)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${on ? RED : "rgba(255,255,255,0.1)"}`,
                  outlineColor: GOLD
                }}>
                <img src={s.afterImg} alt="" className="w-9 h-9 object-cover" style={{ border: `1px solid ${on ? GOLD : "transparent"}`, filter: on ? "none" : "grayscale(80%)" }} />
                <span className="text-left">
                  <span className="block text-[11px] font-black uppercase tracking-wider" style={{ color: on ? "#fff" : ASH, fontFamily: "'Archivo', sans-serif" }}>{s.name}</span>
                  <span className="block text-[9px] font-bold tracking-[0.2em]" style={{ color: on ? GOLD : "rgba(255,255,255,0.3)", fontFamily: "'Archivo', sans-serif" }}>{s.stats.timeframe}</span>
                </span>
              </button>
            );
          })}
        </div>

        <EvolutionSlider subscriber={active} />

        <blockquote className="mt-8 sm:mt-10 max-w-2xl mx-auto text-center">
          <p className="text-sm sm:text-lg italic leading-relaxed" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Archivo', sans-serif" }}>
            "{active.quote}"
          </p>
          <footer className="mt-3 text-[10px] font-black tracking-[0.4em] uppercase" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
            — {active.name} · {active.stats.timeframe}
          </footer>
        </blockquote>
      </div>
    </div>
  );
}

/* ---------------- THE SYSTEM — swipeable phase strip ---------------- */

function SystemStrip() {
  const PHASES = [
    { n: "01", t: "INTAKE", ar: "التقييم", d: "Goals, history, measurements and lifestyle. Everything is on the table before a single rep is written." },
    { n: "02", t: "THE BLUEPRINT", ar: "الخطة", d: "Your custom workout + diet plan, engineered for you and delivered within 24–48 hours of your intake." },
    { n: "03", t: "THE GRIND", ar: "المتابعة", d: "WhatsApp support and follow-up. VIP athletes get daily communication, form review and error correction." },
    { n: "04", t: "ADAPT", ar: "التعديل", d: "Weight, photos and measurements drive continuous adjustments to your program — until the goal falls." },
  ];
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    setIdx(Math.round(el.scrollLeft / (card.offsetWidth + 16)));
  };
  const go = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    el.scrollTo({ left: i * (card.offsetWidth + 16), behavior: "smooth" });
  };

  return (
    <div className="relative overflow-hidden py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:pl-24 w-full mb-8 sm:mb-12">
        <Eyebrow rep="03" label="THE SYSTEM" ar="النظام" />
        <div className="flex items-end justify-between gap-4">
          <PunchIn as="h2" text="HOW THE MACHINE WORKS."
            className="uppercase leading-[0.9]"
            style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.4rem, 8vw, 5.5rem)", color: "#fff" }} />
          <div className="hidden sm:flex gap-2">
            {[-1, 1].map((d) => (
              <button key={d} onClick={() => go(Math.max(0, Math.min(PHASES.length - 1, idx + d)))}
                aria-label={d === -1 ? "Previous phase" : "Next phase"}
                className="w-11 h-11 grid place-items-center transition-colors hover:bg-red-600/20 focus-visible:outline focus-visible:outline-2"
                style={{ border: "1px solid rgba(255,255,255,0.2)", outlineColor: GOLD }}>
                <svg className="w-5 h-5" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" style={{ transform: d === -1 ? "rotate(180deg)" : "none" }}>
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <p className="text-[10px] sm:hidden font-bold tracking-[0.35em] uppercase mt-2" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
          ← SWIPE THE PHASES →
        </p>
      </div>

      <div ref={trackRef} onScroll={onScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-10 lg:pl-24 pb-4"
        style={{ scrollPaddingLeft: "1rem" }}>
        {PHASES.map((ph, i) => (
          <article key={ph.n} className="relative flex-none snap-center w-[80vw] sm:w-[380px] p-6 sm:p-8 flex flex-col justify-between min-h-[360px] sm:min-h-[420px] transition-colors"
            style={{
              background: idx === i ? "linear-gradient(160deg, rgba(255,34,51,0.1), rgba(8,8,8,0.98) 60%)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${idx === i ? RED : "rgba(255,255,255,0.1)"}`,
            }}>
            <div>
              <div className="flex items-start justify-between mb-6">
                <span className="text-6xl sm:text-7xl leading-none tabular-nums" aria-hidden="true"
                  style={{ fontFamily: "'Anton', sans-serif", color: "transparent", WebkitTextStroke: `1.5px ${idx === i ? RED : "rgba(255,255,255,0.2)"}` }}>
                  {ph.n}
                </span>
                <span className="text-3xl sm:text-4xl font-bold leading-none mt-1" dir="rtl"
                  style={{ fontFamily: "'Changa', sans-serif", color: idx === i ? GOLD : "rgba(212,175,55,0.35)" }}>
                  {ph.ar}
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl leading-none mb-4" style={{ fontFamily: "'Anton', sans-serif", color: "#fff" }}>{ph.t}</h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Archivo', sans-serif" }}>{ph.d}</p>
            </div>
            <div className="mt-8 h-[3px] w-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }} aria-hidden="true">
              <div className="h-full transition-all duration-700" style={{ width: idx >= i ? "100%" : "0%", background: `linear-gradient(90deg, ${RED}, ${GOLD})` }} />
            </div>
          </article>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {PHASES.map((_, i) => (
          <button key={i} onClick={() => go(i)} aria-label={`Go to phase ${i + 1}`}
            className="h-1 transition-all duration-300 focus-visible:outline focus-visible:outline-2"
            style={{ width: idx === i ? 28 : 12, background: idx === i ? RED : "rgba(255,255,255,0.2)", outlineColor: GOLD }} />
        ))}
      </div>
    </div>
  );
}


/* ---------------- VIDEOS — THE ARCHIVE (placeholders, ready for real videos) ----------------
   To publish a video later: replace a placeholder card body with your
   <video src="..." controls poster="..." /> or a YouTube/Instagram iframe embed. */

function Videos() {
  const SLOTS = [
    { t: "FORM CLINIC", ar: "تصحيح الأداء", d: "Movement breakdowns & error fixes", image: coach1Img },
    { t: "CLIENT STORIES", ar: "قصص المشتركين", d: "Real transformations, on camera", image: sub11Img },
    { t: "NUTRITION ROOM", ar: "غرفة التغذية", d: "How the plans are actually built", image: vaultWall },
  ];
  const { ref, inView } = useInView<HTMLDivElement>(0.1);
  return (
    <div className="relative overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-10 lg:pl-24 py-20 sm:py-28">
        <Eyebrow rep="05" label="THE ARCHIVE" ar="الفيديوهات" />
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10 sm:mb-14">
          <PunchIn as="h2" text="TRAIN WITH YOUR EYES."
            className="uppercase leading-[0.9]"
            style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.4rem, 8vw, 5.5rem)", color: "#fff" }} />
          <p className="max-w-sm text-xs sm:text-sm leading-relaxed" style={{ color: ASH, fontFamily: "'Archivo', sans-serif" }}>
            The video archive is being filmed. First drops land here — follow @thaer_elite to catch them.
          </p>
        </div>

        {/* featured slot */}
        <div className="relative w-full aspect-video max-h-[560px] overflow-hidden group cursor-pointer mb-5 sm:mb-8"
          style={{
            background: "linear-gradient(160deg, rgba(255,34,51,0.08), #060606 55%)",
            border: "1px solid rgba(255,255,255,0.12)",
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}>
          <img src={tunnelWall} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,.2),rgba(4,4,4,.74))]" />
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)" }} />
          <div aria-hidden="true" className="absolute inset-0 grid place-items-center" dir="rtl"
            style={{ fontFamily: "'Changa', sans-serif", fontWeight: 800, fontSize: "clamp(4rem, 16vw, 12rem)", color: "rgba(255,255,255,0.04)" }}>
            قريباً
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <span className="w-16 h-16 sm:w-20 sm:h-20 grid place-items-center rounded-full transition-transform duration-300 group-hover:scale-110"
              style={{ border: `2px solid ${GOLD}`, background: "rgba(4,4,4,0.7)", boxShadow: "0 0 30px rgba(255,34,51,0.35)" }}>
              <svg className="w-7 h-7 sm:w-8 sm:h-8 ml-1" fill={RED} viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span className="text-[10px] sm:text-xs font-black tracking-[0.4em] uppercase" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
              FEATURED FILM — COMING SOON
            </span>
          </div>
          <span className="absolute top-4 left-4 px-3 py-1.5 text-[9px] font-black tracking-[0.3em] uppercase"
            style={{ background: RED, color: "#fff", fontFamily: "'Archivo', sans-serif" }}>
            EPISODE 01
          </span>
        </div>

        {/* upcoming slots */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {SLOTS.map((s, i) => (
            <div key={s.t} className="relative aspect-video overflow-hidden group cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)",
                transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.1}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.1}s, border-color 0.3s`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = RED)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}>
              <img src={s.image} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-35 grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-55" />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,.28),rgba(4,4,4,.92))]" />
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="flex items-start justify-between">
                  <span className="w-10 h-10 grid place-items-center rounded-full"
                    style={{ border: "1px solid rgba(212,175,55,0.5)", background: "rgba(4,4,4,0.6)" }}>
                    <svg className="w-4 h-4 ml-0.5" fill="rgba(255,255,255,0.7)" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                  <span className="text-base font-bold" dir="rtl" style={{ fontFamily: "'Changa', sans-serif", color: "rgba(212,175,55,0.6)" }}>{s.ar}</span>
                </div>
                <div>
                  <div className="text-lg sm:text-xl leading-none mb-1" style={{ fontFamily: "'Anton', sans-serif", color: "#fff" }}>{s.t}</div>
                  <div className="text-[10px] sm:text-[11px]" style={{ color: ASH, fontFamily: "'Archivo', sans-serif" }}>{s.d}</div>
                </div>
              </div>
              <span className="absolute bottom-3 right-3 px-2 py-0.5 text-[8px] font-black tracking-[0.25em] uppercase"
                style={{ background: "rgba(212,175,55,0.15)", color: GOLD, border: "1px solid rgba(212,175,55,0.4)", fontFamily: "'Archivo', sans-serif" }}>
                COMING SOON
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------- PLANS — Basic & VIP, duration toggle ------------------- */

function Plans() {
  const { ref, inView } = useInView<HTMLDivElement>(0.08);
  const [dur, setDur] = useState<Duration>("1M");
  const d = DURATIONS.find((x) => x.key === dur)!;
  const perMonth = (jod: number) => (jod / d.months).toFixed(d.months === 1 ? 0 : 1);

  const BASIC_FEATS = [
    "Customized workout program for your goals",
    "Personalized diet plan",
    "Monthly program updates",
    "Support & Q&A via WhatsApp",
  ];
  const VIP_FEATS = [
    "Everything in Basic",
    "Daily follow-up & communication",
    "Continuous diet & program adjustments",
    "Weight, photos & measurements tracking",
    "Workout review & error correction",
    "Priority responses + supplement guidance",
    "Personal follow-up until you reach your goal",
  ];
  const POLICY = [
    { t: "UPFRONT PAYMENT", d: "Payment is required before the service starts." },
    { t: "NO REFUNDS", d: "Once the subscription begins, it's a commitment — like training." },
    { t: "24–48H DELIVERY", d: "Your program arrives within 24–48 hours after we receive your info." },
    { t: "YOUR UPDATES MATTER", d: "Submit updates on the set dates — results depend on your data." },
  ];

  const card = (kind: "basic" | "vip") => {
    const hot = kind === "vip";
    const price = PRICES[kind][dur];
    return (
      <article
        className="relative flex flex-col p-6 sm:p-8 transition-transform duration-300 hover:-translate-y-1"
        style={{
          background: hot ? "linear-gradient(160deg, rgba(255,34,51,0.18), rgba(5,5,5,0.88) 55%)" : "rgba(5,5,5,0.76)",
          backdropFilter: "blur(18px)",
          border: `1px solid ${hot ? RED : "rgba(255,255,255,0.14)"}`,
          boxShadow: hot ? "0 20px 60px rgba(255,34,51,0.2)" : "none"
        }}>
        {/* badge INSIDE the card — nothing to clip */}
        {hot && (
          <div className="flex justify-end -mt-2 -mr-2 mb-2">
            <span className="px-3 py-1 text-[9px] font-black tracking-[0.3em]"
              style={{ background: GOLD, color: "#0A0A0A", fontFamily: "'Archivo', sans-serif" }}>
              👑 MOST CHOSEN
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-3xl sm:text-4xl leading-none mb-1" style={{ fontFamily: "'Anton', sans-serif", color: hot ? RED : "#fff" }}>
              {hot ? "VIP" : "BASIC"}
            </h3>
            <div className="text-[9px] font-bold tracking-[0.4em] uppercase" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>
              {hot ? "FULL COMMAND" : "THE BLUEPRINT"}
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-bold" dir="rtl" style={{ fontFamily: "'Changa', sans-serif", color: hot ? GOLD : "rgba(255,255,255,0.35)" }}>
            {hot ? "الباقة الذهبية" : "الباقة الأساسية"}
          </span>
        </div>

        <div key={dur} className="mt-6 pb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)", animation: "thaer-pricepop 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-5xl sm:text-6xl leading-none tabular-nums" style={{ fontFamily: "'Anton', sans-serif", color: "#fff" }}>
              {price.jod}
            </span>
            <span className="text-sm font-black tracking-[0.2em]" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>JOD</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: ASH, fontFamily: "'Archivo', sans-serif" }}>/ ${price.usd} USD</span>
          </div>
          <div className="mt-2 flex items-center gap-3 flex-wrap text-[10px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "'Archivo', sans-serif" }}>
            <span style={{ color: ASH }}>{d.label} · ≈ {perMonth(price.jod)} JOD/MO</span>
            {d.save && (
              <span className="px-2 py-0.5" style={{ background: RED, color: "#fff" }}>
                {d.save}
              </span>
            )}
          </div>
        </div>

        <ul className="space-y-3 my-7 flex-1 text-xs sm:text-[13px]" style={{ fontFamily: "'Archivo', sans-serif" }}>
          {(hot ? VIP_FEATS : BASIC_FEATS).map((f) => (
            <li key={f} className="flex items-start gap-2.5" style={{ color: "rgba(255,255,255,0.82)" }}>
              <span className="mt-1 flex-none w-2 h-2" style={{ background: hot ? RED : GOLD, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>

        <Cta tone={hot ? "red" : "ghost"} block onClick={() => {
          const message = `Hi Coach Thaer, I want the ${hot ? "VIP" : "Basic"} plan for ${d.label} (${price.jod} JOD).`;
          window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
        }}>{hot ? "GO VIP 👑" : "START BASIC"}</Cta>
      </article>
    );
  };

  return (
    <div className="relative overflow-hidden">
      <img src={destinationWall} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center opacity-55" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,.8),rgba(5,5,5,.7)_35%,rgba(5,5,5,.94))]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-6 text-center select-none pointer-events-none overflow-hidden" dir="rtl"
        style={{ fontFamily: "'Changa', sans-serif", fontWeight: 800, fontSize: "clamp(5rem, 22vw, 18rem)", lineHeight: 0.9, color: "rgba(255,34,51,0.07)" }}>
        الالتزام
      </div>

      <div ref={ref} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-10 lg:pl-24 py-24 sm:py-32 w-full"
        style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}>
        <Eyebrow rep="06" label="THE COMMITMENT" ar="الاشتراك" />
        <PunchIn as="h2" text="PICK YOUR WEIGHT CLASS."
          className="uppercase leading-[0.9] mb-3"
          style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.4rem, 8vw, 5.5rem)", color: "#fff" }} />
        <p className="max-w-md text-xs sm:text-sm mb-8" style={{ color: ASH, fontFamily: "'Archivo', sans-serif" }}>
          Commit longer, pay less. The only contract that matters is the one with the mirror.
        </p>

        {/* duration toggle — discount shown INLINE, nothing to clip */}
        <div className="flex flex-wrap gap-2 mb-10 sm:mb-12" role="tablist" aria-label="Subscription duration">
          {DURATIONS.map((dd) => {
            const on = dur === dd.key;
            return (
              <button key={dd.key} role="tab" aria-selected={on} onClick={() => setDur(dd.key)}
                className="px-4 sm:px-5 py-3 text-[10px] sm:text-[11px] font-black tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-2 focus-visible:outline focus-visible:outline-2"
                style={{
                  background: on ? RED : "rgba(255,255,255,0.05)",
                  color: on ? "#fff" : ASH,
                  border: `1px solid ${on ? RED : "rgba(255,255,255,0.12)"}`,
                  fontFamily: "'Archivo', sans-serif",
                  outlineColor: GOLD
                }}>
                {dd.label}
                {dd.save && (
                  <span className="px-1.5 py-0.5 text-[8px] font-black"
                    style={{ background: on ? "#0A0A0A" : GOLD, color: on ? GOLD : "#0A0A0A" }}>
                    {dd.save}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-stretch max-w-4xl">
          {card("basic")}
          {card("vip")}
        </div>

        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {POLICY.map((po, i) => (
            <div key={po.t} className="p-4 sm:p-5" style={{ background: "#070707" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg tabular-nums" style={{ fontFamily: "'Anton', sans-serif", color: RED }} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h4 className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] uppercase" style={{ color: GOLD, fontFamily: "'Archivo', sans-serif" }}>{po.t}</h4>
              </div>
              <p className="text-[11px] sm:text-xs leading-relaxed" style={{ color: ASH, fontFamily: "'Archivo', sans-serif" }}>{po.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- FAQ ------------------------------- */

function FAQItem({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <div className="border-b transition-colors" style={{ borderColor: open ? RED : "rgba(255,255,255,0.12)" }}>
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        className="w-full py-5 sm:py-6 flex items-center gap-4 text-left group focus-visible:outline focus-visible:outline-2" style={{ outlineColor: GOLD }}>
        <span className="flex-none text-lg sm:text-xl tabular-nums" style={{ fontFamily: "'Anton', sans-serif", color: open ? RED : "rgba(255,255,255,0.25)" }}>
          {String(i + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 text-sm sm:text-base font-black uppercase tracking-[0.1em] transition-colors"
          style={{ color: open ? GOLD : "#fff", fontFamily: "'Archivo', sans-serif" }}>
          {q}
        </span>
        <span aria-hidden="true" className="flex-none w-8 h-8 grid place-items-center transition-transform duration-300"
          style={{ border: `1px solid ${open ? RED : "rgba(255,255,255,0.2)"}`, transform: open ? "rotate(45deg)" : "rotate(0)" }}>
          <svg className="w-4 h-4" fill="none" stroke={open ? RED : "#fff"} strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
        </span>
      </button>
      <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ maxHeight: open ? `${bodyRef.current?.scrollHeight ?? 300}px` : "0px" }}>
        <div ref={bodyRef} className="pb-6 pl-10 sm:pl-12 pr-4 text-xs sm:text-sm leading-relaxed" style={{ color: ASH, fontFamily: "'Archivo', sans-serif" }}>
          {a}
        </div>
      </div>
    </div>
  );
}

function FAQ() {
  const ITEMS = [
    { q: "When do I get my program?", a: "Within 24–48 hours after we receive all your information — goals, measurements, history and photos. The faster your intake, the faster your blueprint." },
    { q: "How does the follow-up work?", a: "Basic athletes get WhatsApp support, Q&A and monthly program updates. VIP athletes get daily communication, workout review with error correction, and continuous plan adjustments." },
    { q: "Is the diet fully custom?", a: "Completely. Your plan is built from your goals, body data and lifestyle — with continuous adjustments (VIP) as your body changes. Supplement guidance included for VIP." },
    { q: "What are the payment terms?", a: "Payment is upfront before the service starts, and no refunds once the subscription begins. Longer commitments earn real discounts — 3 months, 6 months or a full year." },
  ];
  return (
    <div className="relative py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-10">
        <Eyebrow rep="07" label="INTEL" ar="الأسئلة" />
        <PunchIn as="h2" text="QUESTIONS. ANSWERED."
          className="uppercase leading-[0.9] mb-8 sm:mb-12"
          style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.2rem, 8vw, 4.5rem)", color: "#fff" }} />
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          {ITEMS.map((it, i) => <FAQItem key={i} q={it.q} a={it.a} i={i} />)}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- FOOTER ------------------------------- */

function Footer({ onGo }: { onGo: (id: string) => void }) {
  return (
    <footer className="relative overflow-hidden" style={{ background: "#030303", borderTop: "1px solid rgba(212,175,55,0.25)", boxShadow: "0 -35px 70px rgba(0,0,0,0.85)" }}>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 text-center pointer-events-none select-none overflow-hidden" dir="rtl"
        style={{ fontFamily: "'Changa', sans-serif", fontWeight: 800, fontSize: "clamp(6rem, 28vw, 22rem)", lineHeight: 0.75, color: "rgba(255,255,255,0.03)" }}>
        ثائر
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-10 pt-16 sm:pt-24 pb-10 text-center">
        <PunchIn as="div" text="THE MIRROR IS WAITING."
          className="uppercase leading-[0.9] mb-3"
          style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.4rem, 10vw, 7rem)", color: "#fff" }} />
        <div className="text-xl sm:text-2xl font-bold mb-6" dir="rtl" style={{ fontFamily: "'Changa', sans-serif", color: GOLD }}>
          المرآة بانتظارك
        </div>
        <div className="flex justify-center mb-14 sm:mb-20">
          <Cta tone="gold" onClick={() => onGo("plans")}>CLAIM YOUR SPOT</Cta>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <span className="flex items-center gap-2">
            <span className="text-xl tracking-[0.18em]" style={{ fontFamily: "'Anton', sans-serif", color: "#fff" }}>THAER<span style={{ color: RED }}>.</span></span>
            <span className="text-base font-bold" dir="rtl" style={{ fontFamily: "'Changa', sans-serif", color: GOLD }}>كابتن ثائر</span>
          </span>
          <nav className="flex flex-wrap justify-center items-center gap-5 sm:gap-8 text-[9px] font-black tracking-[0.35em] uppercase" style={{ fontFamily: "'Archivo', sans-serif" }}>
            {[["manifesto", "COACH"], ["proof", "PROOF"], ["videos", "VIDEOS"], ["plans", "JOIN"]].map(([id, l]) => (
              <button key={id} onClick={() => onGo(id)} className="text-neutral-500 hover:text-red-500 transition-colors focus-visible:outline focus-visible:outline-2" style={{ outlineColor: GOLD }}>
                {l}
              </button>
            ))}
            <a href="https://www.instagram.com/thaaerfit/" target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-[#E1306C] transition-colors flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2" style={{ outlineColor: GOLD }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              INSTAGRAM
            </a>
            <a href="https://wa.me/962787614424" target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-[#25D366] transition-colors flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2" style={{ outlineColor: GOLD }}>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5.1-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-3-.2-.3A8.2 8.2 0 1112 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.1.2-.3.2-.6.1-.3-.1-1.1-.4-2-1.2-.8-.7-1.3-1.5-1.4-1.8-.1-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.5 1.1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3z" />
              </svg>
              WHATSAPP
            </a>
          </nav>
          <span className="text-[9px] font-bold tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Archivo', sans-serif" }}>
            © 2026 COACH THAER
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------- APP ------------------------------- */

export default function App() {
  const reduced = usePrefersReducedMotion();
  const compactMotion = useMediaQuery("(max-width: 767px)");
  const cinematicReduced = reduced || compactMotion;
  const [introDone, setIntroDone] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("thaer-intro-seen") === "1" || window.matchMedia("(max-width: 767px), (prefers-reduced-motion: reduce)").matches;
  });

  const finishIntro = useCallback(() => {
    sessionStorage.setItem("thaer-intro-seen", "1");
    setIntroDone(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = introDone ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [introDone]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: cinematicReduced ? "auto" : "smooth" });

  return (
    <div className="relative min-h-screen text-white" style={{ background: BLACK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;700;900&family=Changa:wght@700;800&display=swap');

        html { scroll-behavior: smooth; background: ${BLACK}; }
        html, body { overflow-x: clip; }
        body { background: ${BLACK}; }
        button, a { -webkit-tap-highlight-color: transparent; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        ::selection { background: ${RED}; color: #fff; }

        .experience-layer { --mx: 50vw; --my: 35vh; }
        .experience-layer__grid {
          opacity: .18;
          background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent);
        }
        .experience-layer__aura { background: radial-gradient(420px circle at var(--mx) var(--my), rgba(255,34,51,.075), transparent 70%); }
        .experience-layer__progress { z-index: 999; width: 100%; background: linear-gradient(90deg, ${GOLD}, ${RED}); transform: scaleX(0); animation: page-progress linear; animation-timeline: scroll(root); }

        .experience-scene { overflow: clip; box-shadow: 0 -24px 64px rgba(0,0,0,.48); }
        .experience-scene__seam { background: linear-gradient(90deg, transparent, rgba(212,175,55,.7), rgba(255,34,51,.7), transparent); }
        .experience-scene__index { font-family: 'Anton', sans-serif; font-size: clamp(4rem, 11vw, 8rem); line-height: .8; color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,.05); transform: translateY(26px); opacity: 0; transition: .8s cubic-bezier(.16,1,.3,1); }
        .experience-scene.is-visible .experience-scene__index { transform: translateY(0); opacity: 1; }

        .hero-scan { background-image: repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 4px); }
        .cinematic-image__echo { transform: scale(1.12); filter: blur(28px) brightness(.48) saturate(.88); opacity: .72; }
        .cinematic-image__subject { filter: drop-shadow(0 18px 44px rgba(0,0,0,.34)); }
        .hero-poster .cinematic-image__subject { object-fit: cover; }
        .hero-poster .cinematic-image__echo { filter: blur(34px) brightness(.4) saturate(.9); opacity: .8; }
        .hero-frame { z-index: 8; border: 1px solid rgba(212,175,55,.22); clip-path: polygon(0 0,58px 0,58px 1px,calc(100% - 58px) 1px,calc(100% - 58px) 0,100% 0,100% 58px,calc(100% - 1px) 58px,calc(100% - 1px) calc(100% - 58px),100% calc(100% - 58px),100% 100%,calc(100% - 58px) 100%,calc(100% - 58px) calc(100% - 1px),58px calc(100% - 1px),58px 100%,0 100%,0 calc(100% - 58px),1px calc(100% - 58px),1px 58px,0 58px); }
        .hero-frame::before, .hero-frame::after { content: ""; position: absolute; width: 42px; height: 2px; top: 50%; background: linear-gradient(90deg, ${RED}, ${GOLD}); box-shadow: 0 0 18px rgba(255,34,51,.45); }
        .hero-frame::before { left: 0; } .hero-frame::after { right: 0; transform: scaleX(-1); }
        .hero-live-dot { animation: live-dot 1.7s ease-in-out infinite; }
        .hero-command { animation: command-float 5s ease-in-out infinite; }
        .hero-stat { border-left: 1px solid rgba(255,255,255,.14); padding-left: .75rem; }
        .mobile-dock__pulse { background: radial-gradient(circle at center, rgba(255,255,255,.25), transparent 62%); animation: dock-pulse 2.5s ease-in-out infinite; }
        .ritual-card { box-shadow: 0 30px 80px rgba(0,0,0,.38); }
        .ritual-ring { transition: background .6s cubic-bezier(.16,1,.3,1); }
        .fill-word__ink { clip-path: inset(0 100% 0 0); }
        .fill-word__sub { opacity: .35; }

        @supports (animation-timeline: view()) {
          .fill-word__ink { animation: fill-sweep linear both; animation-timeline: view(); animation-range: entry 15% cover 62%; }
          .fill-word__sub { animation: sub-rise linear both; animation-timeline: view(); animation-range: entry 20% cover 55%; }
          .hero-media { animation: hero-exit linear both; animation-timeline: scroll(root); animation-range: 0 95svh; }
        }

        @keyframes page-progress { to { transform: scaleX(1); } }
        @keyframes fill-sweep { to { clip-path: inset(0 0 0 0); } }
        @keyframes sub-rise { to { opacity: 1; letter-spacing: .62em; } }
        @keyframes hero-exit { to { transform: scale(1.07) translateY(-3%); filter: brightness(.56); } }
        @keyframes live-dot { 50% { transform: scale(.58); opacity: .45; } }
        @keyframes command-float { 50% { transform: translateY(-7px); } }
        @keyframes dock-pulse { 0%,100% { opacity: 0; transform: scale(.75); } 50% { opacity: .5; transform: scale(1.35); } }
        @keyframes thaer-marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
        @keyframes thaer-flash { 0% { opacity: 0; transform: scale(1.2); filter: blur(5px); } 100% { opacity: 1; transform: scale(1); filter: blur(0); } }
        @keyframes thaer-load { from { width: 0%; } to { width: 100%; } }
        @keyframes thaer-drip { 0% { transform: translateY(-120%); } 100% { transform: translateY(400%); } }
        @keyframes thaer-pricepop { 0% { opacity: 0; transform: translateY(14px) scale(.97); } 100% { opacity: 1; transform: translateY(0) scale(1); } }


        .portal-orbit::before,
        .portal-orbit::after { content: ""; position: absolute; inset: 11%; border: 1px solid rgba(255,255,255,.13); border-radius: 999px; }
        .portal-orbit::after { inset: 27%; border-color: rgba(255,34,51,.34); }
        .portal-orbit--inner::before { border-style: dashed; border-color: rgba(212,175,55,.35); }

        @media (hover: hover) and (pointer: fine) {
          .portal-orbit { filter: drop-shadow(0 0 24px rgba(212,175,55,.15)); }
        }

        @media (max-width: 767px) {
          .experience-layer__grid { background-size: 30px 30px; opacity: .12; }
          .experience-layer__aura { background: radial-gradient(260px circle at 50% 28%, rgba(255,34,51,.06), transparent 72%); }
          .hero-stat { padding-left: .55rem; }
          .hero-title-line { letter-spacing: -.015em; }
          .portal-orbit { width: 78vw; height: 78vw; }
          .cinematic-image__echo { filter: blur(20px) brightness(.44) saturate(.86); }
          .hero-poster .cinematic-image__subject { object-fit: cover; object-position: 43% 12%; }
          .hero-frame { inset: .55rem; opacity: .72; }
          .hero-command, .portal-orbit, .experience-layer__aura { animation: none !important; }
          .hero-media { animation: none !important; transform: none !important; filter: none !important; }
        }
        @media (min-width: 768px) {
          .hero-poster .cinematic-image__subject { object-fit: contain; object-position: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
          html { scroll-behavior: auto; }
          .fill-word__ink { clip-path: inset(0 0 0 0); }
          .fill-word__sub { opacity: 1; }
        }
      `}</style>

      <ExperienceLayer reduced={cinematicReduced} />
      <FilmIntro done={introDone} onDone={finishIntro} reduced={cinematicReduced} />
      <Nav onGo={go} />

      <main className="relative z-10">
        <Hero onGo={go} reduced={cinematicReduced} introDone={introDone} />
        <Marquee items={MANTRAS} tone="red" angled />

        <AscensionPortal reduced={cinematicReduced} onGo={go} />
        <SceneSection id="manifesto" bg="#080808" index="01"><Manifesto /></SceneSection>
        <FillWord word="FORGE" ar="اصنع" sub="INTENTION BECOMES A SYSTEM" />

        <TransformationRift reduced={cinematicReduced} />
        <SceneSection id="proof" bg="#050505" index="02"><Proof /></SceneSection>
        <Marquee items={[{ t: "1,200+ TRANSFORMED" }, { t: "٪١٠٠ خطط مخصصة", ar: true }, { t: "10+ YEARS" }, { t: "بدون اختصارات", ar: true }]} tone="gold" reverse />

        <SystemTunnel reduced={cinematicReduced} />
        <SceneSection id="ritual" bg="#050505" index="04"><DisciplineRitual /></SceneSection>
        <SceneSection id="videos" bg="#060606" index="05"><Videos /></SceneSection>
        <FillWord word="ASCEND" ar="ارتقِ" sub="THE STANDARD MOVES WITH YOU" />
        <SceneSection id="plans" bg="#050505" index="06"><Plans /></SceneSection>
        <SceneSection id="faq" bg="#080808" index="07"><FAQ /></SceneSection>
      </main>

      <Footer onGo={go} />
    </div>
  );
}