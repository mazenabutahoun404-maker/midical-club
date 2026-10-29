import type { ApiClient } from "./client";
import type { AcademicQuery } from "./academic-admin";
export function createHttpAcademicCatalog(api: ApiClient) {
  return {
    home: (query: AcademicQuery = {}) =>
      api.call("get_api_v1_academics_home", { query }),
    year: (studyYear: number) =>
      api.call("get_api_v1_academics_years_by_studyYear", {
        path: { studyYear },
      }),
    subject: (subjectId: string, query: AcademicQuery = {}) =>
      api.call("get_api_v1_academics_subjects_by_subjectId", {
        path: { subjectId },
        query,
      }),
  };
}
