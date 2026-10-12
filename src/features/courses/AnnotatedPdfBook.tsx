import type { ComponentProps } from "react";
import { PdfBook } from "./PdfBook";
import { usePdfMargins } from "../study-hub/PdfMarginNotes";
/** The renderer stays standalone; signed-in annotations use the product service layer here. */
export function AnnotatedPdfBook(
  props: Omit<ComponentProps<typeof PdfBook>, "marginNotes">,
) {
  const notes = usePdfMargins(props.item, props.initialPage);
  return <PdfBook {...props} marginNotes={notes} />;
}
