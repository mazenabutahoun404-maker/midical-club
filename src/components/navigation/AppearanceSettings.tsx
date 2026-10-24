import { appearancePreviewColors } from "../../app/providers/appearance-preview-colors";
import {
  appearanceChoices,
  appearanceChoiceId,
} from "../../app/providers/appearance-choices";
import { AppearanceQuickTools } from "./AppearanceQuickTools";
import { LanguageMenu } from "./LanguageMenu";
import { ThemePreview } from "./ThemePreview";
import { UtilityGlyph } from "./UtilityGlyph";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { NavigationHint } from "./NavigationHint";
import { Check, LockKeyhole, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavigationControls, useNavigationState } from "./AdaptiveNavigation";
import { useLocation } from "react-router-dom";
import { Modal } from "../ui/Modal";
import { AppLink } from "./AppLink";
import { signInPath } from "../../constants/routes";
import "../../styles/appearance-locked.css";
import {
  useAppearance,
  type NavigationLayout,
} from "../../app/providers/AppearanceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
export function AppearanceSettings({ compact = false }: { compact?: boolean }) {
  const navState = useNavigationState();
  const hideNavigationOnClose = useRef(false);
  const paths = useWorkspacePaths();
  const {
    accountAvailable,
    navigation,
    setNavigation,
    sidebarCollapsed,
    setSidebarCollapsed,
    persisted,
    palette,
    colorMode,
    setThemeChoice,
    resolvedTheme,
  } = useAppearance();
  const { label, t } = useLocale();
  const choices = appearanceChoices;
  const [lockedChoice, setLockedChoice] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [manualPreview, setManualPreview] = useState(false);
  const closePreview = () => {
    setPreview(null);
    setManualPreview(false);
  };
  const showPreview = (id: string) => {
    setPreview(id);
  };
  const previewChoice = appearanceChoices.find(
    (choice) => choice.id === preview,
  );
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    setLockedChoice(null);
    closePreview();
  }, [location.key]);
  return (
    <>
      <AppearanceQuickTools compact={compact} onOpenPanel={open}>
        <NavigationHint label={label("appearance")} side="top">
          <button
            className={
              compact
                ? "workspace-icon appearance-shortcut"
                : "navigation-preferences"
            }
            aria-label={label("appearance")}
            aria-description={t({
              en: "Hover, hold on touch, or press Arrow Up for quick tools.",
              ar: "مرّر، أو اضغط مطولاً باللمس، أو اضغط السهم للأعلى للأدوات السريعة.",
            })}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => {
              setOpen(true);
              setManualPreview(false);
              setPreview(
                accountAvailable
                  ? appearanceChoiceId(palette, colorMode)
                  : null,
              );
            }}
          >
            <UtilityGlyph kind="appearance" />
            {!compact && <span>{label("appearance")}</span>}
          </button>
        </NavigationHint>
      </AppearanceQuickTools>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          closePreview();
        }}
        title={label("appearanceTitle")}
        description={
          accountAvailable
            ? label("appearanceDescription")
            : t({
                en: "MedClub Light and Dark are yours to use. Sign in to unlock every theme.",
                ar: "استخدم ميدكلب الفاتح والداكن. سجّل الدخول لفتح كل المظاهر.",
              })
        }
        className={`appearance-dialog${accountAvailable ? "" : " appearance-dialog-guest"}`}
        onAfterClose={() => {
          // Close native modality before hiding, so its restored focus cannot reopen the rail.
          if (hideNavigationOnClose.current) {
            hideNavigationOnClose.current = false;
            navState?.hide();
            return;
          }
          if (navState?.manualHidden) {
            navState.suppressHandleFocus.current = true;
            navState.handle.current?.focus({ preventScroll: true });
            navState.suppressHandleFocus.current = false;
            return;
          }
          // Switching orientation can hide the trigger that originally opened this dialog.
          if (
            !paths.personal &&
            window.matchMedia("(min-width: 768px)").matches
          ) {
            const selector =
              navigation === "horizontal"
                ? ".workspace-header .appearance-shortcut, .admin-header .appearance-shortcut"
                : ".desktop-navigation .navigation-preferences";
            const target = document.querySelector<HTMLButtonElement>(selector);
            if (target) {
              target.focus({ preventScroll: true });
            }
          }
        }}
      >
        <div className="appearance-heading">
          <span className="settings-symbol">
            <SlidersHorizontal size={25} />
          </span>
        </div>
        {!accountAvailable && (
          <div className="appearance-unlock-callout" role="status">
            <LockKeyhole size={21} />
            <div>
              <strong>
                {lockedChoice
                  ? t(
                      appearanceChoices.find((c) => c.id === lockedChoice)!
                        .title,
                    )
                  : t({
                      en: "Make MedClub feel like you",
                      ar: "اجعل ميدكلب على ذوقك",
                    })}
              </strong>
              <p>
                {t({
                  en: "Preview every palette. Sign in to apply your favorites.",
                  ar: "شاهد كل المظاهر. سجّل الدخول لتطبيق مفضلاتك.",
                })}
              </p>
            </div>
            <AppLink
              href={signInPath(location.pathname + location.search)}
              className="button button-primary"
            >
              {t({ en: "Sign in to unlock", ar: "سجّل الدخول للفتح" })}
            </AppLink>
          </div>
        )}
        <div
          className="appearance-theme-browser"
          onPointerLeave={(event) => {
            if (
              event.pointerType === "mouse" &&
              !event.currentTarget.contains(document.activeElement)
            )
              closePreview();
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              closePreview();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && preview) {
              event.stopPropagation();
              closePreview();
            }
          }}
        >
          <div className="appearance-theme-groups">
            {(["light", "dark", "system"] as const).map((mode) => (
              <fieldset className="appearance-palettes" key={mode}>
                <legend>
                  {t(
                    mode === "light"
                      ? { en: "Light themes", ar: "مظاهر فاتحة" }
                      : mode === "dark"
                        ? { en: "Dark themes", ar: "مظاهر داكنة" }
                        : { en: "System appearance", ar: "مظهر الجهاز" },
                  )}
                </legend>
                <div className="appearance-palette-grid">
                  {choices
                    .filter((choice) => choice.mode === mode)
                    .map((choice) => {
                      const colors =
                        appearancePreviewColors[
                          `${choice.palette}-${choice.mode === "system" ? resolvedTheme : choice.mode}`
                        ];
                      const locked =
                        !accountAvailable &&
                        (choice.palette !== "medclub" ||
                          choice.mode === "system");
                      if (locked)
                        return (
                          <button
                            type="button"
                            key={choice.id}
                            className="appearance-palette-option appearance-theme-locked"
                            data-theme-choice={choice.id}
                            aria-label={
                              t(choice.title) +
                              " · " +
                              t({
                                en: "Sign in to unlock",
                                ar: "سجّل الدخول للفتح",
                              })
                            }
                            onPointerEnter={(event) => {
                              if (event.pointerType === "mouse")
                                showPreview(choice.id);
                            }}
                            onFocus={() => showPreview(choice.id)}
                            onClick={() => {
                              setLockedChoice(choice.id);
                              showPreview(choice.id);
                              setManualPreview(true);
                            }}
                          >
                            <span
                              className="theme-choice-swatches"
                              aria-hidden="true"
                              data-mode={mode}
                            >
                              {[
                                colors.background,
                                colors.sidebar,
                                colors.primary,
                              ].map((color, i) => (
                                <i key={i} style={{ backgroundColor: color }} />
                              ))}
                              <b>
                                <LockKeyhole size={14} />
                              </b>
                            </span>
                            <span>
                              <strong>{t(choice.title)}</strong>
                              <small>
                                {t({
                                  en: "Sign in to unlock",
                                  ar: "سجّل الدخول للفتح",
                                })}
                              </small>
                            </span>
                            <LockKeyhole size={14} aria-hidden="true" />
                          </button>
                        );
                      return (
                        <label
                          key={choice.id}
                          className="appearance-palette-option"
                          data-selected={
                            appearanceChoiceId(palette, colorMode) ===
                              choice.id || undefined
                          }
                          onPointerEnter={(event) => {
                            if (event.pointerType === "mouse")
                              showPreview(choice.id);
                          }}
                          onFocus={() => showPreview(choice.id)}
                        >
                          <input
                            type="radio"
                            name="appearance-palette"
                            value={choice.id}
                            checked={
                              appearanceChoiceId(palette, colorMode) ===
                              choice.id
                            }
                            onClick={() => {
                              // Legacy profiles can pair System mode with another palette.
                              // Clicking an already-checked radio must still apply this preset.
                              if (
                                choice.mode === "system" &&
                                colorMode === "system" &&
                                palette !== choice.palette
                              ) {
                                setThemeChoice(choice.id);
                                showPreview(choice.id);
                                setManualPreview(true);
                              }
                            }}
                            onChange={() => {
                              setThemeChoice(choice.id);
                              showPreview(choice.id);
                              setManualPreview(true);
                            }}
                          />
                          <span
                            className="theme-choice-swatches"
                            aria-hidden="true"
                            data-mode={mode}
                          >
                            {[
                              colors.background,
                              colors.sidebar,
                              colors.primary,
                            ].map((color, i) => (
                              <i key={i} style={{ backgroundColor: color }} />
                            ))}
                            <b>
                              {mode === "light"
                                ? "☀"
                                : mode === "dark"
                                  ? "☾"
                                  : "◐"}
                            </b>
                          </span>
                          <span>
                            <strong>{t(choice.title)}</strong>
                          </span>
                          {appearanceChoiceId(palette, colorMode) ===
                            choice.id && <Check size={15} aria-hidden="true" />}
                        </label>
                      );
                    })}
                </div>
              </fieldset>
            ))}
          </div>
          {previewChoice ? (
            <ThemePreview
              key={preview === null ? "closed" : "open"}
              choice={previewChoice}
              manual={manualPreview}
              onManual={() => setManualPreview(true)}
              onClose={closePreview}
            />
          ) : (
            <div className="theme-preview-idle">
              <SlidersHorizontal size={24} />
              <p>
                {t({
                  en: "Hover or focus a theme to preview four views. Select a view to pause the slideshow.",
                  ar: "مرّر أو ركّز على مظهر لمعاينة أربع صفحات. اختر صفحة لإيقاف العرض التلقائي.",
                })}
              </p>
            </div>
          )}
        </div>
        <div
          className="appearance-preference-row"
          data-account={accountAvailable}
        >
          <section className="appearance-language-row">
            <strong>{label("language")}</strong>
            <LanguageMenu />
          </section>
          {accountAvailable && (
            <section
              className="appearance-workspace-options"
              aria-label={t({
                en: "Workspace preferences",
                ar: "تفضيلات المساحة",
              })}
            >
              <div>
                <span>
                  <strong>{label("sidebarSize")}</strong>
                </span>
                <button
                  className="sidebar-setting-switch"
                  role="switch"
                  aria-checked={sidebarCollapsed}
                  aria-label={label("compactSidebar")}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  <span />
                </button>
              </div>
            </section>
          )}
        </div>
        {navState && !navState.studying && !navState.focus && (
          <section className="appearance-navigation-controls">
            <strong>
              {t({ en: "Navigation controls", ar: "التحكم بالتنقل" })}
            </strong>
            <NavigationControls
              variant="settings"
              onHide={() => {
                hideNavigationOnClose.current = true;
                setOpen(false);
                closePreview();
              }}
            />
          </section>
        )}
        {accountAvailable && (
          <>
            <fieldset className="layout-options">
              <legend>{label("desktopNavigation")}</legend>
              {(["vertical", "horizontal"] as NavigationLayout[]).map(
                (layout) => (
                  <label
                    className={`layout-option ${navigation === layout ? "selected" : ""}`}
                    key={layout}
                  >
                    <input
                      type="radio"
                      name="navigation-layout"
                      value={layout}
                      checked={navigation === layout}
                      onChange={() => setNavigation(layout)}
                    />
                    <span
                      className={`layout-miniature miniature-${layout}`}
                      aria-hidden="true"
                    >
                      <i className="mini-nav">
                        <b />
                        <b />
                        <b />
                      </i>
                      <i className="mini-page">
                        <b />
                        <span />
                        <span />
                      </i>
                    </span>
                    <span className="layout-option-label">
                      {label(layout)}
                      {navigation === layout && <Check size={17} />}
                    </span>
                    <small>
                      {label(
                        layout === "vertical"
                          ? "verticalDescription"
                          : "horizontalDescription",
                      )}
                    </small>
                  </label>
                ),
              )}
            </fieldset>
            <p className="settings-note">{label("mobileNavigationNote")}</p>
          </>
        )}
        <p className="settings-saved" role="status">
          {label(persisted ? "preferencesSaved" : "sessionOnly")}
        </p>
        <button
          className="button button-primary appearance-done"
          onClick={() => {
            setOpen(false);
            closePreview();
          }}
        >
          {label("done")}
          <Check size={17} />
        </button>
      </Modal>
    </>
  );
}
