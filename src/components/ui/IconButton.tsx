import type { ComponentProps } from "react";
import { Button } from "./button";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";
export function IconButton({
  label,
  children,
  ...props
}: ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          {...props}
          variant={props.variant || "ghost"}
          size="icon"
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
