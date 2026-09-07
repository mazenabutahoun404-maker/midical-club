import { DEMO_TODAY, STORAGE_KEYS } from "../constants/config";
import {
  adminActivityRecords,
  adminContentItems,
  adminContentVersions,
} from "../data/mock/admin";
import { text } from "../lib/localize";
import type {
  AdminActivityRecord,
  AdminContentItem,
  AdminContentVersion,
  AdminReviewAction,
  AdminReviewInput,
  AdminService,
  AdminWorkflowStatus,
} from "../types/admin";

interface AdminState {
  content: AdminContentItem[];
  activity: AdminActivityRecord[];
  versions: AdminContentVersion[];
}

const mutationTime = "2026-09-06T18:30:00+03:00";
const seed = (): AdminState => ({
  content: structuredClone(adminContentItems),
  activity: structuredClone(adminActivityRecords),
  versions: structuredClone(adminContentVersions),
});

const statuses: AdminWorkflowStatus[] = [
  "draft",
  "under-review",
  "changes-requested",
  "approved",
  "published",
];

function normalize(value: unknown): AdminState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Partial<AdminState>;
  if (
    !Array.isArray(state.content) ||
    !Array.isArray(state.activity) ||
    !Array.isArray(state.versions)
  )
    return null;
  const content = state.content.filter(
    (item): item is AdminContentItem =>
      !!item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.versionNumber === "number" &&
      statuses.includes(item.status),
  );
  const activity = state.activity.filter(
    (item): item is AdminActivityRecord =>
      !!item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.resourceId === "string",
  );
  const versions = state.versions.filter(
    (item): item is AdminContentVersion =>
      !!item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.itemId === "string" &&
      typeof item.versionNumber === "number",
  );
  return content.length ? { content, activity, versions } : null;
}

function nextStatus(action: AdminReviewAction): AdminWorkflowStatus {
  if (action === "request-changes") return "changes-requested";
  if (action === "approve") return "approved";
  if (action === "publish") return "published";
  return "under-review";
}

function validateTransition(item: AdminContentItem, input: AdminReviewInput) {
  if (input.action === "request-changes") {
    if (item.status !== "under-review")
      throw new Error("ADMIN_INVALID_TRANSITION");
    if (!input.note.trim()) throw new Error("ADMIN_NOTE_REQUIRED");
  }
  if (input.action === "approve" && item.status !== "under-review")
    throw new Error("ADMIN_INVALID_TRANSITION");
  if (input.action === "publish") {
    if (item.status !== "approved") throw new Error("ADMIN_INVALID_TRANSITION");
    if (!item.rightsConfirmed || item.referenceCount < 1)
      throw new Error("ADMIN_SAFETY_CHECK_FAILED");
  }
  if (
    input.action === "return-to-review" &&
    item.status !== "changes-requested"
  )
    throw new Error("ADMIN_INVALID_TRANSITION");
}

const actionLabel = (action: AdminReviewAction) => {
  if (action === "request-changes")
    return text("Requested changes", "طلب تعديلات");
  if (action === "approve") return text("Approved content", "اعتمد المحتوى");
  if (action === "publish") return text("Published content", "نشر المحتوى");
  return text("Returned to review", "أعاد المحتوى للمراجعة");
};

