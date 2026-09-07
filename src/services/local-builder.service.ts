import { STORAGE_KEYS } from "../constants/config";
import {
  builderPages,
  builderTemplates,
  builderVersions,
} from "../data/mock/builder";
import { text } from "../lib/localize";
import type {
  BuilderBlock,
  BuilderPageDocument,
  BuilderPageSummary,
  BuilderService,
  BuilderTemplate,
  BuilderVersion,
} from "../types/builder";

interface BuilderState {
  pages: BuilderPageDocument[];
  templates: BuilderTemplate[];
  versions: BuilderVersion[];
}

const savedAt = "2026-09-07T00:45:00+03:00";
const seed = (): BuilderState => ({
  pages: structuredClone(builderPages),
  templates: structuredClone(builderTemplates),
  versions: structuredClone(builderVersions),
});

const summary = (page: BuilderPageDocument): BuilderPageSummary => ({
  id: page.id,
  slug: page.slug,
  title: page.title,
  status: page.status,
  audience: page.audience,
  blockCount: page.blocks.length,
  revision: page.revision,
  updatedAt: page.updatedAt,
  scheduledAt: page.schedule.startsAt,
});

function validBlock(value: unknown): value is BuilderBlock {
  if (!value || typeof value !== "object") return false;
  const block = value as Partial<BuilderBlock>;
  return (
    typeof block.id === "string" &&
    typeof block.type === "string" &&
    typeof block.enabled === "boolean" &&
    !!block.data
  );
}

function normalize(value: unknown): BuilderState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Partial<BuilderState>;
  if (
    !Array.isArray(state.pages) ||
    !Array.isArray(state.templates) ||
    !Array.isArray(state.versions)
  )
    return null;
  const pages = state.pages.filter(
    (item): item is BuilderPageDocument =>
      !!item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.slug === "string" &&
      typeof item.revision === "number" &&
      Array.isArray(item.blocks) &&
      item.blocks.every(validBlock),
  );
  return pages.length
    ? {
        pages,
        templates: state.templates.filter(
          (item): item is BuilderTemplate =>
            !!item && typeof item.id === "string" && validBlock(item.block),
        ),
        versions: state.versions.filter(
          (item): item is BuilderVersion =>
            !!item &&
            typeof item.id === "string" &&
            typeof item.pageId === "string",
        ),
      }
    : null;
}

function validate(page: BuilderPageDocument) {
  if (!page.title.en.trim() || !page.title.ar.trim())
    throw new Error("BUILDER_TITLE_REQUIRED");
  if (!page.slug.startsWith("/") || /\s/.test(page.slug))
    throw new Error("BUILDER_INVALID_SLUG");
  if (!page.blocks.length) throw new Error("BUILDER_EMPTY_PAGE");
}

