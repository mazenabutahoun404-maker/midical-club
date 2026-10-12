import type { ComponentProps } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";

/** Radix adds hover and keyboard hints without inserting a layout wrapper. */
export function PdfToolButton(props: ComponentProps<"button">) {
  const caption = props["aria-label"] || props.title;
  if (!caption) return <button {...props} />;
  return <TooltipProvider delayDuration={250}><Tooltip><TooltipTrigger asChild>
    <button {...props} title={props.title || props["aria-label"]} />
  </TooltipTrigger><TooltipContent className="pdf-tool-tooltip" side="bottom" sideOffset={6}>{caption}</TooltipContent></Tooltip></TooltipProvider>;
}
