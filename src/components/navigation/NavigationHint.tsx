import { useState, type ReactElement } from "react";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
/** Keep icon-only navigation named for keyboard and pointer users. */
export function NavigationHint({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}) {
  const { sidebarCollapsed, navigation } = useAppearance();
  const [open, setOpen] = useState(false);
  return (
    <Tooltip
      open={sidebarCollapsed && navigation === "vertical" && open}
      onOpenChange={setOpen}
    >
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={17}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
