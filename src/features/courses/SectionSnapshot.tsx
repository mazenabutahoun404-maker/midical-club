import { useLayoutEffect, useRef } from "react";
const ignored = ".textLayer, video, audio, .page-hand-edge, .hand-turn-leaf";
/** Animation faces have a bounded DOM/pixel budget; live reading content is untouched. */
function visualCopy(source: HTMLElement) {
  let remaining = 800;
  function clone(node: Node): Node | null {
    if (--remaining < 0 || (node instanceof Element && node.matches(ignored))) return null;
    const copy = node.cloneNode(false);
    if (node instanceof HTMLCanvasElement && copy instanceof HTMLCanvasElement) {
      if (node.width && node.height) {
        const scale = Math.min(1, Math.sqrt(600_000 / (node.width * node.height)));
        copy.width = Math.max(1, Math.round(node.width * scale));
        copy.height = Math.max(1, Math.round(node.height * scale));
        copy.getContext("2d")?.drawImage(node, 0, 0, copy.width, copy.height);
      }
    } else {
      for (const child of node.childNodes) {
        const next = clone(child);
        if (next) copy.appendChild(next);
        if (remaining <= 0) break;
      }
    }
    if (copy instanceof Element) copy.removeAttribute("id");
    return copy;
  }
  return clone(source) as HTMLElement;
}
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
  const snapshot = visualCopy(page);
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
      const copy = visualCopy(snapshot);
      root.current?.replaceChildren(copy);
    }
    return () => root.current?.replaceChildren();
  }, [snapshot]);
  return <div ref={root} className="section-page-snapshot" />;
}