/** Device-local operations preview. Production authorization and audit storage belong on the server. */
export function createLocalAdminService(): AdminService {
  let memory = seed();
  let volatile = false;
  const read = () => {
    if (volatile) return structuredClone(memory);
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.admin);
      const parsed = raw ? normalize(JSON.parse(raw)) : null;
      memory = parsed || seed();
    } catch {
      volatile = true;
    }
    return structuredClone(memory);
  };
  const write = (state: AdminState) => {
    memory = structuredClone(state);
    try {
      localStorage.setItem(STORAGE_KEYS.admin, JSON.stringify(state));
      volatile = false;
    } catch {
      volatile = true;
    }
  };

  const listContent = async () => read().content;
  return {
    listContent,
    getOverview: async () => {
      const content = await listContent();
      const demoNow = new Date(`${DEMO_TODAY}T23:59:59+03:00`).getTime();
      return {
        pendingReviews: content.filter((item) => item.status === "under-review")
          .length,
        approvedWaiting: content.filter((item) => item.status === "approved")
          .length,
        publishedThisWeek: content.filter(
          (item) =>
            item.publishedAt &&
            new Date(item.publishedAt).getTime() >= demoNow - 7 * 86_400_000,
        ).length,
        staleContent: content.filter(
          (item) =>
            item.staleAfter && new Date(item.staleAfter).getTime() < demoNow,
        ).length,
        openRecruitmentRoles: 4,
        upcomingEvents: 3,
        generatedAt: mutationTime,
      };
    },
    reviewContent: async (input) => {
      const state = read();
      const index = state.content.findIndex((item) => item.id === input.itemId);
      if (index < 0) throw new Error("ADMIN_CONTENT_NOT_FOUND");
      const current = state.content[index];
      validateTransition(current, input);
      const status = nextStatus(input.action);
      const versionNumber = current.versionNumber + 1;
      const reviewerNote = input.note.trim()
        ? text(input.note.trim(), input.note.trim())
        : current.reviewerNote;
      const updated: AdminContentItem = {
        ...current,
        status,
        versionNumber,
        updatedAt: mutationTime,
        publishedAt:
          status === "published" ? mutationTime : current.publishedAt,
        reviewer: text("Dr. Sara Naser", "د. سارة ناصر"),
        reviewerNote,
        history: [
          ...current.history,
          {
            id: `admin-history-${current.id}-${versionNumber}`,
            status,
            at: mutationTime,
            actor: text("Dr. Sara Naser", "د. سارة ناصر"),
            note: reviewerNote || actionLabel(input.action),
          },
        ],
      };
      state.content[index] = updated;
      state.versions.unshift({
        id: `version-${current.id}-${versionNumber}`,
        itemId: current.id,
        versionNumber,
        createdAt: mutationTime,
        createdBy: text("Dr. Sara Naser", "د. سارة ناصر"),
        reason: actionLabel(input.action),
        snapshot: {
          title: updated.title,
          status: updated.status,
          reviewerNote: updated.reviewerNote,
        },
      });
      state.activity.unshift({
        id: `activity-${current.id}-${versionNumber}`,
        actor: text("Dr. Sara Naser", "د. سارة ناصر"),
        role: text("Scientific reviewer", "مراجع علمي"),
        action: actionLabel(input.action),
        resource: updated.title,
        resourceId: updated.id,
        at: mutationTime,
        result: "success",
        risk: input.action === "publish" ? "high" : "normal",
        before: {
          status: current.status,
          version: String(current.versionNumber),
        },
        after: { status, version: String(versionNumber) },
      });
      write(state);
      return structuredClone(updated);
    },
    listActivity: async () => read().activity,
    listVersions: async (itemId) => {
      const versions = read().versions;
      return itemId
        ? versions.filter((version) => version.itemId === itemId)
        : versions;
    },
    restoreVersion: async (itemId, versionId) => {
      const state = read();
      const index = state.content.findIndex((item) => item.id === itemId);
      const source = state.versions.find(
        (version) => version.id === versionId && version.itemId === itemId,
      );
      if (index < 0 || !source) throw new Error("ADMIN_VERSION_NOT_FOUND");
      const current = state.content[index];
      if (source.versionNumber === current.versionNumber)
        throw new Error("ADMIN_VERSION_CURRENT");
      const versionNumber = current.versionNumber + 1;
      const restored: AdminContentItem = {
        ...current,
        title: source.snapshot.title,
        status: source.snapshot.status,
        reviewerNote: source.snapshot.reviewerNote,
        updatedAt: mutationTime,
        versionNumber,
        history: [
          ...current.history,
          {
            id: `admin-history-${current.id}-${versionNumber}`,
            status: source.snapshot.status,
            at: mutationTime,
            actor: text("Technical Team Manager", "مدير الفريق التقني"),
            note: text(
              `Restored version ${source.versionNumber} as version ${versionNumber}`,
              `تمت استعادة النسخة ${source.versionNumber} كنسخة ${versionNumber}`,
            ),
          },
        ],
      };
      state.content[index] = restored;
      const reason = text(
        `Restored version ${source.versionNumber}`,
        `استعادة النسخة ${source.versionNumber}`,
      );
      state.versions.unshift({
        id: `version-${current.id}-${versionNumber}`,
        itemId,
        versionNumber,
        createdAt: mutationTime,
        createdBy: text("Technical Team Manager", "مدير الفريق التقني"),
        reason,
        snapshot: {
          title: restored.title,
          status: restored.status,
          reviewerNote: restored.reviewerNote,
        },
      });
      state.activity.unshift({
        id: `activity-restore-${current.id}-${versionNumber}`,
        actor: text("Technical Team Manager", "مدير الفريق التقني"),
        role: text("Version restorer", "مسؤول استعادة النسخ"),
        action: text("Restored content version", "استعاد نسخة محتوى"),
        resource: restored.title,
        resourceId: itemId,
        at: mutationTime,
        result: "success",
        risk: "high",
        before: {
          version: String(current.versionNumber),
          status: current.status,
        },
        after: { version: String(versionNumber), status: restored.status },
      });
      write(state);
      return structuredClone(restored);
    },
  };
}
