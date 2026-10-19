import { useId } from "react";
type Kind = "heart" | "neuron" | "molecule" | "scope";
/** Small, decorative anatomical signatures; they never carry information alone. */
export function MedicalMark({
  kind = "heart",
  className = "",
}: {
  kind?: Kind;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={`medical-mark ${className}`}
      viewBox="0 0 120 120"
      fill="none"
      stroke={`url(#${id})`}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={id}
          x1="15"
          y1="15"
          x2="105"
          y2="105"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="var(--medical-secondary,currentColor)" />
        </linearGradient>
      </defs>
      {kind === "heart" && (
        <>
          <path d="M57 32C43 21 26 34 26 51C26 70 46 96 64 103C79 94 98 77 96 57C95 40 79 33 70 42L65 23L57 19Z" />
          <path d="M56 34L48 21L39 25L45 39M69 43L79 27L89 29L80 48M44 45C51 56 68 63 67 94M53 57L42 68M65 68L80 62M68 79L79 85" />
        </>
      )}
      {kind === "neuron" && (
        <>
          <path d="M48 43L66 39L78 52L73 71L54 79L40 62Z" />
          <path d="M48 43L34 29L29 12M34 29L16 30M66 39L72 21L88 12M72 21L68 10M78 52L99 45L109 30M99 45L112 55M73 71L92 85L110 87M92 85L96 105M54 79L50 101L39 112M50 101L62 112M40 62L21 70L10 65M21 70L14 85" />
          <circle cx="59" cy="58" r="9" />
        </>
      )}
      {kind === "molecule" && (
        <>
          <path d="M34 32L63 20L88 43L87 79L57 98L27 77L34 32M36 38L58 51L81 46M58 51L57 90M57 51L32 73" />
          {[
            [34, 32],
            [63, 20],
            [88, 43],
            [87, 79],
            [57, 98],
            [27, 77],
            [58, 51],
          ].map(([x, y]) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="6"
              fill="var(--background)"
            />
          ))}
        </>
      )}
      {kind === "scope" && (
        <>
          <path d="M28 19V45C28 68 65 68 65 45V19M28 20L36 24M65 20L57 24M46 63V83C46 110 93 109 93 83V67" />
          <circle cx="93" cy="56" r="12" />
          <circle cx="93" cy="56" r="5" />
        </>
      )}
    </svg>
  );
}
