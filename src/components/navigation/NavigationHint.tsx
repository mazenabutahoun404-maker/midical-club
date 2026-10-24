import { useEffect, useState, type ReactElement } from "react";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
/** Keep icon-only navigation named for keyboard and pointer users. */
export function NavigationHint({
  label,
  children,
  side = "right",
  disabled = false,
}: {
  label: string;
  children: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  disabled?: boolean;
}) {
  const { sidebarCollapsed, navigation } = useAppearance();
  const [open, setOpen] = useState(false);
  const enabled = !disabled && sidebarCollapsed && navigation === "vertical";
  useEffect(() => setOpen(false), [sidebarCollapsed, navigation]);
  return (
    <Tooltip
      open={enabled && open}
      onOpenChange={(value) => setOpen(enabled && value)}
    >
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={17}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
