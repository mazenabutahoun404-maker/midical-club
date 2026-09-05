import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { AppLink } from "../navigation/AppLink";

export function AcademicPortalCard({
  href,
  eyebrow,
  title,
  description,
  action,
  tone,
  children,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  tone: "basic" | "clinical";
  children?: ReactNode;
}) {
  function follow(event: PointerEvent<HTMLAnchorElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--spot-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--spot-y",
      `${event.clientY - bounds.top}px`,
    );
  }
  return (
    <AppLink
      href={href}
      className={`academic-portal portal-${tone}`}
      onPointerMove={follow}
      style={{ "--spot-x": "65%", "--spot-y": "35%" } as CSSProperties}
    >
      <span className="portal-spot" aria-hidden="true" />
      <span className="portal-grid" aria-hidden="true" />
      <span className="portal-copy">
        <span className="academic-kicker">{eyebrow}</span>
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      {children}
      <span className="portal-action">
        {action}
        <ArrowUpRight size={19} className="directional" />
      </span>
    </AppLink>
  );
}
