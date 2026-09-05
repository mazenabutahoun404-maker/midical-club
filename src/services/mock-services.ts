import { student } from "../data/mock/student";
import { academicCalendar, studentNotifications } from "../data/mock/personal";
import { createLocalWorkspaceService } from "./local-workspace.service";
import { batches, clinicalYears } from "../data/mock/academics";
import { siteContent } from "../data/mock/site";
import { courses } from "../data/mock/courses";
import { resources } from "../data/mock/resources";
import { events } from "../data/mock/events";
import { opportunities } from "../data/mock/opportunities";
import { journal } from "../data/mock/journal";
import {
  clubValues,
  communityActivities,
  executiveBodies,
  mediaStories,
  recognitions,
} from "../data/mock/community";
import type { MedClubServices } from "./contracts";
import { searchRecords } from "./search-index";
import { createLocalEventService } from "./local-event.service";
// Only this adapter imports mock data. Inject a matching HTTP-backed registry into App later.
const clone = <T>(value: T): Promise<T> =>
  Promise.resolve(structuredClone(value));
const eventActions = createLocalEventService();
export const mockServices: MedClubServices = {
  workspace: createLocalWorkspaceService(),
  calendar: { list: () => clone(academicCalendar) },
  notifications: { list: () => clone(studentNotifications) },
  personal: { getProfile: () => clone(student) },
  site: { get: () => clone(siteContent) },
  academics: {
    listCourses: () => clone(courses),
    listBatches: () => clone(batches),
    listClinicalYears: () => clone(clinicalYears),
  },
  resources: { list: () => clone(resources) },
  events: {
    list: () => clone(events),
    get: (slug) => clone(events.find((event) => event.slug === slug) || null),
    ...eventActions,
  },
  opportunities: {
    list: () => clone(opportunities),
    get: (slug) =>
      clone(
        opportunities.find((opportunity) => opportunity.slug === slug) || null,
      ),
  },
  journal: {
    list: () => clone(journal),
    get: (slug) =>
      clone(journal.find((article) => article.slug === slug) || null),
  },
  community: {
    listActivities: () => clone(communityActivities),
    listMedia: () => clone(mediaStories),
    listExecutiveBodies: () => clone(executiveBodies),
    listRecognitions: () => clone(recognitions),
    listValues: () => clone(clubValues),
  },
  search: {
    query: (query, filters) =>
      clone(
        searchRecords(
          { courses, resources, events, opportunities, journal },
          query,
          filters,
        ),
      ),
  },
};
