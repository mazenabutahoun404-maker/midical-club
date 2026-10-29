import { refreshContent } from "./content-cache";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAccess } from "../governance/useGovernance";
import { PageIntro } from "../../components/data-display/PageIntro";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { AcademicFields, AcademicPager } from "../academics/AcademicUI";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { C } from "./content-keys";
import { pageFields, localizedBody } from "./content-fields";
import {
  ContentReusablePanel,
  ContentEmbedPanel,
} from "./ContentReusablePanel";
import {
  ContentReviewPanel,
  ContentReviewCalendar,
  ContentRollbackPanel,
} from "./ContentReviewPanel";
import { createRecordId } from "../../lib/record-id";
import type { Schemas } from "../../services/api/schema.generated";
import "../../styles/account-access.css";
import "../../styles/academic-admin.css";

export default function ContentLibrary() {
  const owner = useAuth().snapshot.user?.id || "guest";
  return <Library key={owner} />;
}
function Library() {
  const services = useServices(),
    c = services.contentApi!,
    { t } = useLocale(),
    access = useAccess(),
    navigate = useNavigate(),
    client = useQueryClient();
  const permissions = access.data?.permissions || [];
  const can = (name: string) => permissions.includes(name);
  const [selectedTab, setTab] = useState(""),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [open, setOpen] = useState(false),
    [draft, setDraft] = useState<Record<string, unknown>>({
      pageType: "Custom",
    }),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false),
    [commandKey, setCommandKey] = useState(createRecordId());
  const tab =
    selectedTab ||
    (can("content.edit")
      ? "pages"
      : can("content.reusable.manage")
        ? "reusable"
        : "reviews");
  const list = useQuery({
    queryKey: ["native-content", "pages", page, query],
    queryFn: () =>
      c[C.pages]({
        query: { Page: page, PageSize: 20, Search: query || undefined },
      }),
    enabled: tab === "pages" && can("content.edit"),
  });
  const tabs = [
    ...(can("content.edit")
      ? [{ id: "pages", en: "Pages", ar: "الصفحات" }]
      : []),
    ...(can("content.reusable.manage")
      ? [
          {
            id: "reusable",
            en: "Reusable blocks",
            ar: "الكتل القابلة لإعادة الاستخدام",
          },
        ]
      : []),
    ...(can("content.edit")
      ? [{ id: "embeds", en: "Embed providers", ar: "مزودو التضمين" }]
      : []),
    { id: "reviews", en: "Reviews", ar: "المراجعات" },
    ...(can("content_review.manage")
      ? [{ id: "calendar", en: "Review calendar", ar: "تقويم المراجعة" }]
      : []),
    ...(permissions.some((p) => p.startsWith("content_rollback."))
      ? [{ id: "rollback", en: "Version restoration", ar: "استعادة النسخ" }]
      : []),
  ];
  return (
    <div className="container academic-admin">
      <PageIntro
        title={t({ en: "Content & publishing", ar: "المحتوى والنشر" })}
        description={t({
          en: "Edit drafts, review changes and publish snapshots. Saving a draft does not publish it.",
          ar: "حرّر المسودات وراجع التغييرات وانشر النسخ. حفظ المسودة لا ينشرها.",
        })}
      />
      <nav
        className="academic-admin-tabs"
        aria-label={t({ en: "Content tools", ar: "أدوات المحتوى" })}
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            aria-pressed={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {t(item)}
          </button>
        ))}
      </nav>
      {tab === "pages" && (
        <section className="access-management-card">
          <form
            className="account-api-form access-management-toolbar"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search);
              setPage(1);
            }}
          >
            <input
              aria-label={t({ en: "Search pages", ar: "البحث عن الصفحات" })}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline">{t({ en: "Search", ar: "بحث" })}</Button>
            <Button
              type="button"
              onClick={() => {
                setDraft({ pageType: "Custom" });
                setCommandKey(createRecordId());
                setOpen(true);
                setError(null);
              }}
            >
              {t({ en: "Create page", ar: "إنشاء صفحة" })}
            </Button>
          </form>
          <ApiActionError
            error={list.error || error}
            onReload={() => void list.refetch()}
          />
          {list.data?.items.map((row) => (
            <div className="access-row" key={row.id}>
              <span>
                <strong>{row.titleEn || row.titleAr || row.slug}</strong>
                <small>
                  {row.pageType} · {row.status} · {row.slug}
                </small>
              </span>
              <AppLink
                className="button button-secondary"
                href={`/admin/builder/${encodeURIComponent(row.id)}`}
              >
                {t({ en: "Edit page", ar: "تعديل الصفحة" })}
              </AppLink>
            </div>
          ))}
          {list.data && (
            <AcademicPager
              page={page}
              totalPages={list.data.totalPages}
              onChange={setPage}
            />
          )}
        </section>
      )}
      {tab === "reusable" && <ContentReusablePanel />}
      {tab === "embeds" && <ContentEmbedPanel />}
      {tab === "reviews" && <ContentReviewPanel />}
      {tab === "calendar" && <ContentReviewCalendar />}
      {tab === "rollback" && <ContentRollbackPanel />}
      <Modal
        open={open}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
        title={t({ en: "Create page", ar: "إنشاء صفحة" })}
        description={t({
          en: "The page starts as a draft.",
          ar: "تبدأ الصفحة بحالة مسودة.",
        })}
      >
        <form
          className="account-api-form academic-admin"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            setError(null);
            try {
              const body = {
                ...draft,
                ...localizedBody(draft),
              } as Schemas["PageRequest"];
              delete (body as Record<string, unknown>).titleAr;
              delete (body as Record<string, unknown>).titleEn;
              delete (body as Record<string, unknown>).descriptionAr;
              delete (body as Record<string, unknown>).descriptionEn;
              const result = await c[C.createPage]({
                body,
                idempotencyKey: commandKey,
              });
              setOpen(false);
              await refreshContent(client);
              navigate(`/admin/builder/${result.id}`);
            } catch (caught) {
              setError(caught);
            } finally {
              setBusy(false);
            }
          }}
        >
          <AcademicFields
            fields={pageFields}
            value={draft}
            onChange={setDraft}
            disabled={busy}
          />
          <ApiActionError error={error} />
          <Button disabled={busy}>
            {t({ en: "Create draft", ar: "إنشاء المسودة" })}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
