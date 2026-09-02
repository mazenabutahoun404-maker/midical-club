import { student } from "../data/mock/student";
import { siteContent } from "../data/mock/site";
import { courses } from "../data/mock/courses";
import { resources } from "../data/mock/resources";
import { events } from "../data/mock/events";
import { opportunities } from "../data/mock/opportunities";
import { journal } from "../data/mock/journal";
import type { MedClubServices } from "./contracts";
import { searchRecords } from "./search-index";
// Only this adapter imports mock data. Inject a matching HTTP-backed registry into App later.
const clone = <T>(value: T): Promise<T> =>
  Promise.resolve(structuredClone(value));
export const mockServices: MedClubServices = {
  personal: { getProfile: () => clone(student) },
  site: { get: () => clone(siteContent) },
  academics: { listCourses: () => clone(courses) },
  resources: { list: () => clone(resources) },
  events: { list: () => clone(events) },
  opportunities: { list: () => clone(opportunities) },
  journal: { list: () => clone(journal) },
  search: {
    query: (query) =>
      clone(
        searchRecords({ courses, resources, events, opportunities }, query),
      ),
  },
};
