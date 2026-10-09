import { useLayoutEffect, useRef } from "react";
/** Copy our own rendered surface for the visual face; the real content stays accessible once. */
export function captureSectionPage(
  source: HTMLElement | null,
  backwards = false,
): HTMLElement | null {
  if (!source) return null;
  const pdfPages = source.querySelectorAll<HTMLElement>(
    ".pdf-book-pages > .pdf-paper-page",
  );
  const page = pdfPages.length
    ? pdfPages[backwards ? 0 : pdfPages.length - 1]
    : source.querySelector<HTMLElement>(".notebook-primary-pane") || source;
  const snapshot = page.cloneNode(true) as HTMLElement;
  const original = page.querySelectorAll<HTMLCanvasElement>("canvas");
  snapshot
    .querySelectorAll<HTMLCanvasElement>("canvas")
    .forEach((canvas, index) => {
      const pixels = original[index];
      if (!pixels?.width) return;
      canvas.width = pixels.width;
      canvas.height = pixels.height;
      canvas.getContext("2d")?.drawImage(pixels, 0, 0);
    });
  snapshot
    .querySelectorAll<HTMLElement>("[id]")
    .forEach((node) => node.removeAttribute("id"));
  snapshot.removeAttribute("id");
  snapshot
    .querySelectorAll<HTMLElement>(
      "video,audio,.page-hand-edge,.hand-turn-leaf",
    )
    .forEach((node) => node.remove());
  snapshot.setAttribute("aria-hidden", "true");
  snapshot.inert = true;
  return snapshot;
}
export function SectionSnapshot({
  snapshot,
}: {
  snapshot: HTMLElement | null;
}) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (snapshot) {
      // A snapshot may appear on both the flat paper and its curved outer edge.
      // Give each visual surface its own pixels; never move the original node.
      const copy = snapshot.cloneNode(true) as HTMLElement;
      const pixels = snapshot.querySelectorAll<HTMLCanvasElement>("canvas");
      copy
        .querySelectorAll<HTMLCanvasElement>("canvas")
        .forEach((canvas, index) => {
          if (!pixels[index]?.width) return;
          canvas.width = pixels[index].width;
          canvas.height = pixels[index].height;
          canvas.getContext("2d")?.drawImage(pixels[index], 0, 0);
        });
      root.current?.replaceChildren(copy);
    }
    return () => root.current?.replaceChildren();
  }, [snapshot]);
  return <div ref={root} className="section-page-snapshot" />;
}
