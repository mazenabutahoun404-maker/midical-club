import { STORAGE_KEYS } from "../constants/config";
import {
  demoMentorshipRegistrations,
  demoMentorshipRequests,
  mentors,
  mentorshipSessions,
} from "../data/mock/mentorship";
import type {
  MentorshipRequest,
  MentorshipRequestInput,
  MentorshipRequestStatus,
  MentorshipSessionRegistration,
} from "../types/content";

const actionTime = "2026-09-05T12:00:00+03:00";
type StoredMentorship = {
  requests: MentorshipRequest[];
  registrations: MentorshipSessionRegistration[];
};

const seed = (studentId: string): StoredMentorship => ({
  requests:
    studentId === "demo-student" ? structuredClone(demoMentorshipRequests) : [],
  registrations:
    studentId === "demo-student"
      ? structuredClone(demoMentorshipRegistrations)
      : [],
});

function normalize(value: unknown, studentId: string): StoredMentorship {
  if (!value || typeof value !== "object") return seed(studentId);
  const raw = value as Partial<StoredMentorship>;
  const mentorIds = new Set(mentors.map((item) => item.id));
  const sessionIds = new Set(mentorshipSessions.map((item) => item.id));
  const statuses = new Set<MentorshipRequestStatus>([
    "pending",
    "accepted",
    "declined",
    "cancelled",
  ]);
  const requestIds = new Set<string>();
  const requests = Array.isArray(raw.requests)
    ? raw.requests.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const record = item as Partial<MentorshipRequest>;
        if (
          typeof record.id !== "string" ||
          requestIds.has(record.id) ||
          record.studentId !== studentId ||
          typeof record.mentorId !== "string" ||
          !mentorIds.has(record.mentorId) ||
          typeof record.area !== "string" ||
          typeof record.note !== "string" ||
          !["onsite", "online", "hybrid"].includes(
            record.preferredFormat || "",
          ) ||
          !statuses.has(record.status as MentorshipRequestStatus) ||
          typeof record.requestedAt !== "string"
        )
          return [];
        requestIds.add(record.id);
        return [record as MentorshipRequest];
      })
    : [];
  const seenSessions = new Set<string>();
  const registrations = Array.isArray(raw.registrations)
    ? raw.registrations.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const record = item as Partial<MentorshipSessionRegistration>;
        if (
          record.studentId !== studentId ||
          typeof record.sessionId !== "string" ||
          !sessionIds.has(record.sessionId) ||
          seenSessions.has(record.sessionId) ||
          typeof record.registeredAt !== "string"
        )
          return [];
        seenSessions.add(record.sessionId);
        return [record as MentorshipSessionRegistration];
      })
    : [];
  return { requests, registrations };
}

/** Device-local preview only. A production API must enforce identity and capacity. */
export function createLocalMentorshipService() {
  const memory = new Map<string, StoredMentorship>();
  const volatile = new Set<string>();
  const key = (studentId: string) => `${STORAGE_KEYS.mentorship}.${studentId}`;
  const read = (studentId: string) => {
    if (volatile.has(studentId))
      return structuredClone(memory.get(studentId) || seed(studentId));
    try {
      const stored = localStorage.getItem(key(studentId));
      return stored
        ? normalize(JSON.parse(stored), studentId)
        : seed(studentId);
    } catch {
      return structuredClone(memory.get(studentId) || seed(studentId));
    }
  };
  const write = (studentId: string, value: StoredMentorship) => {
    memory.set(studentId, structuredClone(value));
    try {
      localStorage.setItem(key(studentId), JSON.stringify(value));
      volatile.delete(studentId);
    } catch {
      volatile.add(studentId);
    }
  };
  return {
    listRequests: async (studentId: string) => read(studentId).requests,
    request: async (studentId: string, input: MentorshipRequestInput) => {
      const mentor = mentors.find((item) => item.id === input.mentorId);
      if (!mentor) throw new Error("MENTOR_NOT_FOUND");
      if (mentor.activeMentees >= mentor.capacity)
        throw new Error("MENTOR_AT_CAPACITY");
      if (!input.area.trim() || !input.note.trim())
        throw new Error("REQUEST_INCOMPLETE");
      const current = read(studentId);
      const active = current.requests.find(
        (item) =>
          item.mentorId === input.mentorId &&
          item.status !== "cancelled" &&
          item.status !== "declined",
      );
      if (active) return structuredClone(active);
      const request: MentorshipRequest = {
        id: `mr-${studentId}-${input.mentorId}`,
        studentId,
        mentorId: input.mentorId,
        area: input.area.trim(),
        note: input.note.trim(),
        preferredFormat: input.preferredFormat,
        status: "pending",
        requestedAt: actionTime,
      };
      write(studentId, {
        ...current,
        requests: [
          ...current.requests.filter(
            (item) => item.mentorId !== input.mentorId,
          ),
          request,
        ],
      });
      return structuredClone(request);
    },
    cancelRequest: async (studentId: string, requestId: string) => {
      const current = read(studentId);
      write(studentId, {
        ...current,
        requests: current.requests.map((item) =>
          item.id === requestId && item.status === "pending"
            ? { ...item, status: "cancelled" as const }
            : item,
        ),
      });
    },
    listSessionRegistrations: async (studentId: string) =>
      read(studentId).registrations,
    registerSession: async (studentId: string, sessionId: string) => {
      const session = mentorshipSessions.find((item) => item.id === sessionId);
      if (!session) throw new Error("SESSION_NOT_FOUND");
      if (session.registeredCount >= session.capacity)
        throw new Error("SESSION_FULL");
      const current = read(studentId);
      const existing = current.registrations.find(
        (item) => item.sessionId === sessionId,
      );
      if (existing) return structuredClone(existing);
      const registration: MentorshipSessionRegistration = {
        sessionId,
        studentId,
        registeredAt: actionTime,
      };
      write(studentId, {
        ...current,
        registrations: [...current.registrations, registration],
      });
      return structuredClone(registration);
    },
    cancelSessionRegistration: async (studentId: string, sessionId: string) => {
      const current = read(studentId);
      write(studentId, {
        ...current,
        registrations: current.registrations.filter(
          (item) => item.sessionId !== sessionId,
        ),
      });
    },
  };
}
