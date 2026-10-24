import type { CSSProperties } from "react";
import anatomyAtlas from "../../assets/medical/anatomy-atlas-v1362.webp";

export type AnatomyKind = "heart" | "lungs" | "brain" | "bone";
/** Decorative teaching sculptures from a shared transparent image atlas. */
export function MedicalFigure({
  kind = "heart",
  className = "",
}: {
  kind?: AnatomyKind;
  className?: string;
}) {
  return (
    <span
      className={`medical-figure ${className}`}
      data-anatomy={kind}
      aria-hidden="true"
      style={{ "--anatomy-atlas": `url("${anatomyAtlas}")` } as CSSProperties}
    />
  );
}
