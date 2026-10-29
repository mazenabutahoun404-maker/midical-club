import { CareerGuidance } from "./CareerGuidance";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import { Button } from "../../components/ui/button";
import { record, string } from "../../services/api/mapping";
import {
  useEngagementConnection,
  useEngagementQuery,
  useEngagementAction,
  QueryStatus,
  Pager,
  Empty,
  rows,
} from "./shared";
import { localizedField } from "./model";
import { engagementUrl } from "../../services/api/engagement-contracts";
import { ApiError } from "../../services/api/client";
export function EngagementSignIn() {
  const { t } = useLocale();
  return (
    <div className="container section">
      <p>
        {t({
          en: "Sign in with a verified account to see content available to you.",
          ar: "سجّل الدخول بحساب موثّق لرؤية المحتوى المتاح لك.",
        })}
      </p>
      <AppLink className="button button-primary" href="/auth/sign-in">
        {t({ en: "Sign in", ar: "تسجيل الدخول" })}
      </AppLink>
    </div>
  );
}
export function OpportunityCatalog({ saved = false }: { saved?: boolean }) {
  const { owner, session } = useEngagementConnection();
  return owner ? (
    <OpportunityList key={String(owner) + session + saved} saved={saved} />
  ) : (
    <EngagementSignIn />
  );
}
function OpportunityList({ saved }: { saved: boolean }) {
  const { api } = useEngagementConnection(),
    { locale, t, label } = useLocale(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [submitted, setSubmitted] = useState(""),
    q = useEngagementQuery(
      "opportunity-list",
      (signal) =>
        saved
          ? api.get_api_v1_opportunities_saved({
              query: { Page: page, PageSize: 20, Q: submitted },
              signal,
            })
          : api.get_api_v1_opportunities({
              query: { Page: page, PageSize: 20, Q: submitted },
              signal,
            }),
      [saved, page, submitted],
      true,
      true,
    );
  return (
    <div className="container discovery-page opportunity-hub engagement-page">
      {saved ? (
        <header>
          <h1 data-page-heading tabIndex={-1}>
            {label("myOpportunities")}
          </h1>
        </header>
      ) : (
        <section className="discovery-hero opportunity-discovery-hero artwork-scene">
          <div className="discovery-hero-copy">
            <span className="eyebrow">{label("opportunitiesHubEyebrow")}</span>
            <h1 data-page-heading tabIndex={-1}>
              {label("opportunitiesHubTitle")}
            </h1>
            <p>{label("opportunitiesHubBody")}</p>
          </div>
          <HeroArtwork section="involved" />
        </section>
      )}
      {!saved && <CareerGuidance />}
      <form
        className="engagement-toolbar"
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
      <QueryStatus query={q} />
      {q.data && (
        <>
          <div className="opportunity-explorer-grid">
            {rows(q.data.items).map((item) => (
              <article key={string(item.id)} className="engagement-opportunity">
                <span className="eyebrow">
                  {string(item.type)} · {string(item.status)}
                </span>
                <h2>
                  <AppLink
                    href={
                      "/opportunities/" + encodeURIComponent(string(item.id))
                    }
                  >
                    {localizedField(item, "title", locale)}
                  </AppLink>
                </h2>
                <p>{localizedField(item, "summary", locale)}</p>
                {!!item.deadlineAt && (
                  <p>
                    {t({ en: "Deadline", ar: "الموعد النهائي" })}:{" "}
                    <time dateTime={string(item.deadlineAt)}>
                      {new Date(string(item.deadlineAt)).toLocaleString(
                        locale,
                        { timeZone: string(item.timezoneId) || "Asia/Amman" },
                      )}
                    </time>
                  </p>
                )}
                <OpportunityActions item={item} />
              </article>
            ))}
          </div>
          <Empty items={rows(q.data.items)} />
          <Pager
            page={page}
            total={Number(q.data.totalItems)}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
export function OpportunityDetail() {
  const { owner, session } = useEngagementConnection(),
    { slug } = useParams();
  return owner ? (
    <OpportunityDetailBody key={String(owner) + session + slug} id={slug!} />
  ) : (
    <EngagementSignIn />
  );
}
function OpportunityDetailBody({ id }: { id: string }) {
  const { api } = useEngagementConnection(),
    { locale, t, label } = useLocale(),
    q = useEngagementQuery(
      "opportunity-detail",
      (signal) => api.get_api_v1_opportunities_by_id({ path: { id }, signal }),
      id,
      true,
      true,
    ),
    saved = useEngagementQuery(
      "opportunity-saved-state",
      async (signal) => {
        for (let page = 1; page <= 100; page++) {
          const value = await api.get_api_v1_opportunities_saved({
              query: { Page: page, PageSize: 100 },
              signal,
            }),
            item = rows(value.items).find((x) => x.id === id);
          if (item) return item;
          if (page >= value.totalPages)
            return { id, saved: false, remindersEnabled: false };
        }
        throw new ApiError(
          "The saved list is too large to establish this item state.",
          422,
          "LIST_TOO_LARGE",
        );
      },
      id,
      true,
      true,
    ),
    item = record(q.data);
  return (
    <div className="container opportunity-detail-page engagement-page">
      <AppLink className="detail-back" href="/opportunities">
        {label("opportunities")}
      </AppLink>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <section className="opportunity-detail-hero">
            <div>
              <span className="eyebrow">
                {string(item.type)} · {string(item.status)}
              </span>
              <h1 data-page-heading tabIndex={-1}>
                {localizedField(item, "title", locale)}
              </h1>
              <p>{localizedField(item, "summary", locale)}</p>
              <p>{string(item.sourceName)}</p>
            </div>
          </section>
          <div className="opportunity-detail-layout">
            <section className="opportunity-story-card">
              <p style={{ whiteSpace: "pre-wrap" }}>
                {localizedField(item, "content", locale)}
              </p>
              {!!item.deadlineAt && (
                <p>
                  {t({ en: "Deadline", ar: "الموعد النهائي" })}:{" "}
                  {string(item.deadlineAt)}
                </p>
              )}
              {engagementUrl(item.sourceUrl) && (
                <a
                  href={engagementUrl(item.sourceUrl)!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t({ en: "Original source", ar: "المصدر الأصلي" })}
                </a>
              )}
            </section>
            <aside className="opportunity-action-card">
              <QueryStatus query={saved} />
              {saved.data && (
                <OpportunityActions item={{ ...item, ...saved.data }} />
              )}
              {engagementUrl(item.applicationUrl) && (
                <a
                  className="button button-primary"
                  href={engagementUrl(item.applicationUrl)!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t({
                    en: "Visit application website",
                    ar: "زيارة موقع التقديم",
                  })}
                </a>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
function OpportunityActions({ item }: { item: Record<string, unknown> }) {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    action = useEngagementAction(),
    id = string(item.id),
    saved = item.saved === true;
  return (
    <div className="engagement-opportunity-actions">
      <Button
        variant={saved ? "outline" : "default"}
        disabled={action.busy}
        onClick={() =>
          void action.run(() =>
            saved
              ? api.delete_api_v1_opportunities_by_id_save({ path: { id } })
              : api.post_api_v1_opportunities_by_id_save({ path: { id } }),
          )
        }
      >
        {t(
          saved
            ? { en: "Unsave", ar: "إزالة من المحفوظات" }
            : { en: "Save opportunity", ar: "حفظ الفرصة" },
        )}
      </Button>
      {saved && (
        <label className="engagement-check">
          <input
            type="checkbox"
            checked={item.remindersEnabled === true}
            disabled={action.busy}
            onChange={(e) => {
              const remindersEnabled = e.target.checked;
              void action.run(() =>
                api.put_api_v1_opportunities_by_id_reminder_preference({
                  path: { id },
                  body: { remindersEnabled },
                }),
              );
            }}
          />
          {t({ en: "Deadline reminders", ar: "تذكيرات الموعد النهائي" })}
        </label>
      )}
      {action.feedback}
    </div>
  );
}
