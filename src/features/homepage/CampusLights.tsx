import { useId } from "react";
import { campusDestinations } from "./living-campus";
import "./campus-lights.css";

const centers: Record<string, [number, number]> = {
  learning: [740, 265],
  media: [1065, 170],
  community: [1330, 235],
  mentorship: [1490, 465],
  contribution: [1300, 680],
  journals: [770, 665],
};
export function CampusLights({
  lit,
  revealed,
  destinations = campusDestinations,
  origin = [1070, 578],
}: {
  lit: string | null;
  revealed: string[];
  destinations?: Array<{
    id: string;
    polygon: string;
    route: string;
    lightX?: number;
    lightY?: number;
  }>;
  origin?: [number, number];
}) {
  const id = useId().replace(/:/g, "");
  return (
    <g className="campus-life" aria-hidden="true" pointerEvents="none">
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop
            stopColor="var(--campus-path-color, var(--ring))"
            stopOpacity=".24"
          />
          <stop
            offset="1"
            stopColor="var(--campus-path-color, var(--ring))"
            stopOpacity="0"
          />
        </radialGradient>
        {destinations.map((destination) => (
          <clipPath id={`${id}-${destination.id}`} key={destination.id}>
            <polygon points={destination.polygon} />
          </clipPath>
        ))}
      </defs>
      <ellipse
        className="campus-life-core"
        cx={origin[0]}
        cy={origin[1]}
        rx={166}
        ry={61}
      />
      {destinations.map((destination) => {
        const [x, y] =
          destination.lightX !== undefined && destination.lightY !== undefined
            ? [destination.lightX, destination.lightY]
            : centers[destination.id];
        return (
          <g
            key={destination.id}
            data-campus-life-destination={destination.id}
            data-lit={lit === destination.id || undefined}
            className="campus-life-destination"
          >
            <path
              className="campus-life-route"
              d={destination.route}
              pathLength={1}
              data-revealed={revealed.includes(destination.id) || undefined}
            />
            <circle
              className="campus-life-glow"
              cx={x}
              cy={y}
              r={96}
              fill={`url(#${id}-glow)`}
              clipPath={`url(#${id}-${destination.id})`}
            />
            <g className="campus-life-sparks">
              <path d={`M${x - 9} ${y}h18M${x} ${y - 9}v18`} />
              <circle cx={x - 28} cy={y + 16} r={2.5} />
              <circle cx={x + 25} cy={y - 22} r={2} />
            </g>
          </g>
        );
      })}
    </g>
  );
}
