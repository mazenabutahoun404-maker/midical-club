import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import activeDay from "../../assets/home/auth-plaza-active-day-1672.webp";
import activeNight from "../../assets/home/auth-plaza-active-night-1672.webp";
import awaitingDay from "../../assets/home/auth-plaza-awaiting-day-1672.webp";
import awaitingNight from "../../assets/home/auth-plaza-awaiting-night-1672.webp";
import phoneDay from "../../assets/home/living-campus-1672.webp";
import phoneNight from "../../assets/home/living-campus-night-1672.webp";
import phoneAwaitingDay from "../../assets/home/campus-awaiting-day-1672.webp";
import phoneAwaitingNight from "../../assets/home/campus-awaiting-night-1672.webp";
import { campusDestinations } from "../homepage/living-campus";
import { useCampusLife } from "../homepage/useCampusLife";
import { CampusLights } from "../homepage/CampusLights";
import { authDestinations } from "./auth-constellation";
import { useAuthJourney } from "./AuthJourney";
import { prepareRestorationImage } from "./restoration-art";
import { useCampusRestoration } from "./useCampusRestoration";
import { CampusArrivalBurst } from "./CampusArrivalBurst";
import { authRestorationRegions, phoneRestorationRegions, authArrivalPoints, phoneArrivalPoints } from "./auth-restoration-regions";
import "../homepage/living-campus.css";

export function AuthCampus({ dormant }: { dormant: boolean }) {
  const { resolvedTheme } = useAppearance();
  const { t, dir } = useLocale();
  const journey = useAuthJourney();
  const dark = resolvedTheme === "dark";
  const [phone, setPhone] = useState(() => window.matchMedia("(max-width: 700px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const sync = () => setPhone(query.matches);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  const live = phone ? dark ? phoneNight : phoneDay : dark ? activeNight : activeDay;
  const source = dormant ? phone ? dark ? phoneAwaitingNight : phoneAwaitingDay : dark ? awaitingNight : awaitingDay : live;
  const destinations = phone ? campusDestinations : authDestinations;
  const assets = useMemo(() => Array<string>(6).fill(live), [live]);
  const regions = phone ? phoneRestorationRegions : authRestorationRegions;
  const [loaded, setLoaded] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const enabled = loaded === source && failed !== source;
  const id = useId().replace(/:/g, "");
  const waitForRoute = useCallback(async (building: string, signal: AbortSignal) => {
    // Let React commit the revealed route and the browser create its transition.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    if (signal.aborted) return;
    const route = stage.current?.querySelector<SVGPathElement>(`[data-campus-life-destination="${building}"] .campus-life-route`);
    const drawing = route?.getAnimations().filter((animation) => "transitionProperty" in animation && animation.transitionProperty === "stroke-dashoffset") || [];
    await Promise.all(drawing.map((animation) => animation.finished.catch(() => {})));
  }, []);
  const restoration = useCampusRestoration(dormant ? journey.progress : [], enabled, journey.finalRestoration, assets, waitForRoute);
  useEffect(() => {
    if (enabled && dormant) void prepareRestorationImage(live).catch(() => {});
  }, [enabled, dormant, live]);
  const ambient = useCampusLife(stage, "ambient", enabled && !dormant && !journey.welcoming);
  const welcome = useCampusLife(stage, "welcome", enabled && !dormant && journey.welcoming, journey.welcomeToken);
  const effect = dormant ? restoration : journey.welcoming ? welcome : ambient;
  const full = dormant && restoration.repaired.length === 6;
  return (
    <div className="auth-campus-gallery" ref={stage} data-direction={dir}
      data-campus-running={effect.running || undefined} data-welcome-running={journey.welcoming || undefined}
      data-restoration-finishing={dormant && journey.finalRestoration || undefined} data-campus-variant={dormant ? "awaiting" : "active"} data-campus-lighting={dark ? "night" : "day"}
      data-restoration={dormant ? restoration.repaired.length : undefined} data-portrait={phone || undefined}>
      <div className="auth-campus-window" aria-hidden="true" data-failed={failed === source || undefined}>
        <div className="auth-campus-art">
          <picture>
            <img src={source} width={1672} height={941} alt="" decoding="async" fetchPriority="high"
              onLoad={() => { setLoaded(source); setFailed(null); }} onError={() => setFailed(source)} />
          </picture>
          {dormant && <svg viewBox="0 0 1672 941" className="auth-campus-repair-map" focusable="false">
            <defs>
              <filter id={`${id}-repair-edge`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="7" />
              </filter>
              <mask id={`${id}-repair-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941" style={{ maskType: "luminance" }}>
                <rect width="1672" height="941" fill="black" />
                {full ? <rect width="1672" height="941" fill="white" data-restored-campus="true" /> :
                  <g filter={`url(#${id}-repair-edge)`}>{destinations.map((destination) =>
                    <path key={destination.id} d={regions[destination.id]} fill="white"
                      visibility={restoration.repaired.includes(destination.id) ? "visible" : "hidden"} />
                  )}</g>}
              </mask>
            </defs>
            <image href={live} width={1672} height={941} mask={`url(#${id}-repair-mask)`} data-restoration-source="fixed" />
            {restoration.repaired.map((key) => <g key={key} data-restored-building={key} />)}
          </svg>}
          <svg viewBox="0 0 1672 941" className="auth-campus-map" focusable="false">
            <CampusLights lit={effect.lit} revealed={effect.revealed} destinations={destinations} origin={phone ? [1070, 578] : [836, 730]} />
            <CampusArrivalBurst key={source} arrival={dormant ? restoration.arrival : null} points={phone ? phoneArrivalPoints : authArrivalPoints} enabled={dormant && enabled} repaired={restoration.repaired} />
            {destinations.map((destination) => <g key={destination.id}
              transform={dir === "rtl" ? `translate(${destination.labelX * 2} 0) scale(-1 1)` : undefined}>
              <text x={destination.labelX} y={destination.labelY}
                transform={`rotate(${dir === "rtl" ? -destination.rotation : destination.rotation} ${destination.labelX} ${destination.labelY})`}
                textAnchor="middle" dominantBaseline="middle" lang={dir === "rtl" ? "ar" : "en"}>
                {t(destination.label)}
              </text>
            </g>)}
          </svg>
        </div>
      </div>
    </div>
  );
}
