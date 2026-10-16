import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Bookmark,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Folders,
} from "lucide-react";
import { useLibraryContent } from "./useLibraryContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { SelectField } from "../../components/forms/SelectField";
import { SearchInput } from "../../components/forms/SearchInput";
import { ResourceCard } from "../../components/cards/ResourceCard";
import { EventCard } from "../../components/cards/EventCard";
import { OpportunityCard } from "../../components/cards/OpportunityCard";
import { ArticleCard } from "../../components/cards/ArticleCard";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { EmptyState } from "../../components/feedback/EmptyState";
import {
  CollectionDialog,
  OrganizeDialog,
  type CollectionAction,
} from "./CollectionDialogs";
import { filterLibrary } from "./library-selectors";
export default function LibraryPage() {
  const { label, t, locale } = useLocale();
  const [params] = useSearchParams();
  const library = useLibraryContent();
  const workspace = useWorkspace();
  const [query, setQuery] = useState(""),
    [type, setType] = useState(""),
    [courseId, setCourseId] = useState(params.get("course") || ""),
    [sort, setSort] = useState("saved");
  const [selected, setSelected] = useState<string | null>(null);
  const [action, setAction] = useState<CollectionAction | null>(null);
  const [organize, setOrganize] = useState<{
    id: string;
    title: string;
  } | null>(null);
  useEffect(() => {
    if (
      selected &&
      !workspace.isPending &&
      !workspace.state.collections.some((c) => c.id === selected)
    )
      setSelected(null);
  }, [selected, workspace.isPending, workspace.state.collections]);
  if (library.isError || workspace.isError)
    return (
      <ErrorState
        retry={() => {
          library.retry();
          workspace.retry();
        }}
      />
    );
  if (library.isPending || workspace.isPending) return <LoadingState />;
  const collection = workspace.state.collections.find((c) => c.id === selected);
  const items = filterLibrary(
    library.items,
    { query, type, courseId, sort, collectionIds: collection?.itemIds },
    locale,
  );
  return (
    <div className="container library-v3">
      <PageIntro
        title={label("libraryTitle")}
        description={label("libraryBody")}
        eyebrow={label("collectionShelf")}
      />
      <div className="library-workbench">
        <aside className="collection-rail" aria-label={label("collections")}>
          <button
            className={
              selected === null ? "collection-tab active" : "collection-tab"
            }
            onClick={() => setSelected(null)}
            aria-pressed={selected === null}
          >
            <Bookmark size={19} />
            <span>{label("allSaved")}</span>
            <b>{library.count}</b>
          </button>
          <div className="collection-divider">
            <span>{label("collections")}</span>
            <button
              aria-label={label("newCollection")}
              onClick={() => setAction({ kind: "create" })}
              disabled={workspace.state.collections.length >= 50}
            >
              <Plus size={18} />
            </button>
          </div>
          {workspace.state.collections.map((c) => (
            <button
              key={c.id}
              data-collection-id={c.id}
              aria-label={c.name + " " + c.itemIds.length}
              className={
                selected === c.id ? "collection-tab active" : "collection-tab"
              }
              onClick={() => setSelected(c.id)}
              aria-pressed={selected === c.id}
            >
              <FolderOpen size={19} />
              <span>{c.name}</span>
              <b>{c.itemIds.length}</b>
            </button>
          ))}
          {!workspace.state.collections.length && (
            <div className="collection-onboarding">
              <Folders size={32} />
              <p>{label("collectionHelp")}</p>
              <button
                className="text-link"
                onClick={() => setAction({ kind: "create" })}
              >
                {label("newCollection")} <Plus size={14} />
              </button>
            </div>
          )}
        </aside>
        <section className="library-shelf">
          <div className="shelf-heading">
            <div>
              <span className="eyebrow">
                {items.length} {label("libraryCount")}
              </span>
              <h2>{collection?.name || label("allSaved")}</h2>
            </div>
            {collection && (
              <div className="shelf-actions">
                <button
                  className="workspace-icon"
                  aria-label={label("renameCollection")}
                  onClick={() => setAction({ kind: "rename", collection })}
                >
                  <Pencil size={17} />
                </button>
                <button
                  className="workspace-icon"
                  aria-label={label("deleteCollection")}
                  onClick={() => setAction({ kind: "delete", collection })}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            )}
          </div>
          <div className="library-controls">
            <SearchInput
              value={query}
              onChange={setQuery}
              label={label("findSaved")}
            />
            <SelectField
              label={label("searchType")}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">{label("allTypes")}</option>
              <option value="resource">{label("resources")}</option>
              <option value="event">{label("events")}</option>
              <option value="opportunity">{label("opportunities")}</option>
              <option value="article">{label("journal")}</option>
            </SelectField>
            <SelectField
              label={label("course")}
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">{label("allCourses")}</option>
              {library.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {t(c.title)}
                </option>
              ))}
            </SelectField>
            <SelectField
              label={label("sort")}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="saved">{label("recentlySaved")}</option>
              <option value="title">{label("alphabetical")}</option>
              <option value="updated">{label("recentlyUpdated")}</option>
            </SelectField>
          </div>
          <div className="library-results-status">
            <span role="status">
              {items.length} {label("resultsFound")}
            </span>
            {(query || type || courseId) && (
              <button
                className="quiet-button"
                onClick={() => {
                  setQuery("");
                  setType("");
                  setCourseId("");
                }}
              >
                {label("clearFilters")}
              </button>
            )}
          </div>
          <div className="library-grid">
            {items.map((record) => (
              <div className="library-shelf-item" key={record.item.id}>
                {record.kind === "resource" ? (
                  <ResourceCard
                    resource={record.item}
                    course={library.courses.find(
                      (c) => c.id === record.item.courseId,
                    )}
                  />
                ) : record.kind === "event" ? (
                  <EventCard event={record.item} />
                ) : record.kind === "opportunity" ? (
                  <OpportunityCard opportunity={record.item} />
                ) : record.kind === "article" ? (
                  <ArticleCard article={record.item} />
                ) : null}
                <button
                  className="organize-button"
                  onClick={() =>
                    setOrganize({
                      id: record.item.id,
                      title: t(record.item.title),
                    })
                  }
                >
                  <FolderOpen size={15} />
                  {label("organize")}
                  <span>
                    {
                      workspace.state.collections.filter((c) =>
                        c.itemIds.includes(record.item.id),
                      ).length
                    }
                  </span>
                </button>
              </div>
            ))}
            {!items.length && (
              <EmptyState
                title={label(
                  query || type || courseId
                    ? "noFilteredItems"
                    : collection
                      ? "collectionEmpty"
                      : "libraryEmpty",
                )}
                description={label("libraryEmptyBody")}
                href="/my/learning"
              />
            )}
          </div>
        </section>
      </div>
      {action && (
        <CollectionDialog
          action={action}
          close={() => {
            setAction(null);
          }}
        />
      )}
      {organize && (
        <OrganizeDialog
          itemId={organize.id}
          title={organize.title}
          close={() => setOrganize(null)}
        />
      )}
    </div>
  );
}
