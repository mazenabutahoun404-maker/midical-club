import { useServices } from "../../app/providers/ServicesProvider";
import LiveSearch from "../student-live/Search";
import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  CalendarDays,
  Compass,
  Newspaper,
  LoaderCircle,
  History,
  HeartHandshake,
  UsersRound,
  ShoppingBag,
  BriefcaseBusiness,
  X,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useCourses } from "../../hooks/useContent";
import { useSearch } from "./useSearch";
import { SelectField } from "../../components/forms/SelectField";
import { Button } from "../../components/ui/button";
import { AppLink } from "../../components/navigation/AppLink";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../../components/ui/command";
import type { SearchFilters, SearchResult } from "../../types/content";
const kinds = [
  "course",
  "resource",
  "event",
  "opportunity",
  "article",
  "mentor",
  "mentorship-session",
  "product",
  "position",
] as const;
const formats = [
  "guidance",
  "slides",
  "notes",
  "summary",
  "recording",
  "book",
  "questions",
  "external",
] as const;
const icons = {
  course: BookOpen,
  resource: FileText,
  event: CalendarDays,
  opportunity: Compass,
  article: Newspaper,
  mentor: HeartHandshake,
  "mentorship-session": UsersRound,
  product: ShoppingBag,
  position: BriefcaseBusiness,
};
// Buttons, links and selects retain their own Enter/arrow behavior inside CMDK.
// Escape still reaches the native dialog; input/list navigation is unchanged.
function keepControlKeys(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== "Escape") event.stopPropagation();
}
function PreviewSearchPanel({
  compact = false,
  anchored = false,
  initialQuery = "",
}: {
  compact?: boolean;
  anchored?: boolean;
  initialQuery?: string;
}) {
  const { label, t } = useLocale();
  const navigate = useNavigate(),
    paths = useWorkspacePaths();
  const { closeSearch, openDetail } = useOverlays();
  const { state, send } = useWorkspace();
  const courses = useCourses();
  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState<"all" | "my">(
    paths.personal ? "my" : "all",
  );
  const [filters, setFilters] = useState<SearchFilters>({});
  const value = useDebouncedValue(query);
  const result = useSearch(value, scope, filters);
  const pending = !result.isError && (result.isPending || value !== query);
  const updateFilter = (field: keyof SearchFilters, value: string) =>
    setFilters((f) => ({ ...f, [field]: value || undefined }));
  const choose = (item: SearchResult) => {
    if (query.trim()) void send({ type: "remember-search", query });
    if (item.record.kind === "course") {
      closeSearch();
      navigate(paths.course(item.record.item.slug));
    } else if (item.record.kind === "mentor") {
      closeSearch();
      navigate(
        `/mentorship?mentor=${encodeURIComponent(item.record.item.slug)}`,
      );
    } else if (item.record.kind === "mentorship-session") {
      closeSearch();
      navigate("/mentorship/sessions");
    } else if (item.record.kind === "product") {
      closeSearch();
      navigate(`/store/products/${encodeURIComponent(item.record.item.slug)}`);
    } else if (item.record.kind === "position") {
      closeSearch();
      navigate(`/recruitment/${encodeURIComponent(item.record.item.slug)}`);
    } else openDetail(item.record);
  };
  const results = result.data || [];
  const suggestions = state.recentSearches.length
    ? state.recentSearches
    : ["physiology", "cardio", "research"];
  return (
    <div
      className={compact ? "search-panel search-panel-compact" : "search-panel"}
    >
      <Command shouldFilter={false} label={label("search")} loop>
        <CommandInput
          data-search-input
          value={query}
          onValueChange={setQuery}
          placeholder={label(anchored ? "search" : "searchPlaceholder")}
          aria-label={label("search")}
        />
        <div
          className={
            anchored ? "search-results-surface" : "search-results-content"
          }
        >
          {anchored && (
            <div className="search-results-heading" onKeyDown={keepControlKeys}>
              <strong>
                {label(paths.personal ? "personalSearch" : "searchLabel")}
              </strong>
              <button
                type="button"
                className="search-dismiss"
                onClick={closeSearch}
                aria-label={label("close")}
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div className="search-controls" onKeyDown={keepControlKeys}>
            <SelectField
              label={label("searchScope")}
              value={scope}
              onChange={(e) => setScope(e.target.value as "all" | "my")}
            >
              <option value="all">{label("everywhereScope")}</option>
              <option value="my">{label("myLearningScope")}</option>
            </SelectField>
            <SelectField
              label={label("searchType")}
              value={filters.type || ""}
              onChange={(e) => updateFilter("type", e.target.value)}
            >
              <option value="">{label("allContent")}</option>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {label(k === "mentorship-session" ? "mentorshipSession" : k)}
                </option>
              ))}
            </SelectField>
            {!compact && (
              <>
                <SelectField
                  label={label("searchTrack")}
                  value={filters.track || ""}
                  onChange={(e) => updateFilter("track", e.target.value)}
                >
                  <option value="">{label("allTracks")}</option>
                  <option value="basic">{label("basic")}</option>
                  <option value="clinical">{label("clinical")}</option>
                </SelectField>
                <SelectField
                  label={label("searchResourceKind")}
                  value={filters.resourceKind || ""}
                  onChange={(e) => updateFilter("resourceKind", e.target.value)}
                >
                  <option value="">{label("allFormats")}</option>
                  {formats.map((k) => (
                    <option key={k} value={k}>
                      {label(k)}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label={label("course")}
                  value={filters.courseId || ""}
                  onChange={(e) => updateFilter("courseId", e.target.value)}
                >
                  <option value="">{label("allCourses")}</option>
                  {courses.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {t(c.title)}
                    </option>
                  ))}
                </SelectField>
              </>
            )}
            <button
              className="quiet-button"
              onClick={() => {
                setFilters({});
                setQuery("");
              }}
            >
              {label("clearFilters")}
            </button>
          </div>
          {!query && (
            <div className="search-recents" onKeyDown={keepControlKeys}>
              <span>
                <History size={14} />
                {label(
                  state.recentSearches.length
                    ? "recentSearches"
                    : "suggestedSearches",
                )}
              </span>
              <div>
                {suggestions.map((q) => (
                  <button key={q} onClick={() => setQuery(q)}>
                    {q}
                  </button>
                ))}
              </div>
              {!!state.recentSearches.length && (
                <button
                  className="quiet-button"
                  onClick={() => void send({ type: "clear-searches" })}
                >
                  {label("clearHistory")}
                </button>
              )}
            </div>
          )}
          <p className="search-count" role="status" aria-live="polite">
            {pending
              ? label("loading")
              : result.isError
                ? label("searchFailed")
                : `${results.length} ${label("resultsFound")}`}
          </p>
          <CommandList
            aria-label={label("searchResults")}
            className="workspace-search-results"
          >
            {pending ? (
              <div className="search-loading">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : result.isError ? (
              <div className="search-loading" role="alert">
                <p>{label("searchFailed")}</p>
                <Button variant="outline" onClick={result.retry}>
                  {label("retry")}
                </Button>
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <strong>{label("nothingFound")}</strong>
                  <p>{label("searchReset")}</p>
                </CommandEmpty>
                {kinds.map((kind) => {
                  const rows = results.filter((r) => r.record.kind === kind);
                  const Icon = icons[kind];
                  return (
                    rows.length > 0 && (
                      <CommandGroup
                        key={kind}
                        heading={label(
                          kind === "mentorship-session"
                            ? "mentorshipSession"
                            : kind,
                        )}
                      >
                        {rows.map((row) => (
                          <CommandItem
                            key={row.id}
                            value={row.id}
                            onSelect={() => choose(row)}
                          >
                            <span className="search-kind-icon">
                              <Icon size={19} />
                            </span>
                            <div className="search-result-copy">
                              <strong>{t(row.title)}</strong>
                              <small>{t(row.subtitle)}</small>
                              {query && (
                                <span className="search-reason">
                                  {label(
                                    row.matchReason === "title"
                                      ? "matchTitle"
                                      : row.matchReason === "course"
                                        ? "matchCourse"
                                        : "matchKeyword",
                                  )}
                                </span>
                              )}
                            </div>
                            <ArrowUpRight size={17} className="directional" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )
                  );
                })}
              </>
            )}
          </CommandList>
          <div className="search-footer" onKeyDown={keepControlKeys}>
            <span>{label("searchHelp")}</span>
            {compact && (
              <AppLink
                href={`${paths.personal ? "/my/search" : "/search"}?q=${encodeURIComponent(query)}`}
                onClick={closeSearch}
              >
                {label("seeAllResults")} <ArrowUpRight size={14} />
              </AppLink>
            )}
          </div>
        </div>
      </Command>
      {!compact && (
        <p className="workspace-note">{label("searchMetadataNote")}</p>
      )}
    </div>
  );
}

export function SearchPanel(props: {
  compact?: boolean;
  anchored?: boolean;
  initialQuery?: string;
}) {
  return useServices().studentApi ? (
    <LiveSearch {...props} />
  ) : (
    <PreviewSearchPanel {...props} />
  );
}
