import { PanelLeft, PanelTop } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { resolveSectionLayout, type SectionLayout } from "./study-state";
import { useStudyChrome } from "../../app/providers/StudyChromeProvider";

/** One press changes orientation without opening a menu or moving the reader. */
export function SectionLayoutControl({
  value,
  focus,
  onChange,
}: {
  value: SectionLayout;
  focus: boolean;
  onChange: (value: SectionLayout) => void;
}) {
  const { t } = useLocale();
  const { courseNavigationVisible } = useStudyChrome();
  const horizontal =
    resolveSectionLayout(value, focus, courseNavigationVisible) ===
    "horizontal";
  const Icon = horizontal ? PanelTop : PanelLeft;
  const name = t({ en: "Course sections layout", ar: "ترتيب أقسام المساق" });
  return (
    <button
      type="button"
      className="study-section-layout"
      aria-label={name}
      aria-pressed={horizontal}
      title={t(
        horizontal
          ? { en: "Move sections to the side", ar: "نقل الأقسام إلى الجانب" }
          : { en: "Move sections to the top", ar: "نقل الأقسام إلى الأعلى" },
      )}
      onClick={() => onChange(horizontal ? "vertical" : "horizontal")}
    >
      <Icon size={18} aria-hidden="true" />
      <span aria-hidden="true">{t({ en: "Sections", ar: "الأقسام" })}</span>
    </button>
  );
}
