import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { NavigationHint } from "./NavigationHint";
import { Check, SlidersHorizontal, X } from "lucide-react";
import {
  useAppearance,
  type NavigationLayout,
} from "../../app/providers/AppearanceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../ui/dialog";
export function AppearanceSettings({ compact = false }: { compact?: boolean }) {
  const paths = useWorkspacePaths();
  const { navigation, setNavigation, persisted } = useAppearance();
  const { label, dir } = useLocale();
  return (
    <Dialog>
      <NavigationHint label={label("appearance")}>
        <DialogTrigger asChild>
          <button
            className={
              compact
                ? "workspace-icon appearance-shortcut"
                : "navigation-preferences"
            }
            aria-label={label("appearance")}
          >
            <SlidersHorizontal size={19} />
            {!compact && <span>{label("appearance")}</span>}
          </button>
        </DialogTrigger>
      </NavigationHint>
      <DialogContent
        dir={dir}
        showCloseButton={false}
        className="appearance-dialog medclub-modal"
        onCloseAutoFocus={(event) => {
          // Switching orientation can hide the trigger that originally opened this dialog.
          if (
            !paths.personal &&
            window.matchMedia("(min-width: 768px)").matches
          ) {
            const selector =
              navigation === "horizontal"
                ? ".workspace-header .appearance-shortcut"
                : ".desktop-navigation .navigation-preferences";
            const target = document.querySelector<HTMLButtonElement>(selector);
            if (target) {
              event.preventDefault();
              target.focus();
            }
          }
        }}
      >
        <div className="appearance-heading">
          <span className="settings-symbol">
            <SlidersHorizontal size={25} />
          </span>
          <DialogTitle>{label("appearanceTitle")}</DialogTitle>
          <DialogDescription>
            {label("appearanceDescription")}
          </DialogDescription>
        </div>
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
        <DialogClose className="button button-primary appearance-done">
          {label("done")}
          <Check size={17} />
        </DialogClose>
        <DialogClose className="modal-close" aria-label={label("close")}>
          <X size={20} />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
