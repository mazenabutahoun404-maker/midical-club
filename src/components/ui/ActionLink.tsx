import type { ReactNode } from "react";
import { Button } from "./button";
import { AppLink } from "../navigation/AppLink";
export function ActionLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
}) {
  return (
    <Button
      asChild
      className={`button button-${variant}`}
      variant={variant === "primary" ? "default" : "outline"}
    >
      <AppLink href={href}>{children}</AppLink>
    </Button>
  );
}
