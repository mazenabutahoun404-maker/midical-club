import { MedicalFigure } from "./MedicalFigure";
type Kind = "heart" | "neuron" | "molecule" | "scope";
export function MedicalMark({
  kind = "heart",
  className = "",
}: {
  kind?: Kind;
  className?: string;
}) {
  return (
    <MedicalFigure
      kind={
        kind === "neuron"
          ? "brain"
          : kind === "scope"
            ? "lungs"
            : kind === "molecule"
              ? "bone"
              : "heart"
      }
      className={`medical-mark ${className}`}
    />
  );
}
