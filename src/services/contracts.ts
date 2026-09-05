import type { StudentProfile } from "../types/student";
import type {
  WorkspaceService,
  CalendarItem,
  StudentNotification,
} from "../types/workspace";
import type {
  SiteContent,
  Course,
  Batch,
  ClinicalYear,
  Resource,
  ClubEvent,
  EventRegistration,
  Opportunity,
  Article,
  CommunityActivity,
  MediaStory,
  ExecutiveBody,
  Recognition,
  ClubValue,
  SearchResult,
  SearchFilters,
} from "../types/content";
export interface MedClubServices {
  workspace: WorkspaceService;
  calendar: { list: () => Promise<CalendarItem[]> };
  notifications: { list: () => Promise<StudentNotification[]> };
  personal: { getProfile: () => Promise<StudentProfile> };
  site: { get: () => Promise<SiteContent> };
  academics: {
    listCourses: () => Promise<Course[]>;
    listBatches: () => Promise<Batch[]>;
    listClinicalYears: () => Promise<ClinicalYear[]>;
  };
  resources: { list: () => Promise<Resource[]> };
  events: {
    list: () => Promise<ClubEvent[]>;
    get: (slug: string) => Promise<ClubEvent | null>;
    listRegistrations: (studentId: string) => Promise<EventRegistration[]>;
    register: (
      studentId: string,
      eventId: string,
    ) => Promise<EventRegistration>;
    cancel: (studentId: string, eventId: string) => Promise<void>;
  };
  opportunities: {
    list: () => Promise<Opportunity[]>;
    get: (slug: string) => Promise<Opportunity | null>;
  };
  journal: {
    list: () => Promise<Article[]>;
    get: (slug: string) => Promise<Article | null>;
  };
  community: {
    listActivities: () => Promise<CommunityActivity[]>;
    listMedia: () => Promise<MediaStory[]>;
    listExecutiveBodies: () => Promise<ExecutiveBody[]>;
    listRecognitions: () => Promise<Recognition[]>;
    listValues: () => Promise<ClubValue[]>;
  };
  search: {
    query: (query: string, filters?: SearchFilters) => Promise<SearchResult[]>;
  };
}
