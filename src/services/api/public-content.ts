import { createHttpContentApi } from "./content-api";
import type { MedClubServices } from "../contracts";
import type {
  Article,
  ClubEvent,
  CommunityActivity,
  MediaStory,
  Mentor,
  MentorshipQuestion,
  MentorshipSession,
  Opportunity,
} from "../../types/content";
import type { ApiClient } from "./client";
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
  unavailable,
} from "./mapping";

const locationMode = (mode: unknown): "online" | "onsite" | "hybrid" =>
  string(mode).toLowerCase().includes("online")
    ? "online"
    : string(mode).toLowerCase().includes("hybrid")
      ? "hybrid"
      : "onsite";
const mapEvent = (v: Record<string, unknown>): ClubEvent => ({
  id: requireId(v.id),
  slug: string(v.slug),
  title: localized(v.titleEn, v.titleAr),
  category: "workshop",
  type: text(v.category),
  startDate: string(v.startsAt),
  endDate: string(v.endsAt),
  location: localized(v.locationNameEn, v.locationNameAr),
  format: locationMode(v.locationMode),
  description: localized(
    v.summaryEn || v.descriptionEn,
    v.summaryAr || v.descriptionAr,
  ),
  agenda: [],
  audience: localized(v.audienceEn, v.audienceAr),
  capacity: number(v.capacity),
  registeredCount: number(v.registeredCount),
  waitlistEnabled: v.waitlistEnabled === true,
  registrationOpensAt: string(v.registrationOpensAt),
  registrationClosesAt: string(v.registrationClosesAt),
  featured: v.isFeatured === true,
});
export function createHttpPublicContent(api: ApiClient) {
  const contentApi = createHttpContentApi(api);
  const publications = (
    contentType:
      | "activities"
      | "journal-issues"
      | "conferences"
      | "executive-bodies"
      | "honor-plate"
      | "alumni",
    locale: string,
  ) =>
    collectApiPages(api, (Page) =>
      api.call("get_api_v1_by_contentType", {
        path: { contentType },
        query: { Page, PageSize: 100, Locale: locale },
      }),
    );
  const bilingual = async (
    type: Parameters<typeof publications>[0],
  ): Promise<
    (Record<string, unknown> & {
      titleText: import("../../types/content").Text;
      summaryText: import("../../types/content").Text;
    })[]
  > => {
    const [en, ar] = await Promise.all([
      publications(type, "en"),
      publications(type, "ar"),
    ]);
    return en.map((row) => ({
      ...row,
      titleText: localized(row.title, ar.find((x) => x.id === row.id)?.title),
      summaryText: localized(
        row.summary,
        ar.find((x) => x.id === row.id)?.summary,
      ),
    }));
  };
  const events: MedClubServices["events"] = {
    ...unavailable<MedClubServices["events"]>("Event registration"),
    list: async () =>
      (
        await collectApiPages(api, (Page) =>
          api.call("get_api_v1_events", { query: { Page, PageSize: 100 } }),
        )
      ).map(mapEvent),
    get: async (slug) =>
      mapEvent(
        record(record(await api.call("get_api_v1_events_by_slug", { path: { slug } })).event),
      ),
    listRegistrations: async () => {
      throw new Error("FEATURE_NOT_CONNECTED");
    },
    register: async () => {
      throw new Error("FEATURE_NOT_CONNECTED");
    },
    cancel: async () => {
      throw new Error("FEATURE_NOT_CONNECTED");
    },
  };
  const mentors = async (): Promise<Mentor[]> =>
    (
      await collectApiPages(api, (Page) =>
        api.call("get_api_v1_mentors", { query: { Page, PageSize: 100 } }),
      )
    ).map((row) => {
      const presentation = json(row.presentationJson);
      return {
        id: requireId(row.id),
        slug: string(row.id),
        name: text(row.displayNameSnapshot),
        initials: text(
          string(row.displayNameSnapshot)
            .split(/\s+/)
            .slice(0, 2)
            .map((x) => x[0])
            .join(""),
        ),
        title: localized(row.workplaceEn, row.workplaceAr),
        specialty: localized(row.specialtyEn, row.specialtyAr),
        graduationYear: number(presentation.graduationYear),
        bio: localized(row.bioEn, row.bioAr),
        areas: array(presentation.areas).map(text),
        languages: array(presentation.languages).map(text),
        format:
          row.supportsOnline && row.supportsInPerson
            ? "hybrid"
            : row.supportsOnline
              ? "online"
              : "onsite",
        capacity: number(row.defaultCapacity),
        activeMentees: number(row.activeMentees),
        availability: text(presentation.availability),
        featured: presentation.featured === true,
      };
    });
  const sessions = async (): Promise<MentorshipSession[]> =>
    (
      await collectApiPages(api, (Page) =>
        api.call("get_api_v1_mentorship_group_sessions", {
          query: { Page, PageSize: 100 },
        }),
      )
    ).map((row) => ({
      id: requireId(row.id),
      slug: string(row.id),
      mentorId: string(row.mentorId),
      title: localized(row.titleEn, row.titleAr),
      topic: localized(row.topicEn, row.topicAr),
      summary: localized(row.summaryEn, row.summaryAr),
      startsAt: string(row.startsAt),
      endsAt: string(row.endsAt),
      format: locationMode(row.mode),
      location: localized(row.locationLabelEn, row.locationLabelAr),
      capacity: number(row.capacity),
      registeredCount: number(row.registeredCount),
      audience: localized(row.audienceEn, row.audienceAr),
    }));
  const questions = async (): Promise<MentorshipQuestion[]> =>
    (
      await collectApiPages(api, (Page) =>
        api.call("get_api_v1_mentorship_public_qa", {
          query: { Page, PageSize: 100 },
        }),
      )
    ).map((row) => ({
      id: requireId(row.id),
      category: [
        "career",
        "research",
        "clinical-learning",
        "student-life",
      ].includes(string(row.category))
        ? (row.category as MentorshipQuestion["category"])
        : "student-life",
      question: localized(row.questionEn, row.questionAr),
      answer: localized(row.answerEn, row.answerAr),
      answeredBy: text(row.answererNameSnapshot),
      answeredAt: string(row.publishedAt),
      tags: array(row.tags).map(text),
    }));
  const journalList = async (): Promise<Article[]> => {
    const load = (locale: string) =>
      collectApiPages(api, (Page) =>
        contentApi.get_api_v1_content_editorial_by_kind({
          path: { kind: "Article" },
          query: { Page, PageSize: 100, locale },
        }),
      );
    const [en, ar] = await Promise.all([load("en"), load("ar")]);
    const english = new Map(en.map((row) => [requireId(row.id), row])),
      arabic = new Map(ar.map((row) => [requireId(row.id), row]));
    return [...new Set([...english.keys(), ...arabic.keys()])].map((id) => {
      const e = english.get(id),
        a = arabic.get(id),
        row = e || a!,
        editorial = record(row.editorial),
        category = string(editorial.categoryId);
      return {
        id,
        slug: string(row.slug),
        title: localized(record(e?.title).text, record(a?.title).text),
        excerpt: localized(
          record(e?.description).text,
          record(a?.description).text,
        ),
        category: text(category),
        categoryId: [
          "student-life",
          "research",
          "clinical",
          "community",
        ].includes(category)
          ? (category as Article["categoryId"])
          : "community",
        readMinutes: number(editorial.readMinutes),
        readMinutesAvailable: typeof editorial.readMinutes === "number",
        body: [],
        author: text(editorial.author),
        reviewer: text(editorial.reviewer),
        publishedAt: string(row.publishedAt),
        tags: array(editorial.tags).map(text),
        featured: editorial.featured === true,
      };
    });
  };
  const journalGet = async (slug: string): Promise<Article | null> => {
    const item = (await journalList()).find((row) => row.slug === slug);
    if (!item) return null;
    const [en, ar] = await Promise.all([
      contentApi.get_api_v1_content_pages_by_slug({
        path: { slug },
        query: { locale: "en" },
      }),
      contentApi.get_api_v1_content_pages_by_slug({
        path: { slug },
        query: { locale: "ar" },
      }),
    ]);
    if (!en.content.visible && !ar.content.visible) return null;
    return { ...item, publishedContent: { en: en.content, ar: ar.content } };
  };
  const opportunitiesList = async (): Promise<Opportunity[]> =>
    api.session.get()
      ? (
          await collectApiPages(api, (Page) =>
            api.call("get_api_v1_opportunities", {
              query: { Page, PageSize: 100 },
            }),
          )
        ).map((row) => {
          const presentation = json(row.presentationJson),
            category = string(row.type).toLowerCase();
          return {
            id: requireId(row.id),
            slug: string(row.id),
            title: localized(row.titleEn, row.titleAr),
            organization: text(row.sourceName),
            category: [
              "research",
              "training",
              "conference",
              "grant",
              "exchange",
              "volunteering",
            ].includes(category)
              ? (category as Opportunity["category"])
              : "training",
            type: text(row.type),
            field: text(presentation.field),
            location: text(presentation.location),
            mode: text(presentation.mode),
            postedAt: string(row.publishedAt),
            deadline: string(row.deadlineAt),
            yearEligibility: array(row.eligibleStudyYears).map((x) =>
              number(x),
            ),
            eligibility: text(presentation.eligibility),
            description: localized(row.summaryEn, row.summaryAr),
            tags: array(presentation.tags).map(text),
            verified: false,
            externalUrl:
              typeof row.applicationUrl === "string"
                ? row.applicationUrl
                : null,
            featured: row.isFeatured === true,
          };
        })
      : [];
  return {
    events,
    mentorship: {
      ...unavailable<MedClubServices["mentorship"]>("Mentorship actions"),
      listMentors: mentors,
      listSessions: sessions,
      listQuestions: questions,
      listRequests: async () => {
        throw new Error("FEATURE_NOT_CONNECTED");
      },
      request: async () => {
        throw new Error("FEATURE_NOT_CONNECTED");
      },
      cancelRequest: async () => {
        throw new Error("FEATURE_NOT_CONNECTED");
      },
      listSessionRegistrations: async () => {
        throw new Error("FEATURE_NOT_CONNECTED");
      },
      registerSession: async () => {
        throw new Error("FEATURE_NOT_CONNECTED");
      },
      cancelSessionRegistration: async () => {
        throw new Error("FEATURE_NOT_CONNECTED");
      },
    },
    journal: {
      list: journalList,
      get: journalGet,
    },
    opportunities: {
      list: opportunitiesList,
      get: async (slug: string) =>
        (await opportunitiesList()).find((x) => x.slug === slug) || null,
    },
    community: {
      listActivities: async (): Promise<CommunityActivity[]> =>
        (await bilingual("activities")).map((row) => ({
          id: requireId(row.id),
          slug: string(row.slug),
          title: row.titleText,
          kind: "student-life",
          summary: row.summaryText,
          date: string(row.startsAt || row.publishedAt),
          location: text(""),
          participantCount: 0,
          impact: text(""),
          featured: row.isFeatured === true,
        })),
      listMedia: async (): Promise<MediaStory[]> =>
        (
          await collectApiPages(api, (Page) =>
            api.call("get_api_v1_media_by_mediaType", {
              path: { mediaType: "campaigns" },
              query: { Page, PageSize: 100, Locale: "en" },
            }),
          )
        ).map((row) => ({
          id: requireId(row.id),
          title: text(row.title),
          caption: text(row.summary),
          capturedAt: string(row.publishedAt),
          kind: "campaign",
          accent: "red",
        })),
      listExecutiveBodies: async () => {
        throw new Error("FEATURE_NOT_CONNECTED");
      },
      listRecognitions: async () => {
        throw new Error("FEATURE_NOT_CONNECTED");
      },
      listValues: async () => {
        throw new Error("FEATURE_NOT_CONNECTED");
      },
    },
  };
}
