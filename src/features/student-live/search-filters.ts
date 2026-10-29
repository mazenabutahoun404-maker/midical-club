import type { Schemas } from "../../services/api/schema.generated";
export type SearchFilters = {
  subject: string;
  offering: string;
  batch: string;
  academicYear: string;
  semester: string;
  studyYear: string;
  fileType: string;
  language: string;
};
export const emptySearchFilters: SearchFilters = {
  subject: "",
  offering: "",
  batch: "",
  academicYear: "",
  semester: "",
  studyYear: "",
  fileType: "",
  language: "",
};
export function contentSearchFilters(f: SearchFilters) {
  return {
    SubjectCatalogItemId: f.subject || undefined,
    SubjectOfferingId: f.offering || undefined,
    BatchId: f.batch || undefined,
    AcademicYearId: f.academicYear || undefined,
    SemesterId: f.semester || undefined,
    FileType: f.fileType || undefined,
    Language: f.language || undefined,
  };
}
export function fileSearchFilters(f: SearchFilters) {
  return {
    SubjectId: f.subject || undefined,
    BatchId: f.batch || undefined,
    SemesterId: f.semester || undefined,
    StudyYear: f.studyYear ? Number(f.studyYear) : undefined,
    FileType: (f.fileType || undefined) as Schemas["AssetType"] | undefined,
  };
}
