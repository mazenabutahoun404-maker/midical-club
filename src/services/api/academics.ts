import type {
  AcademicTerm,
  Batch,
  ClinicalYear,
  Course,
  CourseSectionKind,
  Resource,
} from "../../types/content";
import type { ApiClient } from "./client";
import type { Operations } from "./schema.generated";
import { createHttpAcademicCatalog } from "./academic-catalog";
import {
  array,
  collectApiPages,
  json,
  localized,
  number,
  record,
  requireId,
  string,
  text,
} from "./mapping";

const kinds: CourseSectionKind[] = [
  "overview",
  "guidance",
  "slides",
  "notes",
  "summary",
  "recording",
  "book",
  "questions",
  "external",
];
const sectionTitles = {
  overview: localized("Overview", "نظرة عامة"),
  guidance: localized("Guidance", "الإرشادات"),
  slides: localized("Slides", "الشرائح"),
  notes: localized("Notes", "الملاحظات"),
  summary: localized("Summaries", "الملخصات"),
  recording: localized("Recordings", "التسجيلات"),
  book: localized("Books", "الكتب"),
  questions: localized("Questions", "الأسئلة"),
  external: localized("Resources", "المصادر"),
};
export const defaultCourseSections = () =>
  kinds.map((kind, order) => ({
    id: kind,
    kind,
    title: sectionTitles[kind],
    description: localized("", ""),
    order,
  }));
const semesterNumber = (value: unknown) =>
  ({ First: 1, Second: 2, Summer: 3 })[string(value)] || 0;
const accent = (value: unknown): Course["accent"] =>
  (({
    russet: "russet",
    brown: "russet",
    red: "red",
    olive: "olive",
    green: "olive",
    purple: "purple",
  })[string(value).toLowerCase()] as Course["accent"]) || "russet";
