import { DEMO_TODAY } from "../constants/config";
import type { ClubEvent, Opportunity } from "../types/content";

const demoNow = Date.parse(`${DEMO_TODAY}T12:00:00+03:00`);
export type EventAvailability =
  "upcoming" | "open" | "waitlist" | "closed" | "ended";

export function eventAvailability(event: ClubEvent): EventAvailability {
  if (demoNow > Date.parse(event.endDate)) return "ended";
  if (demoNow < Date.parse(event.registrationOpensAt)) return "upcoming";
  if (demoNow > Date.parse(event.registrationClosesAt)) return "closed";
  if (event.registeredCount >= event.capacity)
    return event.waitlistEnabled ? "waitlist" : "closed";
  return "open";
}

export const eventPlacesLeft = (event: ClubEvent) =>
  Math.max(0, event.capacity - event.registeredCount);

export function daysFromDemo(value: string) {
  const target = Date.parse(value.slice(0, 10) + "T12:00:00+03:00");
  return Math.ceil((target - demoNow) / 86_400_000);
}

export const opportunityIsOpen = (opportunity: Opportunity) =>
  daysFromDemo(opportunity.deadline) >= 0;
