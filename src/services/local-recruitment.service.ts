import { STORAGE_KEYS } from "../constants/config";
import {
  demoMembershipProfile,
  demoRecruitmentApplications,
  recruitmentPositions,
} from "../data/mock/recruitment";
import { text } from "../lib/localize";
import type {
  ClubMembershipProfile,
  OnboardingTask,
  RecruitmentApplication,
  RecruitmentApplicationInput,
  RecruitmentApplicationStatus,
  RecruitmentHistoryEntry,
} from "../types/recruitment";

type StoredRecruitment = { applications: RecruitmentApplication[] };

const actionAt = "2026-09-06T16:00:00+03:00";
const statuses = new Set<RecruitmentApplicationStatus>([
  "draft",
  "submitted",
  "screening",
  "interview",
  "accepted",
  "rejected",
  "onboarding",
  "completed",
  "withdrawn",
]);
const positionIds = new Set(recruitmentPositions.map((item) => item.id));
const key = (studentId: string) => `${STORAGE_KEYS.recruitment}.${studentId}`;
const seed = (studentId: string): StoredRecruitment => ({
  applications:
    studentId === "demo-student"
      ? structuredClone(demoRecruitmentApplications)
      : [],
});

function validText(value: unknown): value is { en: string; ar: string } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { en?: unknown; ar?: unknown };
  return typeof candidate.en === "string" && typeof candidate.ar === "string";
}

function normalizeHistory(value: unknown): RecruitmentHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Partial<RecruitmentHistoryEntry>;
    if (
      typeof entry.id !== "string" ||
      ids.has(entry.id) ||
      !statuses.has(entry.status as RecruitmentApplicationStatus) ||
      typeof entry.at !== "string" ||
      !validText(entry.note)
    )
      return [];
    ids.add(entry.id);
    return [entry as RecruitmentHistoryEntry];
  });
}

function normalizeOnboarding(value: unknown): OnboardingTask[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const task = item as Partial<OnboardingTask>;
    if (
      typeof task.id !== "string" ||
      ids.has(task.id) ||
      !validText(task.title) ||
      !validText(task.description) ||
      typeof task.completed !== "boolean"
    )
      return [];
    ids.add(task.id);
    return [task as OnboardingTask];
  });
}

function normalize(value: unknown, studentId: string): StoredRecruitment {
  if (!value || typeof value !== "object") return seed(studentId);
  const raw = value as Partial<StoredRecruitment>;
  if (!Array.isArray(raw.applications)) return seed(studentId);
  const ids = new Set<string>();
  const applications = raw.applications.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Partial<RecruitmentApplication>;
    if (
      typeof record.id !== "string" ||
      ids.has(record.id) ||
      record.studentId !== studentId ||
      typeof record.positionId !== "string" ||
      !positionIds.has(record.positionId) ||
      typeof record.motivation !== "string" ||
      typeof record.experience !== "string" ||
      typeof record.availability !== "string" ||
      typeof record.consentConfirmed !== "boolean" ||
      !statuses.has(record.status as RecruitmentApplicationStatus) ||
      typeof record.createdAt !== "string" ||
      typeof record.updatedAt !== "string"
    )
      return [];
    ids.add(record.id);
    return [
      {
        ...record,
        history: normalizeHistory(record.history),
        onboarding: normalizeOnboarding(record.onboarding),
      } as RecruitmentApplication,
    ];
  });
  return { applications };
}

/**
 * Device-local workflow preview. Recruitment decisions, identity, membership,
 * volunteer-hour verification and permissions must be enforced by a real API.
 */
