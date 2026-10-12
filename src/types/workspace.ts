import type { Text } from "./content";

export interface LibraryCollection {
  id: string;
  name: string;
  itemIds: string[];
}
export interface RecentResource {
  resourceId: string;
  viewedAt: string;
}
export interface StudyEntry {
  id: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  courseId?: string;
  notes: string;
}
export interface CalendarItem {
  id: string;
  title: Text;
  startsAt: string;
  endsAt?: string;
  kind: "exam" | "event" | "deadline" | "study" | "mentorship" | "recruitment";
  courseId?: string;
  sourceId?: string;
  description: Text;
}
export interface StudentNotification {
  id: string;
  title: Text;
  body: Text;
  createdAt: string;
  kind: "course" | "reminder" | "community";
  courseId?: string;
  resourceId?: string;
  href?: string;
}
export interface PersonalWorkspace {
  savedIds: string[];
  savedAt: Record<string, string>;
  collections: LibraryCollection[];
  recentResources: RecentResource[];
  reviewedResourceIds: string[];
  studyEntries: StudyEntry[];
  readNotificationIds: string[];
  recentSearches: string[];
}
export interface WorkspaceSnapshot {
  state: PersonalWorkspace;
  persistent: boolean;
}
export type WorkspaceAction =
  | { type: "toggle-save"; id: string }
  | { type: "create-collection"; id: string; name: string }
  | { type: "rename-collection"; id: string; name: string }
  | { type: "delete-collection"; id: string }
  | { type: "restore-collection"; collection: LibraryCollection }
  | {
      type: "restore-saved";
      id: string;
      savedAt?: string;
      collectionIds: string[];
    }
  | {
      type: "collection-item";
      collectionId: string;
      itemId: string;
      included: boolean;
    }
  | { type: "view-resource"; id: string }
  | { type: "toggle-reviewed"; id: string }
  | { type: "upsert-study"; entry: StudyEntry }
  | { type: "delete-study"; id: string }
  | { type: "read-notifications"; ids: string[]; read: boolean }
  | { type: "remember-search"; query: string }
  | { type: "clear-searches" };
export interface WorkspaceService {
  get: (studentId: string) => Promise<WorkspaceSnapshot>;
  dispatch: (
    studentId: string,
    action: WorkspaceAction,
  ) => Promise<WorkspaceSnapshot>;
  subscribe?: (studentId: string, onChange: () => void) => () => void;
}
