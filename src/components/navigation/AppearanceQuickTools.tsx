import {
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronUp, Columns2, Rows2, Shuffle, LockKeyhole } from "lucide-react";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import {
  appearanceChoices,
  appearanceChoiceId,
} from "../../app/providers/appearance-choices";
import { useLocale } from "../../app/providers/LocaleProvider";
import { UtilityGlyph } from "./UtilityGlyph";
import { NavigationControls, useNavigationState } from "./AdaptiveNavigation";
import "../../styles/appearance-quick-tools-v1350.css";

export function AppearanceQuickTools({
  children,
  compact,
  onOpenPanel,
}: {
  children: ReactNode;
  compact: boolean;
  onOpenPanel: boolean;
}) {
  const { t, locale, setLocale, dir } = useLocale();
  const navState = useNavigationState();
  const navigationAvailable =
    !!navState &&
    !navState.focus &&
    !navState.studying &&
    window.matchMedia("(min-width: 768px)").matches;
  const {
    navigation,
    setNavigation,
    accountAvailable,
    palette,
    colorMode,
    resolvedTheme,
    setThemeChoice,
  } = useAppearance();
  const [open, setOpen] = useState(false),
    [position, setPosition] = useState({ left: 8, top: 8 }),
    [message, setMessage] = useState("");
  const anchor = useRef<HTMLSpanElement>(null),
    tray = useRef<HTMLDivElement>(null),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    closing = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId(),
    focusNext = useRef(false),
    longPress = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function clear() {
    clearTimeout(timer.current);
    clearTimeout(closing.current);
  }
  function reveal(focus = false) {
    clear();
    const trigger = anchor.current?.querySelector("button");
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const width = navigationAvailable
        ? window.matchMedia("(any-pointer: coarse)").matches
          ? 288
          : 272
        : 184,
      height = 72;
    setPosition({
      left: Math.max(
        8,
        Math.min(innerWidth - width - 8, r.left + r.width / 2 - width / 2),
      ),
      top:
        r.top > height + 12
          ? r.top - height - 8
          : Math.min(innerHeight - height - 8, r.bottom + 8),
    });
    focusNext.current = focus;
    setOpen(true);
  }
  function dismiss(restore = false) {
    clear();
    setOpen(false);
    if (restore)
      anchor.current?.querySelector("button")?.focus({ preventScroll: true });
  }
  function scheduleClose() {
    clear();
    closing.current = setTimeout(() => {
      if (
        !anchor.current?.contains(document.activeElement) &&
        !tray.current?.contains(document.activeElement)
      )
        setOpen(false);
    }, 180);
  }
  useEffect(() => () => clear(), []);
  useEffect(() => {
    if (onOpenPanel) dismiss();
  }, [onOpenPanel]);
  useLayoutEffect(() => {
    if (!open) return;
    // A top-layer popover stays clickable even when Appearance is in the phone menu dialog.
    tray.current?.showPopover?.();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    if (focusNext.current) {
      focusNext.current = false;
      requestAnimationFrame(() =>
        tray.current?.querySelector("button")?.focus({ preventScroll: true }),
      );
    }
    const outside = (e: PointerEvent) => {
      if (
        !anchor.current?.contains(e.target as Node) &&
        !tray.current?.contains(e.target as Node)
      )
        dismiss();
    };
    const close = () => dismiss();
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss(true);
      }
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);
  function randomTheme() {
    const current = appearanceChoiceId(palette, colorMode);
    const eligible = appearanceChoices.filter(
      (c) =>
        c.mode !== "system" &&
        c.id !== current &&
        c.id !== `${palette}-${resolvedTheme}` &&
        (accountAvailable || c.palette === "medclub"),
    );
    const next = eligible[Math.floor(Math.random() * eligible.length)];
    if (next) {
      setThemeChoice(next.id);
      setMessage(t(next.title));
    }
  }
  return (
    <span
      ref={anchor}
      className="appearance-quick-anchor"
      data-compact={compact || undefined}
      data-quick-open={open || undefined}
      onPointerEnter={(e) => {
        clear();
        if (e.pointerType === "mouse" && !onOpenPanel)
          timer.current = setTimeout(() => reveal(), 420);
      }}
      onPointerLeave={scheduleClose}
      onPointerDown={(e) => {
        longPress.current = false;
        if (e.pointerType === "touch") {
          touchStart.current = { x: e.clientX, y: e.clientY };
          clear();
          timer.current = setTimeout(() => {
            longPress.current = true;
            reveal(true);
          }, 650);
        }
      }}
      onPointerMove={(e) => {
        if (
          e.pointerType === "touch" &&
          touchStart.current &&
          Math.hypot(
            e.clientX - touchStart.current.x,
            e.clientY - touchStart.current.y,
          ) > 10
        )
          clearTimeout(timer.current);
      }}
      onContextMenu={(e) => {
        if (touchStart.current) {
          e.preventDefault();
          longPress.current = true;
          reveal(true);
        }
      }}
      onPointerUp={() => clearTimeout(timer.current)}
      onPointerCancel={() => clear()}
      onClickCapture={(e) => {
        if (longPress.current) {
          e.preventDefault();
          e.stopPropagation();
          longPress.current = false;
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          reveal(true);
        }
        if (e.key === "Escape") dismiss(true);
      }}
      onBlur={scheduleClose}
    >
      {children}
      {!compact && (
        <button
          type="button"
          className="appearance-quick-disclosure"
          aria-controls={id}
          aria-expanded={open}
          aria-label={t({
            en: "Quick appearance tools",
            ar: "أدوات المظهر السريعة",
          })}
          onClick={() => (open ? dismiss() : reveal(true))}
        >
          <ChevronUp size={15} />
        </button>
      )}
      {open &&
        createPortal(
          <div
            ref={tray}
            id={id}
            className="appearance-quick-tray"
            data-navigation-tools={navigationAvailable || undefined}
            popover="manual"
            role="group"
            dir={dir}
            aria-label={t({
              en: "Quick appearance tools",
              ar: "أدوات المظهر السريعة",
            })}
            style={position}
            onPointerEnter={clear}
            onPointerLeave={scheduleClose}
            onFocus={clear}
            onBlur={scheduleClose}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                dismiss(true);
              }
            }}
          >
            <button
              type="button"
              className="language-button"
              data-locale={locale}
              aria-label={
                locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"
              }
              title={
                locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"
              }
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            >
              <UtilityGlyph kind="language" locale={locale} />
            </button>
            <button
              type="button"
              aria-label={t({
                en: "Try a random theme",
                ar: "جرّب مظهراً عشوائياً",
              })}
              title={t({ en: "Random theme", ar: "مظهر عشوائي" })}
              onClick={randomTheme}
            >
              <Shuffle size={21} />
            </button>
            <button
              type="button"
              disabled={!accountAvailable}
              aria-label={t(
                !accountAvailable
                  ? {
                      en: "Sign in to change navigation layout",
                      ar: "سجّل الدخول لتغيير اتجاه التنقل",
                    }
                  : navigation === "vertical"
                    ? {
                        en: "Use horizontal navigation",
                        ar: "استخدم التنقل الأفقي",
                      }
                    : {
                        en: "Use vertical navigation",
                        ar: "استخدم التنقل العمودي",
                      },
              )}
              title={t(
                !accountAvailable
                  ? {
                      en: "Sign in to change navigation",
                      ar: "سجّل الدخول لتغيير التنقل",
                    }
                  : navigation === "vertical"
                    ? { en: "Horizontal navigation", ar: "تنقل أفقي" }
                    : { en: "Vertical navigation", ar: "تنقل عمودي" },
              )}
              onClick={() => {
                setNavigation(
                  navigation === "vertical" ? "horizontal" : "vertical",
                );
                dismiss();
              }}
            >
              {navigation === "vertical" ? (
                <Rows2 size={21} />
              ) : (
                <Columns2 size={21} />
              )}{" "}
              {!accountAvailable && (
                <LockKeyhole className="quick-tool-lock" size={11} />
              )}
            </button>
            {navigationAvailable && (
              <NavigationControls
                onHide={() => {
                  dismiss();
                  navState?.hide();
                }}
              />
            )}
            <span className="sr-only" role="status">
              {message}
            </span>
          </div>,
          anchor.current?.closest("dialog[open]") || document.body,
        )}
    </span>
  );
}
