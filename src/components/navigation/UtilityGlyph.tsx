/** Parts move inside a stable 20px box; utility labels and hit areas never shift. */
export function UtilityGlyph({ kind }: { kind: "language" | "appearance" }) {
  return (
    <svg
      className={`utility-glyph utility-${kind}`}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "appearance" ? (
        <>
          <path d="M3 6h18M3 12h18M3 18h18" />
          <circle className="utility-knob first" cx="8" cy="6" r="2" />
          <circle className="utility-knob second" cx="16" cy="12" r="2" />
          <circle className="utility-knob third" cx="10" cy="18" r="2" />
        </>
      ) : (
        <>
          <g className="utility-language-first">
            <path d="M3 5h12M9 3v2M12 5c0 5-4 9-9 11M5 8c1 4 4 6 7 7" />
          </g>
          <g className="utility-language-second">
            <path d="m14 21 4-10 4 10M15.5 17h5" />
          </g>
        </>
      )}
    </svg>
  );
}
