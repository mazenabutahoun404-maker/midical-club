import { STORAGE_KEYS } from "../constants/config";
import { events } from "../data/mock/events";
import type { EventRegistration } from "../types/content";

const requestTime = "2026-09-03T16:00:00+03:00";

function normalize(value: unknown, studentId: string): EventRegistration[] {
  if (!Array.isArray(value)) return [];
  const validIds = new Set(events.map((event) => event.id));
  const seen = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Partial<EventRegistration>;
    if (
      record.studentId !== studentId ||
      typeof record.eventId !== "string" ||
      !validIds.has(record.eventId) ||
      seen.has(record.eventId) ||
      (record.status !== "registered" && record.status !== "waitlisted")
    )
      return [];
    seen.add(record.eventId);
    return [
      {
        eventId: record.eventId,
        studentId,
        status: record.status,
        requestedAt:
          typeof record.requestedAt === "string"
            ? record.requestedAt
            : requestTime,
      },
    ];
  });
}

/** Local preview adapter. A real API must enforce capacity atomically server-side. */
export function createLocalEventService() {
  const memory = new Map<string, EventRegistration[]>();
  const volatile = new Set<string>();
  const key = (studentId: string) =>
    `${STORAGE_KEYS.eventRegistrations}.${studentId}`;
  const read = (studentId: string) => {
    if (volatile.has(studentId))
      return structuredClone(memory.get(studentId) || []);
    try {
      return normalize(
        JSON.parse(localStorage.getItem(key(studentId)) || "[]"),
        studentId,
      );
    } catch {
      return structuredClone(memory.get(studentId) || []);
    }
  };
  const write = (studentId: string, value: EventRegistration[]) => {
    memory.set(studentId, value);
    try {
      localStorage.setItem(key(studentId), JSON.stringify(value));
      volatile.delete(studentId);
    } catch {
      volatile.add(studentId);
    }
  };
  return {
    listRegistrations: async (studentId: string) => read(studentId),
    register: async (studentId: string, eventId: string) => {
      const event = events.find((item) => item.id === eventId);
      if (!event) throw new Error("EVENT_NOT_FOUND");
      const current = read(studentId);
      const existing = current.find((item) => item.eventId === eventId);
      if (existing) return existing;
      if (Date.parse(event.registrationClosesAt) < Date.parse(requestTime))
        throw new Error("REGISTRATION_CLOSED");
      const status =
        event.registeredCount < event.capacity
          ? "registered"
          : event.waitlistEnabled
            ? "waitlisted"
            : null;
      if (!status) throw new Error("EVENT_FULL");
      const registration: EventRegistration = {
        eventId,
        studentId,
        status,
        requestedAt: requestTime,
      };
      write(studentId, [...current, registration]);
      return structuredClone(registration);
    },
    cancel: async (studentId: string, eventId: string) => {
      write(
        studentId,
        read(studentId).filter((item) => item.eventId !== eventId),
      );
    },
  };
}
