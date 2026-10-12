/** A closed door opens; the visitor steps through the doorway once on intent. */
export function SignOutGlyph() {
  return (
    <svg
      className="sign-out-glyph"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path className="sign-out-frame" d="M5 21V3h14v18M3 21h18" />
      <g className="sign-out-door">
        <path d="M6 4h12v16H6z" />
        <path d="M15 12h.01" />
      </g>
      <g className="sign-out-person">
        <circle cx="12" cy="8" r="1.7" />
        <path d="M12 10v5m0-4 4 1m-4-1-3 2m3 2-2 4m2-4 3 4" />
      </g>
    </svg>
  );
}
