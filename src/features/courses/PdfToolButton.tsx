import type { ComponentProps } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";

/** Radix adds hover and keyboard hints without inserting a layout wrapper. */
export function PdfToolButton(props: ComponentProps<"button">) {
  const { title, ...buttonProps } = props;
  const caption = buttonProps["aria-label"] || title;
  if (!caption) return <button {...buttonProps} />;
  return <TooltipProvider delayDuration={250}><Tooltip><TooltipTrigger asChild>
    <button {...buttonProps} />
  </TooltipTrigger><TooltipContent className="pdf-tool-tooltip" side="bottom" sideOffset={6}>{caption}</TooltipContent></Tooltip></TooltipProvider>;
}
