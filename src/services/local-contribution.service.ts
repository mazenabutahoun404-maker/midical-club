import { STORAGE_KEYS } from "../constants/config";
import { demoContributions } from "../data/mock/contributions";
import { text } from "../lib/localize";
import type { ContributionInput, StudentContribution } from "../types/content";

const actionTime = "2026-09-05T12:15:00+03:00";

const seed = (studentId: string) =>
  studentId === "demo-student" ? structuredClone(demoContributions) : [];

function normalize(value: unknown, studentId: string): StudentContribution[] {
  if (!Array.isArray(value)) return seed(studentId);
  const seen = new Set<string>();
  const statuses = [
    "draft",
    "under-review",
    "changes-requested",
    "approved",
    "published",
  ];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Partial<StudentContribution>;
    if (
      typeof record.id !== "string" ||
      seen.has(record.id) ||
      record.studentId !== studentId ||
      (record.kind !== "resource" && record.kind !== "article") ||
      typeof record.title !== "string" ||
      typeof record.topic !== "string" ||
      typeof record.summary !== "string" ||
      typeof record.sourceUrl !== "string" ||
      typeof record.assetName !== "string" ||
      typeof record.rightsConfirmed !== "boolean" ||
      !Array.isArray(record.references) ||
      !record.references.every((entry) => typeof entry === "string") ||
      !statuses.includes(record.status || "") ||
      !Array.isArray(record.history)
    )
      return [];
    seen.add(record.id);
    return [record as StudentContribution];
  });
}

function validate(input: ContributionInput) {
  if (
    !input.title.trim() ||
    !input.topic.trim() ||
    !input.summary.trim() ||
    !input.rightsConfirmed ||
    !input.references.some((entry) => entry.trim())
  )
    throw new Error("CONTRIBUTION_INCOMPLETE");
}

/** Device-local preview only. Review and publishing require a server workflow. */
export function createLocalContributionService() {
  const memory = new Map<string, StudentContribution[]>();
  const volatile = new Set<string>();
  const key = (studentId: string) =>
    `${STORAGE_KEYS.contributions}.${studentId}`;
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
  const write = (studentId: string, value: StudentContribution[]) => {
    memory.set(studentId, structuredClone(value));
    try {
      localStorage.setItem(key(studentId), JSON.stringify(value));
      volatile.delete(studentId);
    } catch {
      volatile.add(studentId);
    }
  };
  return {
    list: async (studentId: string) => read(studentId),
    saveDraft: async (studentId: string, input: ContributionInput) => {
      validate(input);
      const current = read(studentId);
      const existing = input.id
        ? current.find((item) => item.id === input.id)
        : undefined;
      if (
        existing &&
        existing.status !== "draft" &&
        existing.status !== "changes-requested"
      )
        throw new Error("CONTRIBUTION_LOCKED");
      const id = existing?.id || `contribution-${studentId}-${Date.now()}`;
      const contribution: StudentContribution = {
        id,
        studentId,
        kind: input.kind,
        title: input.title.trim(),
        topic: input.topic.trim(),
        summary: input.summary.trim(),
        courseId: input.courseId || undefined,
        sourceUrl: input.sourceUrl.trim(),
        assetName: input.assetName.trim(),
        rightsConfirmed: input.rightsConfirmed,
        references: input.references.map((item) => item.trim()).filter(Boolean),
        status: "draft",
        createdAt: existing?.createdAt || actionTime,
        updatedAt: actionTime,
        reviewer: existing?.reviewer,
        reviewerFeedback: existing?.reviewerFeedback,
        history: [
          ...(existing?.history || []),
          {
            id: `history-${id}-${(existing?.history.length || 0) + 1}`,
            status: "draft",
            at: actionTime,
            note: text(
              existing ? "Revision saved" : "Draft created",
              existing ? "تم حفظ التعديل" : "تم إنشاء المسودة",
            ),
          },
        ],
      };
      write(studentId, [
        contribution,
        ...current.filter((item) => item.id !== id),
      ]);
      return structuredClone(contribution);
    },
    submit: async (studentId: string, id: string) => {
      const current = read(studentId);
      const existing = current.find((item) => item.id === id);
      if (!existing) throw new Error("CONTRIBUTION_NOT_FOUND");
      if (existing.status !== "draft") throw new Error("CONTRIBUTION_LOCKED");
      validate(existing);
      const submitted: StudentContribution = {
        ...existing,
        status: "under-review",
        submittedAt: actionTime,
        updatedAt: actionTime,
        history: [
          ...existing.history,
          {
            id: `history-${id}-${existing.history.length + 1}`,
            status: "under-review",
            at: actionTime,
            note: text(
              "Submitted for scientific review",
              "أُرسلت للمراجعة العلمية",
            ),
          },
        ],
      };
      write(
        studentId,
        current.map((item) => (item.id === id ? submitted : item)),
      );
      return structuredClone(submitted);
    },
    deleteDraft: async (studentId: string, id: string) => {
      const current = read(studentId);
      const existing = current.find((item) => item.id === id);
      if (existing && existing.status !== "draft")
        throw new Error("CONTRIBUTION_LOCKED");
      write(
        studentId,
        current.filter((item) => item.id !== id),
      );
    },
  };
}