const icons = new Set([
  "book",
  "stethoscope",
  "exam",
  "timer",
  "library",
  "heart",
  "brain",
  "flask",
  "bone",
  "users",
]);
export function mapOffering(row: Record<string, unknown>): Course {
  const batch = record(row.batchSummary),
    semester = record(row.semesterSummary);
  const id = requireId(row.id);
  const outcomes = (() => {
    try {
      return array(JSON.parse(string(row.outcomesJson, "[]"))).map(text);
    } catch {
      return [];
    }
  })();
  return {
    id,
    offeringId: id,
    subjectId: requireId(row.subjectId),
    version: string(row.version),
    batchId: string(batch.id) || undefined,
    semesterId: string(semester.id) || undefined,
    academicYearId: string(semester.academicYearId) || undefined,
    academicYearName: string(
      semester.academicYearName || record(semester.academicYear).name,
    ),
    slug: `${string(row.code, "course")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${id}`,
    title: localized(row.resolvedNameEn, row.resolvedNameAr),
    code: string(row.code),
    track: row.stage === "Clinical" ? "clinical" : "basic",
    year: number(row.studyYear),
    batch: localized(batch.nameEn, batch.nameAr),
    description: localized(
      row.resolvedDescriptionEn,
      row.resolvedDescriptionAr,
    ),
    accent: accent(row.resolvedColor),
    icon: icons.has(string(row.resolvedIcon))
      ? (row.resolvedIcon as Course["icon"])
      : "book",
    credits: number(row.credits),
    semester: semesterNumber(semester.semesterType),
    lastUpdated: string(row.lastUpdatedAt || row.updatedAt),
    sharedWithBatchIds: [],
    outcomes,
    sections: defaultCourseSections(),
  };
}
export function createHttpAcademics(api: ApiClient) {
  const catalog = createHttpAcademicCatalog(api);
  const cache = new Map<string, { until: number; promise: Promise<unknown> }>();
  const memo = <T>(name: string, load: () => Promise<T>): Promise<T> => {
    const key = `${api.session.get()?.sessionId || "guest"}:${name}`;
    if (!cache.has(key) || cache.get(key)!.until < Date.now())
      cache.set(key, {
        until: Date.now() + 60000,
        promise: load().catch((error) => {
          cache.delete(key);
          throw error;
        }),
      });
    return cache.get(key)!.promise as Promise<T>;
  };
  const courses = () =>
    api.session.get()
      ? memo("courses", async () =>
          (
            await collectApiPages(api, (Page) =>
              api.call("get_api_v1_academics_subjects", {
                query: { Page, PageSize: 100 },
              }),
            )
          ).map(mapOffering),
        )
      : Promise.resolve([] as Course[]);
  const batchRows = () =>
    memo("batch-rows", () =>
      collectApiPages(api, (Page) =>
        api.call("get_api_v1_academics_batches", {
          query: { Page, PageSize: 100 },
        }),
      ),
    );
  const batches = () =>
    memo("batches", async (): Promise<Batch[]> => {
      const [rows, offerings, currentYear, currentSemester] = await Promise.all(
        [
          batchRows(),
          courses(),
          api.call("get_api_v1_academics_academic_years_current"),
          api.session.get()
            ? api.call("get_api_v1_academics_semesters_current")
            : Promise.resolve(null),
        ],
      );
      return rows.map((row) => {
        const id = requireId(row.id),
          presentation = json(row.presentationJson);
        const belonging = offerings.filter((course) => course.batchId === id);
        const groups = new Map<string, AcademicTerm>();
        for (const course of belonging) {
          const termId =
            course.semesterId ||
            `${course.academicYearId || "unknown"}:${course.semester}`;
          let term = groups.get(termId);
          if (!term) {
            const year =
              currentYear && course.academicYearId === currentYear.id
                ? currentYear.name
                : course.academicYearName || "";
            term = {
              id: termId,
              label: localized(
                `Semester ${course.semester || ""}`,
                `الفصل ${course.semester || ""}`,
              ),
              academicYear: year,
              semester: course.semester,
              courseIds: [],
              current: course.semesterId === currentSemester?.id,
            };
            groups.set(termId, term);
          }
          term.courseIds.push(course.id);
        }
        const graduationYear =
          Number(string(row.expectedGraduationDate).slice(0, 4)) || 0;
        return {
          id,
          slug: string(row.slug, id),
          name: localized(row.nameEn, row.nameAr),
          classLabel: graduationYear
            ? localized(`Class of ${graduationYear}`, `دفعة ${graduationYear}`)
            : localized("", ""),
          tagline: text(presentation.tagline),
          description: text(presentation.description),
          graduationYear,
          startDate: string(row.startDate),
          expectedGraduationDate: string(row.expectedGraduationDate),
          logoAssetId: string(row.logoAssetId),
          coverAssetId: string(row.coverAssetId),
          studyYear: number(
            presentation.studyYear,
            belonging.length
              ? Math.max(...belonging.map((course) => course.year))
              : 0,
          ),
          progress: Math.min(100, Math.max(0, number(presentation.progress))),
          progressAvailable: typeof presentation.progress === "number",
          accent:
            accent(row.primaryColor) === "purple"
              ? "red"
              : (accent(row.primaryColor) as Batch["accent"]),
          terms: [...groups.values()],
        };
      });
    });
  const clinicalYears = () =>
    memo("clinical-years", async (): Promise<ClinicalYear[]> => {
      const [years, offerings] = await Promise.all([
        collectApiPages(api, (Page) =>
          api.call("get_api_v1_academics_years", {
            query: { Page, PageSize: 100 },
          }),
        ),
        courses(),
      ]);
      return years
        .filter(
          (row) =>
            row.stage === "Clinical" &&
            [4, 5, 6].includes(number(row.studyYear)),
        )
        .map((row) => {
          const year = number(row.studyYear) as 4 | 5 | 6;
          return {
            id: `clinical-${year}`,
            slug: (
              { 4: "fourth-year", 5: "fifth-year", 6: "sixth-year" } as const
            )[year],
            year,
            label: localized(`Year ${year}`, `السنة ${year}`),
            tagline: localized("", ""),
            description: localized("", ""),
            currentBlock: localized("", ""),
            focusAreas: [],
            courseIds: offerings
              .filter(
                (course) => course.year === year && course.track === "clinical",
              )
              .map((course) => course.id),
            accent: "red",
          };
        });
    });
  const resourceRows = () =>
    api.session.get()
      ? memo("resources", () =>
          collectApiPages(api, (Page) =>
            api.call("get_api_v1_academics_resources", {
              query: { Page, PageSize: 100 },
            }),
          ),
        )
      : Promise.resolve([]);
  const resources = () =>
    memo("resource-models", async (): Promise<Resource[]> =>
      (await resourceRows()).map((row) => ({
        id: `${requireId(row.assetId)}:${string(row.offeringId) || string(row.subjectId)}`,
        assetId: requireId(row.assetId),
        sourceRevision: string(row.revision),
        title: text(row.displayName || row.fileName),
        courseId: string(row.offeringId) || string(row.subjectId),
        kind: "external",
        updatedAt: string(row.updatedAt),
        pages: 0,
        description: text(""),
        contributor: text(""),
        fileUrl: null,
        keywords: [],
        audience: "shared",
        batchIds: [],
        format: text(row.fileType),
        mediaType:
          (
            {
              Pdf: "pdf",
              Image: "image",
              Audio: "audio",
              Video: "video",
            } as const
          )[string(row.fileType) as "Pdf" | "Image" | "Audio" | "Video"] ||
          "external",
        previewAllowed: row.previewAllowed === true,
        downloadAllowed: row.downloadAllowed === true,
      })),
    );
  type Published =
    Operations["get_api_v1_content_subjects_offerings_by_offeringId_page"]["response"];
  const offeringPage = (offeringId: string) =>
    memo(`offering-page:${offeringId}`, async () => {
      const [en, ar] = await Promise.all([
        api.call("get_api_v1_content_subjects_offerings_by_offeringId_page", {
          path: { offeringId },
          query: { locale: "en" },
        }),
        api.call("get_api_v1_content_subjects_offerings_by_offeringId_page", {
          path: { offeringId },
          query: { locale: "ar" },
        }),
      ]);
      return { en, ar };
    });
  const courseContent = async (course: Course) => {
    const subjectOfferings = await memo(
      `subject:${course.subjectId}:${course.semesterId || ""}:${course.batchId || ""}`,
      () =>
        collectApiPages(
          api,
          async (Page) =>
            (
              await catalog.subject(course.subjectId!, {
                Page,
                PageSize: 100,
                SemesterId: course.semesterId,
                BatchId: course.batchId,
              })
            ).offerings,
        ),
    );
    const currentOffering = subjectOfferings.find(
      (row) => row.id === course.id,
    );
    if (currentOffering) course = mapOffering(currentOffering);
    const materials = (await resources()).filter(
      (resource) => resource.courseId === course.id,
    );
    const { en, ar } = await offeringPage(course.id);
    const content = (page: Published) =>
      page.content.visible && "sections" in page.content ? page.content : null;
    const english = content(en),
      arabic = content(ar);
    if (!english && !arabic)
      return {
        course: { ...course, sections: defaultCourseSections() },
        resources: [] as Resource[],
      };
    const preferred = english || arabic!;
    const sections = preferred.sections
      .filter((section) =>
        kinds.includes(section.sectionKey.toLowerCase() as CourseSectionKind),
      )
      .map((section) => {
        const counterpart = arabic?.sections.find(
          (other) => other.id === section.id,
        );
        const candidate = section.sectionKey.toLowerCase();
        const kind = kinds.includes(candidate as CourseSectionKind)
          ? (candidate as CourseSectionKind)
          : "external";
        for (const block of section.blocks) {
          if (block.blockType !== "File") continue;
          const config = json(block.configuration),
            assetId = string(config.AssetId || config.assetId);
          for (const material of materials.filter(
            (item) => item.assetId === assetId,
          ))
            material.kind = kind === "overview" ? "external" : kind;
        }
        return {
          id: section.id,
          kind,
          title: localized(section.title?.text, counterpart?.title?.text),
          description: text(""),
          order: section.position,
        };
      });
    return {
      course: {
        ...course,
        publishedDocuments: {
          en: english || { visible: false },
          ar: arabic || { visible: false },
        },
        title:
          english?.title?.text || arabic?.title?.text
            ? localized(english?.title?.text, arabic?.title?.text)
            : course.title,
        description:
          english?.description?.text || arabic?.description?.text
            ? localized(english?.description?.text, arabic?.description?.text)
            : course.description,
        sections: sections.length
          ? [
              ...new Map(
                sections.map((section) => [section.kind, section]),
              ).values(),
            ]
          : defaultCourseSections(),
      },
      resources: materials,
    };
  };
  return {
    academics: {
      listCourses: courses,
      listBatches: batches,
      listClinicalYears: clinicalYears,
    },
    resources: { list: resources },
    courseContent,
    clear: () => cache.clear(),
  };
}
