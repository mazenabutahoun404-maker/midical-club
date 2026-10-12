/** Small code-native illustrations: distinct objects, no bitmap payload or ambient loop. */
export function StudyDeskArtwork({
  kind,
}: {
  kind: "recall" | "offline" | "room" | "portfolio";
}) {
  return (
    <svg
      className="study-desk-art"
      viewBox="0 0 240 100"
      fill="none"
      aria-hidden="true"
    >
      {kind === "recall" && (
        <>
          <rect
            className="desk-card-back"
            x="69"
            y="10"
            width="106"
            height="70"
            rx="7"
            fill="var(--desk-tint)"
            stroke="currentColor"
            transform="rotate(8 122 45)"
          />
          <g className="desk-recall-front">
            <rect
              x="60"
              y="19"
              width="110"
              height="70"
              rx="7"
              fill="var(--card)"
              stroke="currentColor"
            />
            <path
              d="M76 37h48m-48 9h34m-34 24h69"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <text
              x="145"
              y="53"
              fill="currentColor"
              fontSize="28"
              fontFamily="inherit"
            >
              ?
            </text>
          </g>
          <path
            className="desk-recall-answer"
            d="m138 48 6 6 13-15"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === "offline" && (
        <>
          <path
            d="M55 31V18h52l10 13h64v55H55z"
            fill="var(--desk-tint)"
            stroke="currentColor"
          />
          <g className="desk-offline-paper">
            <rect
              x="84"
              y="13"
              width="60"
              height="60"
              rx="3"
              fill="var(--card)"
              stroke="currentColor"
            />
            <path
              d="M97 25h34m-34 8h28m-28 8h34"
              stroke="currentColor"
              strokeWidth="2"
            />
          </g>
          <path
            d="M53 42h128l-9 45H62z"
            fill="var(--desk-tint)"
            stroke="currentColor"
          />
          <path
            className="desk-offline-check"
            d="m107 63 7 7 17-19"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === "room" && (
        <>
          <ellipse
            cx="120"
            cy="52"
            rx="50"
            ry="23"
            fill="var(--desk-tint)"
            stroke="currentColor"
          />
          <path d="M87 68v18m65-18v18" stroke="currentColor" strokeWidth="3" />
          {[62, 178].map((x) => (
            <g className="desk-room-seat" key={x}>
              <circle
                cx={x}
                cy="37"
                r="10"
                fill="var(--card)"
                stroke="currentColor"
              />
              <path
                d={`M${x - 12} 70v-9a12 12 0 0 1 24 0v9`}
                stroke="currentColor"
                strokeWidth="3"
              />
            </g>
          ))}
          <circle
            cx="120"
            cy="51"
            r="11"
            fill="var(--card)"
            stroke="currentColor"
          />
          <path
            className="desk-room-hand"
            d="M120 43v8l6 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === "portfolio" && (
        <>
          <rect
            x="65"
            y="13"
            width="110"
            height="74"
            rx="3"
            fill="var(--card)"
            stroke="currentColor"
          />
          <rect
            x="71"
            y="19"
            width="98"
            height="62"
            rx="2"
            stroke="currentColor"
            strokeOpacity=".45"
          />
          <path
            d="M91 33h58m-48 10h37m-50 13h26m-26 7h23"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <g className="desk-portfolio-seal">
            <path
              d="m144 63-8 28 10-5 9 5-8-28"
              fill="var(--desk-tint)"
              stroke="currentColor"
            />
            <circle
              cx="145"
              cy="61"
              r="12"
              fill="var(--desk-tint)"
              stroke="currentColor"
            />
            <path
              d="m139 61 4 4 8-9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </>
      )}
    </svg>
  );
}
