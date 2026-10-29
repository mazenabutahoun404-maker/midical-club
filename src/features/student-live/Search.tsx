import { LockKeyhole, X } from "lucide-react";
import { needsSignIn } from "../../lib/access-policy";
import { ContentPlaceholder } from "../../components/feedback/ContentPlaceholder";
import { useWorkspacePaths } from "../../hooks/useWorkspacePaths";
import { useCourses, useBatches } from "../../hooks/useContent";
import {
  emptySearchFilters,
  contentSearchFilters,
  fileSearchFilters,
  type SearchFilters,
} from "./search-filters";
import { useEffect, useState, useId } from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useOverlays } from "../../app/providers/OverlayProvider";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { ApiError } from "../../services/api/client";
import { record, string, number } from "../../services/api/mapping";
import {
  canonicalPath,
  Empty,
  Pager,
  Panel,
  QueryStatus,
  rows,
  useStudentAction,
  useStudentConnection,
  useStudentQuery,
} from "./shared";

export default function LiveSearch({
  initialQuery = "",
  compact = false,
  anchored = false,
}: {
  initialQuery?: string;
  compact?: boolean;
  anchored?: boolean;
}) {
  const { owner } = useStudentConnection();
  return (
    <SearchSession
      key={owner || "guest"}
      initialQuery={initialQuery}
      compact={compact}
      anchored={anchored}
    />
  );
}
function SearchSession({
  initialQuery,
  compact,
  anchored,
}: {
  initialQuery: string;
  compact: boolean;
  anchored: boolean;
}) {
  const { api, services, authenticated } = useStudentConnection(),
    { t, locale } = useLocale(),
    { closeSearch } = useOverlays(),
    navigate = useNavigate();
  const paths = useWorkspacePaths(),
    typeListId = useId();
  const [query, setQuery] = useState(initialQuery),
    [page, setPage] = useState(1),
    [mode, setMode] = useState<"all" | "files">("all"),
    [type, setType] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    ...emptySearchFilters,
  });
  const courses = useCourses(),
    batches = useBatches();
  const q = useDebouncedValue(query),
    action = useStudentAction();
  const result = useStudentQuery<unknown>(
    "search",
    (signal) =>
      mode === "files"
        ? api.get_api_v1_search_files({
            query: {
              ...fileSearchFilters(filters),
              Q: q,
              Page: page,
              PageSize: 20,
            },
            signal,
          })
        : api.get_api_v1_search({
            query: {
              ...contentSearchFilters(filters),
              Q: q,
              ResourceType: type || undefined,
              Page: page,
              PageSize: 20,
            },
            signal,
          }),
    [q, page, mode, type, filters],
    q.trim().length > 0,
  );
  const suggestions = useStudentQuery(
    "suggestions",
    (signal) =>
      api.get_api_v1_search_suggestions({
        query: { Q: q, ResourceType: type || undefined, Page: 1, PageSize: 5 },
        signal,
      }),
    [q, type],
    q.trim().length >= 2 &&
      mode === "all" &&
      !Object.values(filters).some(Boolean),
  );
  const collections = useStudentQuery(
    "collections",
    (signal) => api.get_api_v1_library_collections({ signal }),
    "",
    authenticated,
  );
  const [collection, setCollection] = useState(""),
    [explanation, setExplanation] = useState<{
      id: string;
      type: string;
    } | null>(null),
    [linkError, setLinkError] = useState<unknown>(null);
  const explain = useStudentQuery(
    "search-explain",
    (signal) =>
      api.get_api_v1_search_resources_by_type_by_id_explain({
        path: { id: explanation!.id, type: explanation!.type },
        signal,
      }),
    explanation,
    !!explanation,
  );
  const envelope = record(result.data),
    results = rows(
      Array.isArray(result.data)
        ? result.data
        : envelope.results || envelope.items,
    );
  const suggest = rows(
    Array.isArray(suggestions.data)
      ? suggestions.data
      : record(suggestions.data).results,
  ).slice(0, 5);
  useEffect(() => {
    setPage(1);
    setExplanation(null);
  }, [q, mode, type, filters]);
  const [busyId, setBusyId] = useState("");
  const [filePreview, setFilePreview] = useState<{
    id: string;
    url: string;
  } | null>(null);
  async function open(row: Record<string, unknown>) {
    const path = canonicalPath(row.canonicalPath);
    if (!path) {
      setLinkError(
        new ApiError(
          "This result has no safe application link.",
          422,
          "INVALID_LINK",
        ),
      );
      return;
    }
    if (
      !authenticated &&
      needsSignIn(path, services.contentSnapshot?.kind === "live")
    )
      return;
    if (string(envelope.queryLogId) && string(row.resourceId)) {
      try {
        await api.post_api_v1_search_interactions_click({
          body: {
            queryLogId: string(envelope.queryLogId),
            resourceType: string(row.resourceType),
            resourceId: string(row.resourceId),
          },
        });
      } catch {
        /* Navigation must still work if optional click logging fails. */
      }
    }
    closeSearch();
    navigate(path);
  }
  const searchInput = (
    <input
      data-search-input
      data-slot="command-input"
      aria-label={t({ en: "Search", ar: "بحث" })}
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={t({
        en: "Course, topic, or material",
        ar: "مساق أو موضوع أو مادة",
      })}
    />
  );
  return (
    <div
      className={
        anchored
          ? "search-panel live-search-panel"
          : compact
            ? "student-connected"
            : "container student-connected"
      }
    >
      {anchored && <div data-slot="command-input-wrapper">{searchInput}</div>}
      <div
        className={anchored ? "search-results-surface student-connected" : ""}
      >
        {anchored && (
          <div className="search-results-heading">
            <strong>{t({ en: "Search MedClub", ar: "ابحث في ميدكلب" })}</strong>
            <button
              type="button"
              className="search-dismiss"
              aria-label={t({ en: "Close search", ar: "إغلاق البحث" })}
              onClick={closeSearch}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <Panel
          title={t({
            en: "Find your next resource",
            ar: "اعثر على مصدرك التالي",
          })}
        >
          {!anchored && (
            <label>
              {t({ en: "Search", ar: "بحث" })}
              {searchInput}
            </label>
          )}
          <div className="student-connected-tabs">
            <Button
              variant="outline"
              aria-pressed={mode === "all"}
              onClick={() => {
                setMode("all");
                setFilters({
                  ...emptySearchFilters,
                  subject: filters.subject,
                  batch: filters.batch,
                  semester: filters.semester,
                  fileType: filters.fileType,
                });
                setPage(1);
                setFilePreview(null);
              }}
            >
              {t({ en: "All content", ar: "كل المحتوى" })}
            </Button>
            <Button
              variant="outline"
              aria-pressed={mode === "files"}
              onClick={() => {
                setMode("files");
                setFilters({
                  ...emptySearchFilters,
                  subject: filters.subject,
                  batch: filters.batch,
                  semester: filters.semester,
                  fileType: filters.fileType,
                });
                setPage(1);
                setFilePreview(null);
              }}
            >
              {t({ en: "Inside files", ar: "داخل الملفات" })}
            </Button>
          </div>
          {!authenticated && (
            <p className="muted">
              {t({
                en: "Sign in to save resources to your library.",
                ar: "سجّل الدخول لحفظ المصادر في مكتبتك.",
              })}
            </p>
          )}
          <details className="content-editor-item">
            <summary>
              {t({ en: "Filter results", ar: "تصفية النتائج" })}
              {Object.values(filters).some(Boolean)
                ? " · " + Object.values(filters).filter(Boolean).length
                : ""}
            </summary>
            {mode === "all" && (
              <label>
                {t({
                  en: "Content type (optional)",
                  ar: "نوع المحتوى (اختياري)",
                })}
                <input
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  list={typeListId}
                />
                <datalist id={typeListId}>
                  {[
                    ...new Set(
                      [...results, ...suggest]
                        .map((r) => string(r.resourceType))
                        .filter(Boolean),
                    ),
                  ].map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </label>
            )}
            <div className="student-connected-grid">
              {(
                [
                  [
                    "subject",
                    t({ en: "Subject", ar: "المادة" }),
                    [
                      ...new Map(
                        (courses.data || [])
                          .filter((c) => c.subjectId)
                          .map((c) => [
                            c.subjectId!,
                            [c.subjectId!, t(c.title)],
                          ]),
                      ).values(),
                    ],
                  ],
                  ...(mode === "all"
                    ? [
                        [
                          "offering",
                          t({ en: "Course offering", ar: "المساق المطروح" }),
                          (courses.data || []).map((c) => [
                            c.offeringId || c.id,
                            t(c.title) + " · " + t(c.batch),
                          ]),
                        ],
                        [
                          "academicYear",
                          t({ en: "Academic year", ar: "السنة الأكاديمية" }),
                          [
                            ...new Map(
                              (courses.data || [])
                                .filter(
                                  (c) => c.academicYearId && c.academicYearName,
                                )
                                .map((c) => [
                                  c.academicYearId!,
                                  [c.academicYearId!, c.academicYearName!],
                                ]),
                            ).values(),
                          ],
                        ],
                      ]
                    : []),
                  [
                    "batch",
                    t({ en: "Batch", ar: "الدفعة" }),
                    (batches.data || []).map((b) => [b.id, t(b.name)]),
                  ],
                  [
                    "semester",
                    t({ en: "Semester", ar: "الفصل" }),
                    [
                      ...new Map(
                        (courses.data || [])
                          .filter((c) => c.semesterId)
                          .map((c) => [
                            c.semesterId!,
                            [
                              c.semesterId!,
                              [
                                c.academicYearName,
                                t(c.batch),
                                t({
                                  en: `Semester ${c.semester}`,
                                  ar: `الفصل ${c.semester}`,
                                }),
                              ]
                                .filter(Boolean)
                                .join(" · "),
                            ],
                          ]),
                      ).values(),
                    ],
                  ],
                  [
                    "fileType",
                    t({ en: "File type", ar: "نوع الملف" }),
                    [
                      "Pdf",
                      "Word",
                      "PowerPoint",
                      "Spreadsheet",
                      "Image",
                      "Archive",
                      "Audio",
                      "Video",
                      "Text",
                    ].map((v) => [v, v]),
                  ],
                  ...(mode === "files"
                    ? [
                        [
                          "studyYear",
                          t({ en: "Study year", ar: "السنة الدراسية" }),
                          [1, 2, 3, 4, 5, 6].map((v) => [String(v), String(v)]),
                        ],
                      ]
                    : [
                        [
                          "language",
                          t({ en: "Language", ar: "اللغة" }),
                          [
                            ["en", "English"],
                            ["ar", "العربية"],
                          ],
                        ],
                      ]),
                ] as [keyof SearchFilters, string, string[][]][]
              ).map(([key, label, options]) => (
                <label key={key}>
                  {label}
                  <select
                    value={filters[key]}
                    onChange={(e) => {
                      setFilters({ ...filters, [key]: e.target.value });
                      setPage(1);
                      setFilePreview(null);
                    }}
                  >
                    <option value="">{t({ en: "Any", ar: "الكل" })}</option>
                    {options.map(([value, text]) => (
                      <option key={value} value={value}>
                        {text}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({ ...emptySearchFilters });
                setType("");
                setPage(1);
              }}
            >
              {t({ en: "Clear filters", ar: "مسح الفلاتر" })}
            </Button>
            {mode === "files" && (
              <p>
                {t({
                  en: "File search supports study year. Language and academic-year filters require backend support.",
                  ar: "يدعم البحث داخل الملفات السنة الدراسية. تصفية اللغة والسنة الأكاديمية تتطلب دعماً من الخادم.",
                })}
              </p>
            )}
          </details>
          {!!suggest.length && (
            <div
              className="student-connected-actions"
              aria-label={t({ en: "Suggestions", ar: "اقتراحات" })}
            >
              {suggest.map((row, index) => (
                <Button
                  variant="outline"
                  key={index}
                  onClick={() => {
                    setQuery(string(row.title));
                  }}
                >
                  {string(row.title)}
                </Button>
              ))}
            </div>
          )}
          {authenticated && (
            <label>
              {t({ en: "Save to collection", ar: "الحفظ في مجموعة" })}
              <select
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
              >
                <option value="">
                  {t({ en: "Choose a collection", ar: "اختر مجموعة" })}
                </option>
                {rows(collections.data).map((c) => (
                  <option key={string(c.id)} value={string(c.id)}>
                    {string(c.name)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <ApiActionError error={collections.error || linkError} />
          {!q.trim() && (
            <ContentPlaceholder
              compact
              icon="search"
              title={t({ en: "What would you like to find?", ar: "عمّ تبحث؟" })}
              description={t({
                en: "Search by course, topic or resource name.",
                ar: "ابحث باسم المساق أو الموضوع أو المصدر.",
              })}
            />
          )}
          {q.trim() && (
            <>
              <QueryStatus query={result} />
              {!result.isPending && !result.error && <Empty items={results} />}
            </>
          )}
          {results.map((row, index) =>
            mode === "files" ? (
              <div key={index} className="student-connected-row">
                <div>
                  <strong>
                    {string(row.displayName || row.originalFileName)}
                  </strong>
                  <small>
                    {row.pageNumber != null
                      ? t({
                          en: `Page ${row.pageNumber}`,
                          ar: `صفحة ${row.pageNumber}`,
                        })
                      : ""}
                  </small>
                  <p>{string(row.snippet)}</p>
                </div>
                <Button
                  variant="outline"
                  disabled={!!busyId}
                  onClick={async () => {
                    setBusyId(string(row.assetId));
                    setLinkError(null);
                    try {
                      const signed = await services.files!.previewUrl(
                        string(row.assetId),
                      );
                      setFilePreview({
                        id: string(row.assetId),
                        url: signed.url,
                      });
                    } catch (e) {
                      setLinkError(e);
                    } finally {
                      setBusyId("");
                    }
                  }}
                >
                  {t({ en: "Prepare preview", ar: "تجهيز المعاينة" })}
                </Button>
                {filePreview && filePreview.id === row.assetId && (
                  <a
                    href={filePreview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t({ en: "Open file", ar: "فتح الملف" })}
                  </a>
                )}
              </div>
            ) : (
              <div
                key={string(row.resourceId) || index}
                className="student-connected-row"
              >
                <div>
                  <strong>{string(row.title)}</strong>
                  <small>{string(row.resourceType)}</small>
                  <p>{string(row.snippet)}</p>
                </div>
                <div className="student-connected-actions">
                  {canonicalPath(row.canonicalPath) && (
                    <Button
                      variant="outline"
                      disabled={
                        !authenticated &&
                        needsSignIn(
                          canonicalPath(row.canonicalPath) || "",
                          services.contentSnapshot?.kind === "live",
                        )
                      }
                      onClick={() => void open(row)}
                    >
                      {!authenticated &&
                      needsSignIn(
                        canonicalPath(row.canonicalPath) || "",
                        services.contentSnapshot?.kind === "live",
                      ) ? (
                        <>
                          <LockKeyhole size={14} />
                          {t({
                            en: "Sign in required",
                            ar: "يتطلب تسجيل الدخول",
                          })}
                        </>
                      ) : (
                        t({ en: "Open", ar: "فتح" })
                      )}
                    </Button>
                  )}
                  {string(row.resourceId) && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setExplanation({
                          id: string(row.resourceId),
                          type: string(row.resourceType),
                        })
                      }
                    >
                      {t({ en: "Why this result?", ar: "لماذا هذه النتيجة؟" })}
                    </Button>
                  )}
                  {authenticated && string(row.resourceId) && (
                    <>
                      <Button
                        variant="outline"
                        disabled={!collection || action.busy}
                        onClick={() =>
                          void action.run(() =>
                            api.post_api_v1_library_collections_by_id_items({
                              path: { id: collection },
                              body: {
                                itemId: string(row.resourceId),
                                itemType: string(row.resourceType),
                              },
                            }),
                          )
                        }
                      >
                        {t({ en: "Save", ar: "حفظ" })}
                      </Button>
                      <Button
                        variant="outline"
                        disabled={action.busy}
                        onClick={() =>
                          void action.run(() =>
                            api.post_api_v1_student_recent_items_by_itemType_by_itemId_opened(
                              {
                                path: {
                                  itemType: string(row.resourceType),
                                  itemId: string(row.resourceId),
                                },
                              },
                            ),
                          )
                        }
                      >
                        {t({ en: "Add to recent", ar: "إضافة إلى الأخيرة" })}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ),
          )}
          {explanation && (
            <aside>
              <QueryStatus query={explain} />
              <p>
                {Array.isArray(record(explain.data).matchReasons)
                  ? (record(explain.data).matchReasons as string[]).join(" · ")
                  : ""}
              </p>
              <Button variant="outline" onClick={() => setExplanation(null)}>
                {t({ en: "Close explanation", ar: "إغلاق التوضيح" })}
              </Button>
            </aside>
          )}
          {q.trim() && (
            <Pager
              page={page}
              total={number(envelope.total, results.length)}
              onChange={setPage}
            />
          )}
          {action.feedback}
          {authenticated && (
            <AppLink href="/my/library">
              {t({ en: "Manage collections", ar: "إدارة المجموعات" })}
            </AppLink>
          )}
        </Panel>
        {anchored && (
          <div className="search-footer">
            <AppLink
              href={
                (paths.personal ? "/my/search" : "/search") +
                "?q=" +
                encodeURIComponent(query)
              }
              onClick={closeSearch}
            >
              {t({ en: "See all results", ar: "عرض كل النتائج" })}
            </AppLink>
          </div>
        )}
      </div>
    </div>
  );
}