export function createLocalRecruitmentService() {
  const memory = new Map<string, StoredRecruitment>();
  const volatile = new Set<string>();

  function read(studentId: string): StoredRecruitment {
    if (volatile.has(studentId))
      return structuredClone(memory.get(studentId) || seed(studentId));
    try {
      const raw = localStorage.getItem(key(studentId));
      const state = raw
        ? normalize(JSON.parse(raw), studentId)
        : seed(studentId);
      memory.set(studentId, state);
      return structuredClone(state);
    } catch {
      volatile.add(studentId);
      const state = memory.get(studentId) || seed(studentId);
      memory.set(studentId, state);
      return structuredClone(state);
    }
  }

  function write(studentId: string, state: StoredRecruitment) {
    const safe = normalize(state, studentId);
    memory.set(studentId, safe);
    if (!volatile.has(studentId)) {
      try {
        localStorage.setItem(key(studentId), JSON.stringify(safe));
      } catch {
        volatile.add(studentId);
      }
    }
    return structuredClone(safe);
  }

  return {
    listApplications: async (studentId: string) => read(studentId).applications,

    saveDraft: async (
      studentId: string,
      input: RecruitmentApplicationInput,
    ) => {
      const position = recruitmentPositions.find(
        (item) => item.id === input.positionId,
      );
      if (!position || position.status === "closed")
        throw new Error("recruitment-position-unavailable");
      const state = read(studentId);
      const duplicate = state.applications.find(
        (item) =>
          item.positionId === input.positionId &&
          item.id !== input.id &&
          item.status !== "withdrawn" &&
          item.status !== "rejected",
      );
      if (duplicate) throw new Error("recruitment-duplicate");
      const clean = {
        positionId: input.positionId,
        motivation: input.motivation.trim(),
        experience: input.experience.trim(),
        availability: input.availability.trim(),
        consentConfirmed: input.consentConfirmed,
      };
      let application: RecruitmentApplication;
      if (input.id) {
        const index = state.applications.findIndex(
          (item) => item.id === input.id,
        );
        if (index < 0 || state.applications[index].status !== "draft")
          throw new Error("recruitment-draft-locked");
        application = {
          ...state.applications[index],
          ...clean,
          updatedAt: actionAt,
        };
        state.applications[index] = application;
      } else {
        const id = `ra-${studentId}-${Date.now().toString(36)}`;
        application = {
          id,
          studentId,
          ...clean,
          status: "draft",
          createdAt: actionAt,
          updatedAt: actionAt,
          history: [
            {
              id: `${id}-draft`,
              status: "draft",
              at: actionAt,
              note: text("Draft created.", "تم إنشاء المسودة."),
            },
          ],
          onboarding: [],
        };
        state.applications.unshift(application);
      }
      write(studentId, state);
      return structuredClone(application);
    },

    submit: async (studentId: string, applicationId: string) => {
      const state = read(studentId);
      const index = state.applications.findIndex(
        (item) => item.id === applicationId,
      );
      const current = state.applications[index];
      if (!current || current.status !== "draft")
        throw new Error("recruitment-draft-locked");
      const position = recruitmentPositions.find(
        (item) => item.id === current.positionId,
      );
      if (!position || position.status === "closed")
        throw new Error("recruitment-position-unavailable");
      if (
        current.motivation.length < 40 ||
        !current.experience ||
        !current.availability ||
        !current.consentConfirmed
      )
        throw new Error("recruitment-incomplete");
      const next: RecruitmentApplication = {
        ...current,
        status: "submitted",
        submittedAt: actionAt,
        updatedAt: actionAt,
        history: [
          ...current.history,
          {
            id: `${current.id}-submitted`,
            status: "submitted",
            at: actionAt,
            note: text(
              "Application submitted for screening.",
              "تم إرسال الطلب للفرز.",
            ),
          },
        ],
      };
      state.applications[index] = next;
      write(studentId, state);
      return structuredClone(next);
    },

    withdraw: async (studentId: string, applicationId: string) => {
      const state = read(studentId);
      const index = state.applications.findIndex(
        (item) => item.id === applicationId,
      );
      const current = state.applications[index];
      if (!current || !["draft", "submitted"].includes(current.status))
        throw new Error("recruitment-withdraw-locked");
      const next: RecruitmentApplication = {
        ...current,
        status: "withdrawn",
        updatedAt: actionAt,
        history: [
          ...current.history,
          {
            id: `${current.id}-withdrawn`,
            status: "withdrawn",
            at: actionAt,
            note: text(
              "Application withdrawn by the student.",
              "سحب الطالب الطلب.",
            ),
          },
        ],
      };
      state.applications[index] = next;
      write(studentId, state);
      return structuredClone(next);
    },

    toggleOnboardingTask: async (
      studentId: string,
      applicationId: string,
      taskId: string,
    ) => {
      const state = read(studentId);
      const index = state.applications.findIndex(
        (item) => item.id === applicationId,
      );
      const current = state.applications[index];
      if (!current || current.status !== "onboarding")
        throw new Error("recruitment-onboarding-locked");
      const taskIndex = current.onboarding.findIndex(
        (item) => item.id === taskId,
      );
      if (taskIndex < 0) throw new Error("recruitment-task-missing");
      const onboarding = current.onboarding.map((item, itemIndex) =>
        itemIndex === taskIndex
          ? { ...item, completed: !item.completed }
          : item,
      );
      const completed = onboarding.every((item) => item.completed);
      const next: RecruitmentApplication = {
        ...current,
        onboarding,
        status: completed ? "completed" : "onboarding",
        updatedAt: actionAt,
        history: completed
          ? [
              ...current.history,
              {
                id: `${current.id}-completed`,
                status: "completed",
                at: actionAt,
                note: text(
                  "Onboarding checklist completed.",
                  "اكتملت قائمة التهيئة.",
                ),
              },
            ]
          : current.history,
      };
      state.applications[index] = next;
      write(studentId, state);
      return structuredClone(next);
    },

    getMemberProfile: async (
      studentId: string,
    ): Promise<ClubMembershipProfile | null> =>
      studentId === demoMembershipProfile.studentId
        ? structuredClone(demoMembershipProfile)
        : null,
  };
}
