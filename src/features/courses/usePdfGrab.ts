import { useEffect, type RefObject } from "react";

/** Drag paper, or hold Space / the middle mouse button to pan over selectable text. */
export function usePdfGrab(viewport: RefObject<HTMLDivElement | null>, enabled: boolean, placing: boolean) {
  useEffect(() => {
    const element = viewport.current;
    if (!element || !enabled || placing) return;
    let space = false;
    let drag: { id: number; x: number; y: number; left: number; top: number } | null = null;
    let frame = 0;
    let nextLeft = 0, nextTop = 0;
    const interactive = (target: EventTarget | null) => target instanceof Element && !!target.closest("button,a,input,textarea,select,[contenteditable],.pdf-margin-marker,.pdf-note-sticker");
    const stop = () => {
      const previous = drag;
      drag = null;
      if (previous && element.hasPointerCapture(previous.id)) element.releasePointerCapture(previous.id);
      delete element.dataset.grabbing;
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || interactive(event.target) || (event.button !== 0 && event.button !== 1)) return;
      if (event.button === 0 && !space && event.target instanceof Element && event.target.closest(".textLayer span")) return;
      event.preventDefault();
      element.focus({ preventScroll: true });
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: element.scrollLeft, top: element.scrollTop };
      element.setPointerCapture(event.pointerId);
      element.dataset.grabbing = "true";
    };
    const move = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      nextLeft = drag.left + drag.x - event.clientX;
      nextTop = drag.top + drag.y - event.clientY;
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        element.scrollLeft = nextLeft;
        element.scrollTop = nextTop;
      });
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || !element.contains(document.activeElement) || interactive(event.target)) return;
      event.preventDefault();
      space = true;
      element.dataset.grabSpace = "true";
    };
    const keyup = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      space = false;
      delete element.dataset.grabSpace;
      stop();
    };
    const blur = () => { space = false; delete element.dataset.grabSpace; stop(); };
    const aux = (event: MouseEvent) => { if (event.button === 1) event.preventDefault(); };
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", stop);
    element.addEventListener("pointercancel", stop);
    element.addEventListener("lostpointercapture", stop);
    element.addEventListener("auxclick", aux);
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", blur);
    return () => {
      cancelAnimationFrame(frame);
      stop();
      delete element.dataset.grabSpace;
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", stop);
      element.removeEventListener("pointercancel", stop);
      element.removeEventListener("lostpointercapture", stop);
      element.removeEventListener("auxclick", aux);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", blur);
    };
  }, [viewport, enabled, placing]);
}
