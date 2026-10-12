/** One short flight to a visible bin, with no layout change and no animation loop. */
let cancelCurrent: (() => void) | undefined;
export function throwToTrash(source: HTMLElement | null, title: string) {
  cancelCurrent?.();
  if (
    !source ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    typeof source.animate !== "function" ||
    document.hidden
  )
    return { animated: false, finished: Promise.resolve(), cancel: () => {} };
  const rect = source.getBoundingClientRect();
  const rtl = document.documentElement.dir === "rtl";
  const overlay = document.createElement("div");
  overlay.className = "action-trash-flight";
  overlay.ariaHidden = "true";
  overlay.inert = true;
  const bin = document.createElement("div");
  bin.className = "action-flight-bin";
  bin.innerHTML =
    '<svg width="42" height="48" viewBox="0 0 32 38" fill="none" stroke="currentColor" stroke-width="1.7"><path class="flight-bin-lid" d="M3 9h26M11 9V5h10v4"/><path d="M6 12l2 22h16l2-22M12 15v14m8-14v14"/></svg>';
  const paper = document.createElement("div");
  paper.className = "action-flight-paper";
  const name = document.createElement("span");
  name.textContent = title.slice(0, 60);
  paper.append(name);
  const color = getComputedStyle(source);
  overlay.style.setProperty(
    "--flight-paper",
    color.getPropertyValue("--book-paper").trim() || "var(--card)",
  );
  overlay.style.setProperty(
    "--flight-ink",
    color.getPropertyValue("--book-ink").trim() || "var(--foreground)",
  );
  overlay.style.setProperty(
    "--flight-cover",
    color.getPropertyValue("--book-cover").trim() || "var(--primary)",
  );
  overlay.append(bin, paper);
  document.body.append(overlay);
  // A manual popover renders above native dialogs without moving focus.
  if (typeof overlay.showPopover === "function") {
    overlay.setAttribute("popover", "manual");
    try {
      overlay.showPopover();
    } catch {
      overlay.removeAttribute("popover");
    }
  }
  const w = Math.max(72, Math.min(138, rect.width)),
    h = 72;
  const x = Math.max(
    8,
    Math.min(window.innerWidth - w - 8, rect.left + rect.width / 2 - w / 2),
  );
  const y = Math.max(8, Math.min(window.innerHeight - h - 8, rect.top));
  paper.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
  const target = bin.getBoundingClientRect();
  const dx =
    (target.width
      ? target.left + target.width / 2
      : rtl
        ? 36
        : window.innerWidth - 36) -
    x -
    w / 2;
  const dy =
    (target.height ? target.top + 18 : window.innerHeight - 50) - y - h / 2;
  const flight = paper.animate(
    [
      { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.24}px,${Math.min(-36, dy * 0.24 - 65)}px) rotate(${rtl ? 15 : -15}deg) scale(.9)`,
        offset: 0.3,
        opacity: 1,
      },
      {
        transform: `translate(${dx * 0.84}px,${dy * 0.8 - 12}px) rotate(${rtl ? -25 : 25}deg) scale(.5)`,
        offset: 0.7,
        opacity: 1,
      },
      {
        transform: `translate(${dx}px,${dy}px) rotate(${rtl ? -70 : 70}deg) scale(.05,.15)`,
        opacity: 0,
      },
    ],
    { duration: 620, easing: "cubic-bezier(.22,.6,.3,1)", fill: "forwards" },
  );
  const lid = bin.querySelector<SVGElement>(".flight-bin-lid");
  const lidMotion =
    typeof lid?.animate === "function"
      ? lid.animate(
          [
            { transform: "translateY(0) rotate(0deg)" },
            { transform: "translateY(-6px) rotate(-12deg)", offset: 0.45 },
            { transform: "translateY(0) rotate(0deg)" },
          ],
          { delay: 230, duration: 430, easing: "ease-in-out" },
        )
      : undefined;
  let done = false;
  const cancel = () => {
    if (done) return;
    done = true;
    flight.cancel();
    lidMotion?.cancel();
    overlay.remove();
    if (cancelCurrent === cancel) cancelCurrent = undefined;
  };
  cancelCurrent = cancel;
  const finished = flight.finished.catch(() => {}).then(cancel);
  return { animated: true, finished, cancel };
}
