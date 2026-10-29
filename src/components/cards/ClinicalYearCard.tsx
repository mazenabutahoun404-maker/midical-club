import { ArrowUpRight, Stethoscope } from "lucide-react";
import type { ClinicalYear } from "../../types/content";
import { clinicalYearPath } from "../../constants/routes";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../navigation/AppLink";

export function ClinicalYearCard({ year }: { year: ClinicalYear }) {
  const { t, label } = useLocale();
  return (
    <AppLink
      href={clinicalYearPath(year.slug)}
      className={`clinical-year-card clinical-${year.accent}`}
    >
      <span className="clinical-year-number" aria-hidden="true">
        {year.year}
      </span>
      <span className="clinical-year-icon">
        <Stethoscope size={22} />
      </span>
      <span className="clinical-year-copy">
        <small>{t(year.label)}</small>
        <strong>
          {t(year.tagline) ||
            t({
              en: `Year ${year.year} clinical courses`,
              ar: `مساقات السنة ${year.year} السريرية`,
            })}
        </strong>
        <span>
          {t(year.description) ||
            t({
              en: "Published courses and learning materials for this year.",
              ar: "المساقات والمصادر التعليمية المنشورة لهذه السنة.",
            })}
        </span>
      </span>
      <span className="clinical-year-focus">
        <small>{label("currentBlock")}</small>
        <b>
          {t(year.currentBlock) ||
            t({ en: "Not announced yet", ar: "لم يُعلن بعد" })}
        </b>
      </span>
      <span className="clinical-year-action">
        {label("exploreYear")}{" "}
        <ArrowUpRight size={18} className="directional" />
      </span>
    </AppLink>
  );
}
