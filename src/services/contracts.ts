import type { StudentProfile } from "../types/student";
import type {
  SiteContent,
  Course,
  Resource,
  ClubEvent,
  Opportunity,
  Article,
  SearchResult,
} from "../types/content";
export interface MedClubServices {
  personal: { getProfile: () => Promise<StudentProfile> };
  site: { get: () => Promise<SiteContent> };
  academics: { listCourses: () => Promise<Course[]> };
  resources: { list: () => Promise<Resource[]> };
  events: { list: () => Promise<ClubEvent[]> };
  opportunities: { list: () => Promise<Opportunity[]> };
  journal: { list: () => Promise<Article[]> };
  search: { query: (query: string) => Promise<SearchResult[]> };
}
