import { useServices } from "../../app/providers/ServicesProvider";
import { LiveBookmark } from "../../features/student-live/Bookmark";
import { useEffect, useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { useSavedItems } from "../../app/providers/SavedItemsProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { IconButton } from "../ui/IconButton";
function PreviewSaveButton({ id, title }: { id: string; title: string }) {
  const { saved, toggle, isPending } = useSavedItems();
  const { label } = useLocale();
  const active = saved.includes(id);
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [motion, setMotion] = useState<"saved" | "removed" | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const destination = () =>
    [...document.querySelectorAll<HTMLElement>("[data-library-destination]")]
      .find((item) => {
        const rect = item.getBoundingClientRect();
        const style = getComputedStyle(item);
        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden";
      });

  const sendBookmark = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !button.current)
      return;
    const start = button.current.getBoundingClientRect();
    const target = destination()?.getBoundingClientRect();
    const icon = button.current.querySelector("svg")?.cloneNode(true);
    if (!icon) return;
    const flight = document.createElement("span");
    flight.className = "save-destination-flight";
    flight.setAttribute("aria-hidden", "true");
    flight.style.setProperty("--flight-x", `${(target?.left ?? window.innerWidth - 34) - start.left}px`);
    flight.style.setProperty("--flight-y", `${(target?.top ?? 20) - start.top}px`);
    flight.style.left = `${start.left}px`;
    flight.style.top = `${start.top}px`;
    flight.append(icon);
    document.body.append(flight);
    flight.addEventListener("animationend", () => flight.remove(), { once: true });
    window.setTimeout(() => flight.remove(), 800);
  };

  const activate = async () => {
    if (!active) sendBookmark();
    await toggle(id);
    setMotion(active ? "removed" : "saved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMotion(null), 560);
  };
  return (
    <IconButton
      ref={button}
      className="save-button"
      data-motion-state={motion || undefined}
      label={`${label(active ? "unsave" : "save")} ${title}`}
      aria-pressed={active}
      disabled={isPending}
      onClick={() => void activate()}
    >
      <Bookmark size={18} fill={active ? "currentColor" : "none"} />
    </IconButton>
  );
}

export function SaveButton(props: {id:string;title:string}) {return useServices().studentApi ? <LiveBookmark {...props}/> : <PreviewSaveButton {...props}/>;}
