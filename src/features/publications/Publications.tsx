import { ContentPlaceholder } from "../../components/feedback/ContentPlaceholder";
import { ReadFeedback } from "../../components/feedback/ReadFeedback";
import { contentLink } from "../resources/content-model";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { CommunityNavigation } from "../../components/navigation/CommunityNavigation";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import {
  ContentAsset,
  SafeEmbed,
  RichText,
  PublishedContent,
} from "../resources/PublishedContent";
import {
  record,
  string,
  safeUrl,
  collectApiPages,
} from "../../services/api/mapping";
import {
  clubContentTypes,
  publicationPage,
  type ClubContentType,
  type PublicationSection,
} from "../../services/api/publication-contracts";
import { canonicalPath } from "../../services/api/learning-target";
import {
  usePublicationConnection,
  usePublicationQuery,
  QueryStatus,
  Empty,
  Pager,
  rows,
} from "./shared";
import {
  publicationPath,
  publicationTitle,
  sectionInfo,
  publicItemSection,
  localValue,
  publicationPublicModel,
  publicationChildren,
  publicationChildrenTotal,
} from "./model";
import { useQuery } from "@tanstack/react-query";
function ItemLink({
  item,
  section,
}: {
  item: Record<string, unknown>;
  section?: PublicationSection;
}) {
  const { locale, t } = useLocale(),
    kind = section || publicItemSection(item.resourceType),
    href =
      kind && item.slug
        ? publicationPath(kind, string(item.slug))
        : canonicalPath(item.canonicalPath);
  return (
    <article className="publication-card">
      <div>
        <span className="eyebrow">
          {kind ? t(sectionInfo[kind]) : string(item.resourceType)}
        </span>
        <h2>
          {href ? (
            <AppLink href={href}>
              {publicationTitle(item, locale) ||
                t({ en: "Read publication", ar: "قراءة المنشور" })}
            </AppLink>
          ) : (
            publicationTitle(item, locale)
          )}
        </h2>
        <p>{string(item.summary)}</p>
        {!!item.startsAt && (
          <time dateTime={string(item.startsAt)}>
            {new Date(string(item.startsAt)).toLocaleString(locale, {
              timeZone: "Asia/Amman",
            })}
          </time>
        )}
      </div>
      {href && (
        <AppLink className="text-link" href={href}>
          {t({ en: "Read more", ar: "المزيد" })}
        </AppLink>
      )}
    </article>
  );
}
function FeaturedRows({ value }: { value: unknown }) {
  const v = record(value);
  const hasItems = Object.entries(v).some(([key, x]) =>
    key === "currentExecutiveBodySummary"
      ? !!x
      : rows(record(x).items).length > 0,
  );
  if (!hasItems) return <ContentPlaceholder compact icon="people" />;
  return (
    <div className="publication-grid">
      {Object.entries(v).flatMap(([key, x]) =>
        key === "currentExecutiveBodySummary" && x
          ? [<ItemLink key={key} item={record(x)} section="executive-bodies" />]
          : record(x).items
            ? rows(record(x).items).map((item) => (
                <ItemLink key={string(item.id)} item={item} />
              ))
            : [],
      )}
    </div>
  );
}
export function PublicationHub() {
  const { api } = usePublicationConnection(),
    { t, label, locale } = useLocale(),
    [search, setSearch] = useState(""),
    [submitted, setSubmitted] = useState(""),
    [page, setPage] = useState(1);
  const overview = usePublicationQuery(
      "overview",
      (signal) =>
        api.get_api_v1_medclub_team_overview({
          query: { Locale: locale, Page: 1, PageSize: 6 },
          signal,
        }),
      locale,
    ),
    featured = usePublicationQuery(
      "featured",
      (signal) =>
        api.get_api_v1_medclub_team_featured({
          query: { Locale: locale, Page: 1, PageSize: 6 },
          signal,
        }),
      locale,
    ),
    results = usePublicationQuery(
      "team-search",
      (signal) =>
        api.get_api_v1_medclub_team_search({
          query: { Locale: locale, Q: submitted, Page: page, PageSize: 20 },
          signal,
        }),
      [locale, submitted, page],
      !!submitted,
    );
  return (
    <div className="community-v5 community-index-page container publication-page">
      <CommunityNavigation />
      <section className="community-hero artwork-scene">
        <div className="community-hero-copy">
          <span className="eyebrow">{label("communityEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("communityTitle")}
          </h1>
          <p>{label("communityBody")}</p>
        </div>
        <HeroArtwork section="community" />
        <aside className="community-overview">
          <h2>{t({ en: "Community at a glance", ar: "المجتمع في لمحة" })}</h2>
          <QueryStatus query={overview} />
          <dl className="publication-counts">
            {rows(overview.data?.counts).map((row) => (
              <div key={string(row.resourceType)}>
                <dt>
                  {publicItemSection(row.resourceType)
                    ? t(sectionInfo[publicItemSection(row.resourceType)!])
                    : string(row.resourceType)}
                </dt>
                <dd>{Number(row.count).toLocaleString(locale)}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>
      <nav
        className="publication-portals"
        aria-label={t({ en: "Club publications", ar: "منشورات النادي" })}
      >
        {[...clubContentTypes, "campaigns"].map((section) => (
          <AppLink key={section} href={publicationPath(section)}>
            {t(sectionInfo[section as PublicationSection])}
          </AppLink>
        ))}
        <AppLink href="/community/about">{label("aboutMedClub")}</AppLink>
      </nav>
      <section>
        <h2>{t({ en: "Featured publications", ar: "المنشورات المميزة" })}</h2>
        <QueryStatus query={featured} />
        {featured.data && <FeaturedRows value={featured.data} />}
      </section>
      <section>
        <h2>
          {t({ en: "Search club publications", ar: "البحث في منشورات النادي" })}
        </h2>
        <form
          className="publication-filters"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSubmitted(search.trim());
          }}
        >
          <label>
            {label("search")}
            <input
              value={search}
              maxLength={100}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <Button type="submit">{label("search")}</Button>
        </form>
        {submitted && (
          <>
            <QueryStatus query={results} />
            {results.data && (
              <>
                <div className="publication-grid">
                  {rows(results.data.items).map((item) => (
                    <ItemLink key={string(item.id)} item={item} />
                  ))}
                </div>
                <Empty items={rows(results.data.items)} />
                <Pager
                  page={page}
                  total={Number(results.data.total)}
                  onChange={setPage}
                />
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
export function PublicationList({
  section: fixed,
}: {
  section?: PublicationSection;
}) {
  const params = useParams(),
    section = fixed || (params.section as PublicationSection);
  if (!Object.hasOwn(sectionInfo, section) || section === "albums")
    return <div className="container section">Unavailable section.</div>;
  return <PublicationListBody key={section} section={section} />;
}
function PublicationListBody({ section }: { section: PublicationSection }) {
  const { api, services } = usePublicationConnection(),
    { t, locale, label } = useLocale(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [q, setQ] = useState(""),
    [category, setCategory] = useState(""),
    [graduationYear, setGraduationYear] = useState("");
  const query = usePublicationQuery(
    "list",
    (signal) =>
      section === "campaigns"
        ? api.get_api_v1_media_by_mediaType({
            path: { mediaType: "campaigns" },
            query: { Locale: locale, Page: page, PageSize: 20, Q: q },
            signal,
          })
        : api.get_api_v1_by_contentType({
            path: { contentType: section as ClubContentType },
            query: {
              Locale: locale,
              Page: page,
              PageSize: 20,
              Q: q,
              Category: category || undefined,
              GraduationYear:
                section === "alumni" &&
                /^\d{4}$/.test(graduationYear) &&
                Number(graduationYear) >= 1900 &&
                Number(graduationYear) <= 2200
                  ? Number(graduationYear)
                  : undefined,
            },
            signal,
          }),
    [section, locale, page, q, category, graduationYear],
  );
  const categories = usePublicationQuery(
    "public-categories",
    (signal) =>
      collectApiPages(services.api!, (Page) =>
        api.get_api_v1_by_contentType_categories({
          path: { contentType: section as "activities" | "honor-plate" },
          query: { Locale: locale, Page, PageSize: 100 },
          signal,
        }),
      ),
    [section, locale],
    section === "activities" || section === "honor-plate",
  );
  const current = usePublicationQuery(
    "current-body",
    (signal) =>
      api.get_api_v1_executive_bodies_current({
        query: { Locale: locale },
        signal,
      }),
    locale,
    section === "executive-bodies",
  );
  return (
    <div className="community-v5 community-index-page container publication-page">
      <CommunityNavigation />
      <header className="community-page-intro">
        <span className="eyebrow">{label("communityTitle")}</span>
        <h1 data-page-heading tabIndex={-1}>
          {t(sectionInfo[section])}
        </h1>
        <AppLink href="/community">{label("communityHub")}</AppLink>
      </header>
      {section === "executive-bodies" && (
        <section className="publication-current">
          <h2>{label("currentTerm")}</h2>
          {current.error &&
          "status" in current.error &&
          current.error.status === 404 ? (
            <ContentPlaceholder
              compact
              icon="people"
              title={t({
                en: "No executive body published yet",
                ar: "لم تُنشر هيئة إدارية بعد",
              })}
            />
          ) : (
            <QueryStatus query={current} />
          )}{" "}
          {current.data && <PublicDocument value={current.data} />}
        </section>
      )}
      <form
        className="publication-filters"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQ(search.trim());
        }}
      >
        <label>
          {label("search")}
          <input
            maxLength={100}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        {(section === "activities" || section === "honor-plate") && (
          <label>
            {t({ en: "Category", ar: "الفئة" })}
            <select
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
            >
              <option value="">
                {t({ en: "All categories", ar: "كل الفئات" })}
              </option>
              {rows(categories.data).map((x) => (
                <option key={string(x.id)} value={string(x.slug)}>
                  {string(x.name) || string(x.slug)}
                </option>
              ))}
            </select>
          </label>
        )}
        {section === "alumni" && (
          <label>
            {t({ en: "Graduation year", ar: "سنة التخرج" })}
            <input
              type="number"
              min="1900"
              max="2200"
              step="1"
              value={graduationYear}
              onChange={(e) => {
                setGraduationYear(e.target.value);
                setPage(1);
              }}
              placeholder={t({ en: "All years", ar: "كل السنوات" })}
            />
          </label>
        )}
        <Button type="submit">{label("search")}</Button>
      </form>
      {(section === "activities" || section === "honor-plate") &&
        categories.error && <QueryStatus query={categories} />}
      <QueryStatus query={query} />
      {query.data && (
        <>
          <div className="publication-grid">
            {rows(query.data.items).map((item) => (
              <ItemLink key={string(item.id)} item={item} section={section} />
            ))}
          </div>
          <Empty items={rows(query.data.items)} />
          <Pager
            page={page}
            total={Number(query.data.total)}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
function AuthorizedAsset({
  value,
  cover = false,
}: {
  value: unknown;
  cover?: boolean;
}) {
  const { services, owner, session } = usePublicationConnection(),
    { t } = useLocale(),
    v = record(value),
    assetId = string(v.assetId),
    q = useQuery({
      queryKey: ["publications", owner, session, "asset-metadata", assetId],
      queryFn: () => services.assets!.metadata(assetId),
      enabled: !!assetId && !!services.assets,
      retry: false,
    });
  if (!assetId) return null;
  const kind =
    cover || q.data?.assetType === "Image"
      ? "image"
      : q.data?.assetType === "Video"
        ? "video"
        : "file";
  return (
    <div className="publication-file">
      <ContentAsset
        key={assetId + kind}
        assetId={assetId}
        label={
          string(v.title) ||
          string(v.altText) ||
          q.data?.displayName ||
          q.data?.originalFileName ||
          t({ en: "Attached file", ar: "ملف مرفق" })
        }
        kind={kind}
      />
      {q.data?.assetType === "Pdf" && (
        <small>
          {t({
            en: "PDF edition · available if interactive media cannot load.",
            ar: "نسخة PDF · متاحة إذا تعذّر تحميل الوسائط التفاعلية.",
          })}
        </small>
      )}
    </div>
  );
}
const visibleText = [
  "summary",
  "description",
  "content",
  "bio",
  "achievement",
  "impact",
  "honorTitle",
  "grantingEntity",
  "specialty",
  "workplace",
  "jobTitle",
  "position",
  "organization",
  "locationName",
  "locationDetails",
  "organizer",
  "caption",
];
const visibleDates = [
  "startsAt",
  "endsAt",
  "startsOn",
  "endsOn",
  "releaseDate",
  "termStartDate",
  "termEndDate",
  "honoredOn",
  "capturedAt",
];
const metadataNames: Record<string, { en: string; ar: string }> = {
  startsAt: { en: "Starts", ar: "البداية" },
  endsAt: { en: "Ends", ar: "النهاية" },
  startsOn: { en: "Start date", ar: "تاريخ البداية" },
  endsOn: { en: "End date", ar: "تاريخ النهاية" },
  releaseDate: { en: "Release date", ar: "تاريخ الإصدار" },
  termStartDate: { en: "Term starts", ar: "بداية الدورة" },
  termEndDate: { en: "Term ends", ar: "نهاية الدورة" },
  honoredOn: { en: "Honored on", ar: "تاريخ التكريم" },
  capturedAt: { en: "Captured", ar: "تاريخ الالتقاط" },
  issueNumber: { en: "Issue", ar: "العدد" },
  volumeNumber: { en: "Volume", ar: "المجلد" },
  graduationYear: { en: "Graduation year", ar: "سنة التخرج" },
  participantCount: { en: "Participants", ar: "المشاركون" },
  batchLabel: { en: "Batch", ar: "الدفعة" },
};
/** Published domain JSON is treated as data. Scripts, HTML and internal IDs are never rendered. */
export function PublicDocument({
  value,
  heading = false,
}: {
  value: unknown;
  heading?: boolean;
}) {
  const { t, locale } = useLocale(),
    v = record(value),
    body = publicationPublicModel(v),
    title = publicationTitle(v, locale) || publicationTitle(body, locale),
    seen = new Set<string>();
  return (
    <article className="publication-document">
      {heading ? (
        <h1 data-page-heading tabIndex={-1}>
          {title}
        </h1>
      ) : (
        title && <h3>{title}</h3>
      )}
      {!visibleText.some((key) =>
        localValue(body[key] ?? body[key + "En"] ?? body[key + "Ar"], locale),
      ) &&
        !visibleDates.some((key) => !!body[key]) &&
        ![
          "issueNumber",
          "volumeNumber",
          "graduationYear",
          "participantCount",
          "batchLabel",
        ].some((key) => body[key] !== undefined && body[key] !== null) &&
        ![
          "assets",
          "files",
          "links",
          "members",
          "speakers",
          "scheduleItems",
          "sponsors",
          "items",
        ].some((key) => publicationChildren(body[key]).length > 0) &&
        ![
          "canvaUrl",
          "linkedinUrl",
          "mapUrl",
          "websiteUrl",
          "externalUrl",
          "url",
          "registrationUrl",
        ].some((key) => !!contentLink(body[key])) &&
        !body.cover &&
        !body.assetId &&
        !body.asset && <ContentPlaceholder compact />}
      {visibleText.map((key) => {
        const val =
          body[key] ??
          body[key + (locale === "ar" ? "Ar" : "En")] ??
          body[key + "En"] ??
          body[key + "Ar"];
        const text = localValue(val, locale);
        if (!text || text === title || seen.has(text)) return null;
        seen.add(text);
        return <RichText key={key} text={text} />;
      })}
      <dl className="publication-metadata">
        {visibleDates.map((key) => {
          const val = string(body[key]);
          return val ? (
            <div key={key}>
              <dt>{t(metadataNames[key] || { en: key, ar: key })}</dt>
              <dd>
                <time dateTime={val}>
                  {/^\d{4}-\d{2}-\d{2}$/.test(val)
                    ? val
                    : Number.isFinite(Date.parse(val))
                      ? new Date(val).toLocaleString(locale, {
                          timeZone: "Asia/Amman",
                        })
                      : val}
                </time>
              </dd>
            </div>
          ) : null;
        })}
        {[
          "issueNumber",
          "volumeNumber",
          "graduationYear",
          "participantCount",
          "batchLabel",
        ].map((key) =>
          body[key] !== undefined && body[key] !== null ? (
            <div key={key}>
              <dt>{t(metadataNames[key] || { en: key, ar: key })}</dt>
              <dd>{String(body[key])}</dd>
            </div>
          ) : null,
        )}
      </dl>
      {!!body.cover && <AuthorizedAsset value={body.cover} cover />}
      {!!v.cover &&
        string(record(v.cover).assetId) !==
          string(record(body.cover).assetId) && (
          <AuthorizedAsset value={v.cover} cover />
        )}
      {["assets", "files"].map((key) =>
        publicationChildren(body[key]).map((x, i) => (
          <AuthorizedAsset key={key + string(x.id) + i} value={x} />
        )),
      )}
      {[
        "links",
        "members",
        "speakers",
        "scheduleItems",
        "schedule",
        "sponsors",
        "items",
      ].map((key) =>
        publicationChildren(body[key]).length ? (
          <section key={key} className="publication-child-list">
            <h3>
              {t({
                en: (
                  {
                    links: "Links",
                    members: "Members",
                    speakers: "Speakers",
                    scheduleItems: "Programme",
                    sponsors: "Sponsors",
                    items: "Album",
                  } as Record<string, string>
                )[key],
                ar: (
                  {
                    links: "الروابط",
                    members: "الأعضاء",
                    speakers: "المتحدثون",
                    scheduleItems: "البرنامج",
                    sponsors: "الرعاة",
                    items: "الألبوم",
                  } as Record<string, string>
                )[key],
              })}
            </h3>
            {publicationChildren(body[key]).map((x, i) => (
              <div key={string(x.id) || i}>
                <PublicDocument value={x} />
                {!!x.asset && <AuthorizedAsset value={x.asset} />}
                <AuthorizedAsset value={x} />
              </div>
            ))}
          </section>
        ) : null,
      )}
      {safeUrl(body.canvaUrl) && (
        <SafeEmbed url={safeUrl(body.canvaUrl)!} title={title} />
      )}
      {[
        "registrationUrl",
        "linkedinUrl",
        "mapUrl",
        "websiteUrl",
        "externalUrl",
        "url",
      ].map((k) =>
        contentLink(body[k]) ? (
          <p key={k}>
            {contentLink(body[k])!.startsWith("/") ? (
              <AppLink href={contentLink(body[k])!}>
                {t({ en: "Open link", ar: "فتح الرابط" })}
              </AppLink>
            ) : (
              <a
                href={contentLink(body[k])!}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t({ en: "Open link", ar: "فتح الرابط" })}
              </a>
            )}
          </p>
        ) : null,
      )}
    </article>
  );
}
export function PublicationDetail() {
  const { section, slug } = useParams();
  if (
    !section ||
    !Object.hasOwn(sectionInfo, section) ||
    section === "albums" ||
    !slug
  )
    return <div className="container section">Unavailable publication.</div>;
  return (
    <PublicationDetailBody
      key={section + slug}
      section={section as PublicationSection}
      slug={slug}
    />
  );
}
function PublicationDetailBody({
  section,
  slug,
}: {
  section: PublicationSection;
  slug: string;
}) {
  const { api } = usePublicationConnection(),
    { locale, t } = useLocale(),
    [page, setPage] = useState(1);
  const detail = usePublicationQuery(
    "detail",
    (signal) =>
      section === "campaigns"
        ? api.get_api_v1_media_by_mediaType_by_slug({
            path: { mediaType: "campaigns", slug },
            query: { Locale: locale, Page: page, PageSize: 20 },
            signal,
          })
        : api.get_api_v1_by_contentType_by_slug({
            path: { contentType: section as ClubContentType, slug },
            query: { Locale: locale, Page: page, PageSize: 20 },
            signal,
          }),
    [section, slug, locale, page],
  );
  return (
    <div className="community-v5 community-index-page container publication-page">
      <CommunityNavigation />
      <AppLink className="text-link" href={publicationPath(section)}>
        {t(sectionInfo[section])}
      </AppLink>
      <QueryStatus query={detail} />
      {detail.data && (
        <>
          <PublicDocument value={detail.data} heading />
          <Pager
            page={page}
            total={publicationChildrenTotal(detail.data)}
            onChange={setPage}
          />
        </>
      )}
      {section === "conferences" && <ConferenceCollections slug={slug} />}{" "}
      {section === "campaigns" && <CampaignAlbums campaignSlug={slug} />}
    </div>
  );
}
function ConferenceCollections({ slug }: { slug: string }) {
  const { api } = usePublicationConnection(),
    { locale, t } = useLocale(),
    [collection, setCollection] = useState<"speakers" | "schedule">("speakers"),
    [page, setPage] = useState(1);
  const query = usePublicationQuery(
    "conference-children",
    (signal) =>
      api.get_api_v1_conferences_by_slug_by_collection({
        path: { slug, collection },
        query: { Locale: locale, Page: page, PageSize: 20 },
        signal,
      }),
    [slug, locale, collection, page],
  );
  return (
    <section>
      <div className="student-connected-actions">
        {(["speakers", "schedule"] as const).map((key) => (
          <Button
            key={key}
            variant={collection === key ? "default" : "outline"}
            onClick={() => {
              setCollection(key);
              setPage(1);
            }}
          >
            {t(
              key === "speakers"
                ? { en: "Speakers", ar: "المتحدثون" }
                : { en: "Programme", ar: "البرنامج" },
            )}
          </Button>
        ))}
      </div>
      <QueryStatus query={query} />
      {query.data && (
        <>
          <div className="publication-grid">
            {rows(query.data.items).map((item, i) => (
              <PublicDocument key={string(item.id) || i} value={item} />
            ))}
          </div>
          <Empty items={rows(query.data.items)} />
          <Pager
            page={page}
            total={Number(query.data.total)}
            onChange={setPage}
          />
        </>
      )}
    </section>
  );
}
function CampaignAlbums({ campaignSlug }: { campaignSlug: string }) {
  const { api } = usePublicationConnection(),
    { locale, t } = useLocale(),
    [page, setPage] = useState(1),
    [albumSlug, setAlbumSlug] = useState(""),
    [itemPage, setItemPage] = useState(1);
  const list = usePublicationQuery(
      "campaign-albums",
      (signal) =>
        api.get_api_v1_media_campaigns_by_campaignSlug_albums({
          path: { campaignSlug },
          query: { Locale: locale, Page: page, PageSize: 20 },
          signal,
        }),
      [campaignSlug, locale, page],
    ),
    detail = usePublicationQuery(
      "album-detail",
      (signal) =>
        api.get_api_v1_media_campaigns_by_campaignSlug_albums_by_albumSlug({
          path: { campaignSlug, albumSlug },
          query: { Locale: locale, Page: itemPage, PageSize: 20 },
          signal,
        }),
      [campaignSlug, albumSlug, locale, itemPage],
      !!albumSlug,
    );
  return (
    <section>
      <h2>{t({ en: "Albums", ar: "الألبومات" })}</h2>
      <QueryStatus query={list} />
      {list.data && (
        <>
          <div className="publication-grid">
            {rows(list.data.items).map((item) => (
              <article key={string(item.id)} className="publication-card">
                <h3>{publicationTitle(item, locale)}</h3>
                <p>{string(item.summary)}</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setItemPage(1);
                    setAlbumSlug(string(item.slug));
                  }}
                >
                  {t({ en: "Open album", ar: "فتح الألبوم" })}
                </Button>
              </article>
            ))}
          </div>
          <Empty items={rows(list.data.items)} />
          <Pager
            page={page}
            total={Number(list.data.total)}
            onChange={setPage}
          />
        </>
      )}
      {albumSlug && (
        <section>
          <QueryStatus query={detail} />
          {detail.data && (
            <>
              <PublicDocument value={detail.data} />
              <Pager
                page={itemPage}
                total={publicationChildrenTotal(detail.data)}
                onChange={setItemPage}
              />
            </>
          )}
        </section>
      )}
    </section>
  );
}
export function PublicAbout() {
  const { api } = usePublicationConnection(),
    { locale, label } = useLocale(),
    query = usePublicationQuery(
      "about",
      (signal) => api.get_api_v1_about({ query: { Locale: locale }, signal }),
      locale,
    );
  return (
    <div className="community-v5 community-index-page container publication-page">
      <CommunityNavigation />
      <header className="community-page-intro">
        <span className="eyebrow">{label("aboutMedClub")}</span>
        <h1 data-page-heading tabIndex={-1}>
          {query.data?.title || label("aboutTitle")}
        </h1>
        {query.data?.summary && <p>{query.data.summary}</p>}
      </header>
      <ReadFeedback query={query} />
      {query.data && (
        <PublishedContent
          content={record(query.data.content).content}
          hideHeading
        />
      )}
    </div>
  );
}
