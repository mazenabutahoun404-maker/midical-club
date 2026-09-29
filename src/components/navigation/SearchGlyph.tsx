export function SearchGlyph() {
  return (
    <svg
      className="search-glyph"
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
      <path className="search-glyph-scan" d="M6.5 10.5h8" />
      <path className="search-glyph-signal" d="M10.5 7v7" />
    </svg>
  );
}
