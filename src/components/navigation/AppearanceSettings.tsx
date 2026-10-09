import { appearancePalettes } from "../../app/providers/appearance-palettes";
import { UtilityGlyph } from "./UtilityGlyph";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { NavigationHint } from "./NavigationHint";
import { Check, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Modal } from "../ui/Modal";
import {
  useAppearance,
  type NavigationLayout,
} from "../../app/providers/AppearanceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
export function AppearanceSettings({ compact = false }: { compact?: boolean }) {
  const paths = useWorkspacePaths();
  const { navigation, setNavigation, persisted, palette, setPalette } =
    useAppearance();
  const { label, t } = useLocale();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.key]);
  return (
    <>
      <NavigationHint label={label("appearance")}>
        <button
          className={
            compact
              ? "workspace-icon appearance-shortcut"
              : "navigation-preferences"
          }
          aria-label={label("appearance")}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <UtilityGlyph kind="appearance" />
          {!compact && <span>{label("appearance")}</span>}
        </button>
      </NavigationHint>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={label("appearanceTitle")}
        description={label("appearanceDescription")}
        className="appearance-dialog"
        onAfterClose={() => {
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
        <fieldset className="appearance-palettes">
          <legend>{t({ en: "Reading palette", ar: "ألوان القراءة" })}</legend>
          <p>
            {t({
              en: "Choose a palette; the light / dark / system button still works.",
              ar: "اختر الألوان؛ يبقى زر الفاتح والداكن وحسب الجهاز متاحاً.",
            })}
          </p>
          <div className="appearance-palette-grid">
            {appearancePalettes.map((choice) => (
              <label
                key={choice.id}
                className="appearance-palette-option"
                data-selected={palette === choice.id || undefined}
              >
                <input
                  type="radio"
                  name="appearance-palette"
                  value={choice.id}
                  checked={palette === choice.id}
                  onChange={() => setPalette(choice.id)}
                />
                <span className="palette-swatches" aria-hidden="true">
                  {choice.swatches.map((color) => (
                    <i key={color} style={{ backgroundColor: color }} />
                  ))}
                </span>
                <span>
                  <strong>{t(choice.title)}</strong>
                  <small>{t(choice.description)}</small>
                </span>
                {palette === choice.id && (
                  <Check size={15} aria-hidden="true" />
                )}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="layout-options">
          <legend>{label("desktopNavigation")}</legend>
          {(["vertical", "horizontal"] as NavigationLayout[]).map((layout) => (
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
          ))}
        </fieldset>
        <p className="settings-note">{label("mobileNavigationNote")}</p>
        <p className="settings-saved" role="status">
          {label(persisted ? "preferencesSaved" : "sessionOnly")}
        </p>
        <button
          className="button button-primary appearance-done"
          onClick={() => setOpen(false)}
        >
          {label("done")}
          <Check size={17} />
        </button>
      </Modal>
    </>
  );
}
