/** Two non-interactive binding loops. Decorations never take hit targets or focus. */
export function NotebookFittings({ axis }: { axis: "rail" | "header" }) {
  return (
    <span className={`notebook-fittings fittings-${axis}`} aria-hidden="true">
      <i />
      <i />
    </span>
  );
}
