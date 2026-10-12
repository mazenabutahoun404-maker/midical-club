import { useEffect, useState, type CSSProperties } from "react";
import { Pause, X } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { appearancePreviewColors } from "../../app/providers/appearance-preview-colors";
import type { appearanceChoices } from "../../app/providers/appearance-choices";

type Choice = (typeof appearanceChoices)[number];
const scenes = [
  { en: "Home", ar: "الرئيسية" },
  { en: "Courses", ar: "المساقات" },
  { en: "Study reader", ar: "قارئ الدراسة" },
  { en: "Workspace", ar: "المساحة الشخصية" },
];
export function ThemePreview({
  choice,
  manual,
  onManual,
  onClose,
}: {
  choice: Choice;
  manual: boolean;
  onManual: () => void;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const { resolvedTheme } = useAppearance();
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (manual || !playing) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      if (!document.hidden && !reduced.matches)
        timer = setInterval(
          () => setFrame((previous) => (previous + 1) % 4),
          2000,
        );
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
    };
  }, [manual, playing]);
  const mode = choice.mode === "system" ? resolvedTheme : choice.mode;
  const colors = appearancePreviewColors[`${choice.palette}-${mode}`];
  return (
    <aside
      className="theme-preview"
      data-preview-mode={manual ? "manual" : playing ? "automatic" : "paused"}
      aria-label={t({ en: "Theme preview", ar: "معاينة الألوان" })}
      style={
        Object.fromEntries(
          Object.entries(colors).map(([key, value]) => [
            `--preview-${key}`,
            value,
          ]),
        ) as CSSProperties
      }
    >
      <header>
        <strong>{t(choice.title)}</strong>
        <button
          type="button"
          aria-label={t({
            en: "Close theme preview",
            ar: "إغلاق معاينة الألوان",
          })}
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </header>
      {scenes.map((scene, index) => (
        <svg
          key={index}
          className="theme-preview-scene"
          aria-hidden={index !== frame}
          style={{ display: index === frame ? undefined : "none" }}
          viewBox="0 0 360 220"
          role="img"
          aria-label={t(scene) + " · " + t(choice.title)}
        >
          <rect
            width="360"
            height="220"
            rx="8"
            fill="var(--preview-background)"
          />
          <rect
            x="6"
            y="6"
            width="50"
            height="208"
            rx="8"
            fill="var(--preview-sidebar)"
            stroke="var(--preview-border)"
          />
          <text
            x="18"
            y="30"
            fontSize="14"
            fontWeight="700"
            fill="var(--preview-sidebar-foreground)"
          >
            mc
          </text>
          {[48, 73, 98, 123, 148].map((y, i) => (
            <g key={y}>
              <rect
                x="12"
                y={y}
                width="38"
                height="19"
                rx="4"
                fill={
                  i === index
                    ? "var(--preview-primary)"
                    : "var(--preview-muted)"
                }
              />
              <circle
                cx="21"
                cy={y + 9}
                r="3"
                fill={
                  i === index
                    ? "var(--preview-primary-foreground)"
                    : "var(--preview-sidebar-foreground)"
                }
              />
              <path
                d={`M29 ${y + 9}h12`}
                stroke={
                  i === index
                    ? "var(--preview-primary-foreground)"
                    : "var(--preview-sidebar-foreground)"
                }
              />
            </g>
          ))}
          <rect
            x="64"
            y="6"
            width="290"
            height="27"
            rx="5"
            fill="var(--preview-card)"
            stroke="var(--preview-border)"
          />
          <text x="74" y="24" fontSize="10" fill="var(--preview-foreground)">
            {t(scene)}
          </text>
          <circle
            cx="321"
            cy="20"
            r="4"
            fill="none"
            stroke="var(--preview-foreground)"
          />
          <path d="M325 24l4 4" stroke="var(--preview-foreground)" />
          {index === 0 ? (
            <>
              <text
                x="75"
                y="65"
                fontSize="19"
                fontWeight="700"
                fill="var(--preview-foreground)"
              >
                Learn together.
              </text>
              <path
                d="M76 79h136m-136 8h105"
                stroke="var(--preview-muted-foreground)"
              />
              <ellipse
                cx="224"
                cy="169"
                rx="113"
                ry="30"
                fill="var(--preview-muted)"
              />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <g key={i}>
                  <rect
                    x={125 + i * 33}
                    y={106 + Math.abs(2.5 - i) * 5}
                    width="25"
                    height="54"
                    rx="3"
                    fill="var(--preview-card)"
                    stroke="var(--preview-border)"
                  />
                  <rect
                    x={130 + i * 33}
                    y={124 + Math.abs(2.5 - i) * 5}
                    width="15"
                    height="20"
                    fill="var(--preview-primary)"
                    opacity="0.85"
                  />
                </g>
              ))}
            </>
          ) : index === 1 ? (
            <>
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <rect
                    x={77 + i * 90}
                    y="61"
                    width="77"
                    height="129"
                    rx="5"
                    fill={
                      i === 1 ? "var(--preview-primary)" : "var(--preview-card)"
                    }
                    stroke="var(--preview-border)"
                  />
                  <path
                    d={`M${84 + i * 90} 64v120`}
                    stroke={
                      i === 1
                        ? "var(--preview-primary-foreground)"
                        : "var(--preview-muted-foreground)"
                    }
                  />
                  <text
                    x={92 + i * 90}
                    y="91"
                    fontSize="9"
                    fill={
                      i === 1
                        ? "var(--preview-primary-foreground)"
                        : "var(--preview-foreground)"
                    }
                  >
                    MED {i + 1}
                  </text>
                  <path
                    d={`M${92 + i * 90} 114h42m-42 8h30`}
                    stroke={
                      i === 1
                        ? "var(--preview-primary-foreground)"
                        : "var(--preview-muted-foreground)"
                    }
                  />
                </g>
              ))}
            </>
          ) : index === 2 ? (
            <>
              <rect
                x="80"
                y="50"
                width="263"
                height="151"
                rx="5"
                fill="var(--preview-primary)"
              />
              <rect
                x="84"
                y="54"
                width="125"
                height="143"
                fill="var(--preview-card)"
              />
              <rect
                x="213"
                y="54"
                width="126"
                height="143"
                fill="var(--preview-card)"
              />
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <g key={i}>
                  <path
                    d={`M96 ${77 + i * 16}h98m30 0h100`}
                    stroke="var(--preview-muted-foreground)"
                    opacity="0.65"
                  />
                </g>
              ))}
              <rect
                x="74"
                y="70"
                width="24"
                height="12"
                rx="2"
                fill="var(--preview-muted)"
              />
            </>
          ) : (
            <>
              <text
                x="76"
                y="59"
                fontSize="15"
                fontWeight="700"
                fill="var(--preview-foreground)"
              >
                Your workspace
              </text>
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <rect
                    x="76"
                    y={73 + i * 43}
                    width="266"
                    height="34"
                    rx="5"
                    fill="var(--preview-card)"
                    stroke="var(--preview-border)"
                  />
                  <circle
                    cx="93"
                    cy={90 + i * 43}
                    r="6"
                    fill="var(--preview-primary)"
                  />
                  <path
                    d={`M108 ${86 + i * 43}h145m-145 9h99`}
                    stroke="var(--preview-muted-foreground)"
                  />
                </g>
              ))}
            </>
          )}
        </svg>
      ))}
      <div
        className="theme-preview-controls"
        role="group"
        aria-label={t({ en: "Preview views", ar: "صفحات المعاينة" })}
      >
        {scenes.map((scene, index) => (
          <button
            key={index}
            type="button"
            aria-label={t(scene) + " " + t({ en: "preview", ar: "معاينة" })}
            aria-pressed={frame === index}
            onClick={() => {
              setFrame(index);
              onManual();
            }}
          >
            {index + 1}
          </button>
        ))}
        <button
          type="button"
          aria-label={t(
            playing && !manual
              ? { en: "Pause preview", ar: "إيقاف المعاينة" }
              : { en: "Preview paused", ar: "المعاينة متوقفة" },
          )}
          onClick={() => {
            setPlaying(false);
            onManual();
          }}
        >
          <Pause size={14} />
        </button>
      </div>
      <small>
        {t({
          en: "Illustrative layouts using the actual palette tokens.",
          ar: "تخطيطات توضيحية تستخدم ألوان المظهر الفعلية.",
        })}
      </small>
    </aside>
  );
}
