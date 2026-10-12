/** Parts move inside a stable 20px box; utility labels and hit areas never shift. */
export function UtilityGlyph({ kind, locale = "ar" }: { kind: "language" | "appearance"; locale?: "en" | "ar" }) {
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
            <text x="6" y="11" textAnchor="middle" fill="currentColor" stroke="none" fontSize={locale === "en" ? "16" : "13"} fontWeight="750">{locale === "en" ? "ع" : "A"}</text>
          </g>
          <g className="utility-language-second">
            <text x="18" y="21" textAnchor="middle" fill="currentColor" stroke="none" fontSize={locale === "en" ? "13" : "16"} fontWeight="750">{locale === "en" ? "A" : "ع"}</text>
          </g>
        </>
      )}
    </svg>
  );
}