/** Device-local CMS adapter. Replace this service with a server implementation without changing editor components. */
export function createLocalBuilderService(): BuilderService {
  let memory = seed();
  let volatile = false;
  const read = () => {
    if (volatile) return structuredClone(memory);
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.builder);
      memory = (raw && normalize(JSON.parse(raw))) || seed();
    } catch {
      volatile = true;
    }
    return structuredClone(memory);
  };
  const write = (state: BuilderState) => {
    memory = structuredClone(state);
    try {
      localStorage.setItem(STORAGE_KEYS.builder, JSON.stringify(state));
      volatile = false;
    } catch {
      volatile = true;
    }
  };
  const find = (state: BuilderState, pageId: string) => {
    const index = state.pages.findIndex((page) => page.id === pageId);
    if (index < 0) throw new Error("BUILDER_PAGE_NOT_FOUND");
    return index;
  };
  const addVersion = (
    state: BuilderState,
    page: BuilderPageDocument,
    reason: ReturnType<typeof text>,
  ) => {
    state.versions.unshift({
      id: `builder-version-${page.id}-${page.revision}`,
      pageId: page.id,
      versionNumber: page.revision,
      createdAt: savedAt,
      createdBy: text("Homepage editor", "محرر الصفحة الرئيسية"),
      reason,
      snapshot: structuredClone(page),
    });
  };

  return {
    listPages: async () =>
      read()
        .pages.map(summary)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    getPage: async (pageId) => {
      const page = read().pages.find((item) => item.id === pageId);
      return page ? structuredClone(page) : null;
    },
    createPage: async (input) => {
      const state = read();
      const slug = input.slug.trim();
      if (state.pages.some((page) => page.slug === slug))
        throw new Error("BUILDER_SLUG_EXISTS");
      const page: BuilderPageDocument = {
        id: `builder-page-${state.pages.length + 1}-${slug.replace(/[^a-z0-9]+/gi, "-")}`,
        slug,
        title: input.title,
        status: "draft",
        theme: "pulse",
        audience: "public",
        schedule: {},
        seo: { description: text("", ""), noIndex: false },
        blocks: [],
        revision: 1,
        createdAt: savedAt,
        updatedAt: savedAt,
        lastSavedAt: savedAt,
      };
      if (!page.title.en.trim() || !page.title.ar.trim())
        throw new Error("BUILDER_TITLE_REQUIRED");
      if (!page.slug.startsWith("/") || /\s/.test(page.slug))
        throw new Error("BUILDER_INVALID_SLUG");
      state.pages.unshift(page);
      write(state);
      return structuredClone(page);
    },
    duplicatePage: async (pageId) => {
      const state = read();
      const source = state.pages[find(state, pageId)];
      const copyNumber =
        state.pages.filter((page) =>
          page.slug.startsWith(`${source.slug}-copy`),
        ).length + 1;
      const copy: BuilderPageDocument = {
        ...structuredClone(source),
        id: `builder-page-copy-${state.pages.length + 1}`,
        slug: `${source.slug === "/" ? "/home" : source.slug}-copy-${copyNumber}`,
        title: text(`${source.title.en} copy`, `${source.title.ar} - نسخة`),
        status: "draft",
        revision: 1,
        createdAt: savedAt,
        updatedAt: savedAt,
        lastSavedAt: savedAt,
        publishedAt: undefined,
        blocks: source.blocks.map((block, index) => ({
          ...structuredClone(block),
          id: `copy-${state.pages.length + 1}-${index + 1}-${block.type}`,
        })),
      };
      state.pages.unshift(copy);
      write(state);
      return structuredClone(copy);
    },
    saveDraft: async (input) => {
      validate(input);
      const state = read();
      const index = find(state, input.id);
      if (
        state.pages.some(
          (page, pageIndex) => pageIndex !== index && page.slug === input.slug,
        )
      )
        throw new Error("BUILDER_SLUG_EXISTS");
      const current = state.pages[index];
      const page: BuilderPageDocument = {
        ...structuredClone(input),
        status: current.status === "published" ? "draft" : input.status,
        revision: Math.max(current.revision + 1, input.revision + 1),
        updatedAt: savedAt,
        lastSavedAt: savedAt,
      };
      state.pages[index] = page;
      write(state);
      return structuredClone(page);
    },
    publish: async (pageId) => {
      const state = read();
      const index = find(state, pageId);
      const current = state.pages[index];
      validate(current);
      if (!current.blocks.some((block) => block.enabled))
        throw new Error("BUILDER_NO_VISIBLE_BLOCKS");
      const page: BuilderPageDocument = {
        ...current,
        status: "published",
        schedule: {},
        revision: current.revision + 1,
        updatedAt: savedAt,
        lastSavedAt: savedAt,
        publishedAt: savedAt,
      };
      state.pages[index] = page;
      addVersion(state, page, text("Published page", "نشر الصفحة"));
      write(state);
      return structuredClone(page);
    },
    schedule: async (pageId, pageSchedule) => {
      if (!pageSchedule.startsAt) throw new Error("BUILDER_SCHEDULE_REQUIRED");
      if (pageSchedule.endsAt && pageSchedule.endsAt <= pageSchedule.startsAt)
        throw new Error("BUILDER_INVALID_SCHEDULE");
      const state = read();
      const index = find(state, pageId);
      const current = state.pages[index];
      validate(current);
      const page: BuilderPageDocument = {
        ...current,
        status: "scheduled",
        schedule: pageSchedule,
        revision: current.revision + 1,
        updatedAt: savedAt,
        lastSavedAt: savedAt,
      };
      state.pages[index] = page;
      addVersion(state, page, text("Scheduled page", "جدولة الصفحة"));
      write(state);
      return structuredClone(page);
    },
    listTemplates: async () => read().templates,
    saveTemplate: async (name, description, block) => {
      const state = read();
      const template: BuilderTemplate = {
        id: `builder-template-${state.templates.length + 1}`,
        name,
        description,
        createdAt: savedAt,
        block: structuredClone(block),
      };
      state.templates.unshift(template);
      write(state);
      return structuredClone(template);
    },
    listVersions: async (pageId) =>
      read().versions.filter((version) => version.pageId === pageId),
    restoreVersion: async (pageId, versionId) => {
      const state = read();
      const index = find(state, pageId);
      const source = state.versions.find(
        (version) => version.id === versionId && version.pageId === pageId,
      );
      if (!source) throw new Error("BUILDER_VERSION_NOT_FOUND");
      const current = state.pages[index];
      const page: BuilderPageDocument = {
        ...structuredClone(source.snapshot),
        id: current.id,
        slug: current.slug,
        status: "draft",
        revision: current.revision + 1,
        updatedAt: savedAt,
        lastSavedAt: savedAt,
        publishedAt: current.publishedAt,
      };
      state.pages[index] = page;
      addVersion(
        state,
        page,
        text(
          `Restored version ${source.versionNumber}`,
          `استعادة النسخة ${source.versionNumber}`,
        ),
      );
      write(state);
      return structuredClone(page);
    },
  };
}
