import { useServices } from "../../app/providers/ServicesProvider";
import ContentLibrary from "../content-live/ContentLibrary";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  Copy,
  FilePenLine,
  Files,
  Globe2,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AliveTabs } from "../../components/navigation/AliveTabs";
import { AppLink } from "../../components/navigation/AppLink";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { formatDate } from "../../lib/dates";
import type { BuilderPageStatus } from "../../types/builder";
import { builderAudienceKey, builderStatusKey } from "./builder-format";
import { useBuilderActions, useBuilderPages } from "./useBuilder";

type PageView = "all" | BuilderPageStatus;

export default function BuilderLibraryPage() {
  return useServices().contentApi ? (
    <ContentLibrary />
  ) : (
    <PreviewBuilderLibraryPage />
  );
}
function PreviewBuilderLibraryPage() {
  const { label, t, locale } = useLocale();
  const query = useBuilderPages();
  const actions = useBuilderActions();
  const navigate = useNavigate();
  const [view, setView] = useState<PageView>("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [slug, setSlug] = useState("/");
  const pages = query.data || [];
  const filtered = useMemo(() => {
    const value = search.trim().toLocaleLowerCase();
    return pages.filter((page) => {
      if (view !== "all" && page.status !== view) return false;
      return (
        !value ||
        `${t(page.title)} ${page.slug}`.toLocaleLowerCase().includes(value)
      );
    });
  }, [pages, search, t, view]);
  const tabs = [
    {
      id: "all",
      label: label("builderAllPages"),
      icon: Files,
      count: pages.length,
    },
    {
      id: "draft",
      label: label("builderDrafts"),
      icon: FilePenLine,
      count: pages.filter((page) => page.status === "draft").length,
    },
    {
      id: "scheduled",
      label: label("builderScheduled"),
      icon: CalendarClock,
      count: pages.filter((page) => page.status === "scheduled").length,
    },
    {
      id: "published",
      label: label("builderPublished"),
      icon: Globe2,
      count: pages.filter((page) => page.status === "published").length,
    },
  ] as const;

  const create = async () => {
    try {
      const page = await actions.create({
        title: { en: titleEn, ar: titleAr },
        slug,
      });
      setCreateOpen(false);
      navigate(`/admin/builder/${encodeURIComponent(page.id)}`);
    } catch {
      toast.error(label("builderCreateFailed"));
    }
  };
  const duplicate = async (id: string) => {
    const page = await actions.duplicate(id);
    toast.success(label("builderDuplicated"));
    navigate(`/admin/builder/${encodeURIComponent(page.id)}`);
  };

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  return (
    <div className="container admin-page builder-library-page">
      <div className="builder-library-intro">
        <PageIntro
          eyebrow={label("builderEyebrow")}
          title={label("builderTitle")}
          description={label("builderBody")}
        />
        <Button
          className="button button-primary builder-new-page"
          onClick={() => setCreateOpen(true)}
        >
          <Plus />
          {label("builderNewPage")}
        </Button>
      </div>
      <section
        className="builder-library-signal"
        aria-label={label("builderPageCount")}
      >
        <div>
          <span>{String(pages.length).padStart(2, "0")}</span>
          <p>{label("builderPageCount")}</p>
        </div>
        <i aria-hidden="true">
          <b />
          <b />
          <b />
          <b />
          <b />
        </i>
        <div>
          <span>{pages.reduce((sum, page) => sum + page.blockCount, 0)}</span>
          <p>{label("builderBlocks")}</p>
        </div>
      </section>
      <div className="builder-library-toolbar">
        <AliveTabs
          label={label("builderAllPages")}
          items={[...tabs]}
          value={view}
          onChange={setView}
        />
        <label className="admin-search-field builder-page-search">
          <Search size={18} />
          <span className="sr-only">{label("builderSearchPages")}</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={label("builderSearchPages")}
          />
        </label>
      </div>
      {filtered.length ? (
        <div className="builder-page-grid">
          {filtered.map((page, index) => (
            <article
              className="builder-page-card"
              data-status={page.status}
              key={page.id}
            >
              <div className="builder-page-card-visual" aria-hidden="true">
                <span>0{index + 1}</span>
                <i />
                <i />
                <i />
              </div>
              <div className="builder-page-card-main">
                <div className="builder-page-card-top">
                  <span
                    className="builder-page-status"
                    data-status={page.status}
                  >
                    {label(builderStatusKey(page.status))}
                  </span>
                  <code>{page.slug}</code>
                </div>
                <h2>{t(page.title)}</h2>
                <dl>
                  <div>
                    <dt>{label("builderBlocks")}</dt>
                    <dd>{page.blockCount}</dd>
                  </div>
                  <div>
                    <dt>{label("builderRevision")}</dt>
                    <dd>{page.revision}</dd>
                  </div>
                  <div>
                    <dt>{label("builderAudience")}</dt>
                    <dd>{label(builderAudienceKey(page.audience))}</dd>
                  </div>
                </dl>
                <p>{formatDate(page.updatedAt, locale)}</p>
                <div className="builder-page-card-actions">
                  <Button asChild className="button button-primary">
                    <AppLink
                      href={`/admin/builder/${encodeURIComponent(page.id)}`}
                    >
                      {label("builderOpenEditor")}
                    </AppLink>
                  </Button>
                  <Button
                    variant="outline"
                    aria-label={`${label("builderDuplicate")} ${t(page.title)}`}
                    onClick={() => void duplicate(page.id)}
                  >
                    <Copy />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title={label("builderEmptyPages")}
          description={label("builderBody")}
        />
      )}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={label("builderNewPage")}
        description={label("builderPathHint")}
        className="builder-create-modal"
      >
        <div className="builder-create-form">
          <label>
            <span>{label("builderEnglishTitle")}</span>
            <input
              value={titleEn}
              onChange={(event) => setTitleEn(event.target.value)}
              autoFocus
            />
          </label>
          <label dir="rtl">
            <span>{label("builderArabicTitle")}</span>
            <input
              value={titleAr}
              onChange={(event) => setTitleAr(event.target.value)}
            />
          </label>
          <label>
            <span>{label("builderPath")}</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
            <small>{label("builderPathHint")}</small>
          </label>
          <div>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {label("builderCancel")}
            </Button>
            <Button
              className="button button-primary"
              disabled={!titleEn.trim() || !titleAr.trim()}
              onClick={() => void create()}
            >
              {label("builderCreatePage")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
