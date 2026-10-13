import day1 from "../../assets/home/auth-renewal-day-1.webp";
import day2 from "../../assets/home/auth-renewal-day-2.webp";
import day3 from "../../assets/home/auth-renewal-day-3.webp";
import day4 from "../../assets/home/auth-renewal-day-4.webp";
import day5 from "../../assets/home/auth-renewal-day-5.webp";
import night1 from "../../assets/home/auth-renewal-night-1.webp";
import night2 from "../../assets/home/auth-renewal-night-2.webp";
import night3 from "../../assets/home/auth-renewal-night-3.webp";
import night4 from "../../assets/home/auth-renewal-night-4.webp";
import night5 from "../../assets/home/auth-renewal-night-5.webp";

export const restorationArt = { day: [day1, day2, day3, day4, day5], night: [night1, night2, night3, night4, night5] };
const ready = new Map<string, Promise<void>>();
export function prepareRestorationImage(source: string) {
  const cached = ready.get(source);
  if (cached) return cached;
  const promise = new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = "low";
    image.onload = () => { void image.decode().catch(() => {}).then(resolve); };
    image.onerror = () => { ready.delete(source); reject(new Error("Restoration image unavailable")); };
    image.src = source;
  });
  ready.set(source, promise);
  return promise;
}
