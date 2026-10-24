import { useEffect, useRef, type CSSProperties } from "react";
import { useAuthJourney } from "../AuthJourney";
import { authMilestones } from "../auth-progress";
import { arrivalPlayed, rememberArrival } from "../../../lib/arrival";
import chestFront from "../../../assets/medical/auth-chest-front-v1366.webp";
import chestBack from "../../../assets/medical/auth-chest-back-v1366.webp";

// Light follows the paired ribs in a normalised 1280px coordinate space.
const cageRays = [
  "M370 355C280 344 190 275 140 230M884 355C974 344 1064 275 1114 230",
  "M372 470C260 450 148 385 100 330M882 470C994 450 1106 385 1154 330",
  "M371 575C255 555 125 490 80 430M883 575C999 555 1129 490 1174 430",
  "M372 685C253 670 122 605 74 540M882 685C1001 670 1132 605 1180 540",
  "M368 800C250 782 122 713 75 650M886 800C1004 782 1132 713 1179 650",
  "M372 908C253 884 136 826 82 760M882 908C1001 884 1118 826 1172 760",
  "M390 1000C265 990 150 937 90 872M864 1000C989 990 1104 937 1164 872",
];
const fieldIds = [
  "register-name",
  "register-university-number",
  "register-email",
  "register-batch",
  "register-year",
  "register-password",
  "register-confirm",
];

/** Independent posterior and anterior plates sandwich the real form at z=5. */
export function XrayChest({ registering }: { registering: boolean }) {
  const journey = useAuthJourney();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let intersects = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let commit = 0;
    if (!arrivalPlayed("chest")) {
      if (!reduced.matches && !document.hidden) {
        node.dataset.chestEnter = "true";
        commit = requestAnimationFrame(() => rememberArrival("chest"));
      } else rememberArrival("chest");
    }
    const entrance = setTimeout(
      () => node.removeAttribute("data-chest-enter"),
      1100,
    );
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const sync = () => {
      if (reduced.matches || document.hidden)
        node.removeAttribute("data-chest-enter");
      node.toggleAttribute(
        "data-running",
        intersects &&
          !document.hidden &&
          !reduced.matches &&
          !connection?.saveData,
      );
    };
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) => {
            intersects = entries[0]?.isIntersecting ?? false;
            sync();
          });
    observer?.observe(node);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    sync();
    return () => {
      observer?.disconnect();
      clearTimeout(entrance);
      cancelAnimationFrame(commit);
      node.removeAttribute("data-chest-enter");
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);
  const artwork = (src: string) => (
    <img
      src={src}
      alt=""
      width={1254}
      height={1254}
      decoding="async"
      fetchPriority="high"
      draggable={false}
    />
  );
  return (
    <div
      className="auth-xray"
      ref={root}
      aria-hidden="true"
      data-feedback={journey.feedback}
      data-progress={journey.progress.length}
      data-focused={!!journey.focused || undefined}
      style={
        {
          "--ray-duration": `${5.8 - journey.progress.length * 0.28}s`,
          "--auth-progress": journey.progress.length / authMilestones.length,
        } as CSSProperties
      }
    >
      <div className="auth-xray-halo">
        <svg
          className="auth-ambient-anatomy"
          viewBox="0 0 1440 1000"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <g className="auth-ambient-orbits">
            <ellipse cx="720" cy="510" rx="660" ry="420" />
            <ellipse cx="720" cy="510" rx="570" ry="485" />
            <path d="M-80 710C140 110 350 180 720 180S1290 100 1530 690M-80 280C180 820 400 860 720 860S1280 850 1530 240" />
          </g>
          <g className="auth-neural-threads">
            <path d="M0 190C120 190 75 300 200 300S290 430 405 430M0 805C140 805 140 665 250 665S310 590 420 590M1440 140C1260 140 1400 330 1240 330S1200 470 1050 470M1440 840C1270 840 1330 710 1200 710S1130 635 1030 635" />
            <path d="M200 300C200 210 280 210 280 120M250 665C250 780 350 780 350 930M1240 330C1240 220 1150 220 1150 80M1200 710C1200 815 1110 815 1110 960" />
          </g>
          <g className="auth-ambient-points">
            <circle cx="200" cy="300" r="4" />
            <circle cx="250" cy="665" r="4" />
            <circle cx="1240" cy="330" r="4" />
            <circle cx="1200" cy="710" r="4" />
            <circle cx="280" cy="120" r="2" />
            <circle cx="350" cy="930" r="2" />
            <circle cx="1150" cy="80" r="2" />
            <circle cx="1110" cy="960" r="2" />
          </g>
        </svg>
      </div>
      <div className="auth-xray-stage auth-xray-back">{artwork(chestBack)}</div>
      <div className="auth-xray-stage auth-xray-traces">
        <svg viewBox="0 0 1254 1254" fill="none">
          {authMilestones.map((name, index) => (
            <g
              key={name}
              data-complete={registering && journey.progress.includes(name)}
              data-focused={fieldIds[index] === journey.focused || undefined}
              style={{ "--ray-order": index } as CSSProperties}
            >
              <path className="xray-ray-bed" d={cageRays[index]} />
              <path
                className="xray-ray-flow"
                d={cageRays[index]}
                pathLength={1}
              />
            </g>
          ))}
        </svg>
      </div>
      <div className="auth-xray-stage auth-xray-cage">
        {artwork(chestFront)}
      </div>
      <div className="auth-xray-front">
        <div className="auth-xray-stage">{artwork(chestBack)}</div>
      </div>
    </div>
  );
}
