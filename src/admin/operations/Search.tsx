import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import {
  useOperationsConnection,
  useOperationsQuery,
  useOperationsAction,
  Panel,
  QueryStatus,
} from "./shared";
import { Facts, Table } from "./UI";
import { OperationsEditor } from "./Forms";
import { synonymDraft, type OperationsOperation } from "./model";
import { record, string } from "../../services/api/mapping";
type Edit = {
  operation: OperationsOperation;
  title: string;
  initial?: Record<string, unknown>;
  path?: Record<string, string>;
  description?: string;
};
export function Search({ permissions }: { permissions: string[] }) {
  const { api } = useOperationsConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [abbreviationPage, setAbbreviationPage] = useState(1),
    [date, setDate] = useState(""),
    [edit, setEdit] = useState<Edit | null>(null),
    [jobId, setJobId] = useState(""),
    action = useOperationsAction(),
    synonyms = useOperationsQuery(
      "synonyms",
      (signal) =>
        api.get_api_v1_admin_search_synonyms({ query: { page }, signal }),
      page,
      true,
      true,
    ),
    abbreviations = useOperationsQuery(
      "abbreviations",
      (signal) =>
        api.get_api_v1_admin_search_abbreviations({
          query: { page: abbreviationPage },
          signal,
        }),
      abbreviationPage,
      true,
      true,
    ),
    canAnalytics = permissions.includes("search.analytics.view"),
    top = useOperationsQuery(
      "top-queries",
      (signal) =>
        api.get_api_v1_admin_search_top_queries({
          query: { date: date || undefined },
          signal,
        }),
      date,
      canAnalytics,
      true,
    ),
    zero = useOperationsQuery(
      "zero-results",
      (signal) =>
        api.get_api_v1_admin_search_zero_results({
          query: { date: date || undefined },
          signal,
        }),
      date,
      canAnalytics,
      true,
    ),
    job = useOperationsQuery(
      "reindex-job",
      (signal) =>
        api.get_api_v1_admin_search_reindex_by_id({
          path: { id: jobId },
          signal,
        }),
      jobId,
      !!jobId,
      true,
    );
  return (
    <>
      <Panel title={t({ en: "Search synonyms", ar: "مرادفات البحث" })}>
        {permissions.includes("search.synonyms.manage") && (
          <Button
            onClick={() =>
              setEdit({
                operation: "post_api_v1_admin_search_synonyms",
                title: t({
                  en: "Create synonym group",
                  ar: "إنشاء مجموعة مرادفات",
                }),
                initial: { terms: [], language: "en", scope: "Global" },
              })
            }
          >
            {t({ en: "New synonym group", ar: "مجموعة مرادفات جديدة" })}
          </Button>
        )}
        <QueryStatus query={synonyms} />
        {synonyms.data && (
          <>
            {synonyms.data.map((row) => (
              <article className="operations-card" key={row.group.id}>
                <h3>{row.group.canonicalTerm}</h3>
                <p>{row.terms.join(" · ")}</p>
                <Facts value={row.group} />
                {permissions.includes("search.synonyms.manage") && (
                  <div className="operations-toolbar">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          operation: "put_api_v1_admin_search_synonyms_by_id",
                          title: t({
                            en: "Save synonym group",
                            ar: "حفظ مجموعة المرادفات",
                          }),
                          path: { id: row.group.id },
                          initial: synonymDraft(row),
                        })
                      }
                    >
                      {t({ en: "Edit synonyms", ar: "تعديل المرادفات" })}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={action.busy}
                      onClick={() =>
                        setEdit({
                          operation:
                            "post_api_v1_admin_search_synonyms_by_id_activate",
                          title: t({
                            en: "Activate synonym group",
                            ar: "تفعيل مجموعة المرادفات",
                          }),
                          path: { id: row.group.id },
                          description: row.group.canonicalTerm,
                        })
                      }
                    >
                      {t({ en: "Activate", ar: "تفعيل" })}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={action.busy}
                      onClick={() =>
                        setEdit({
                          operation:
                            "post_api_v1_admin_search_synonyms_by_id_archive",
                          title: t({
                            en: "Archive synonym group",
                            ar: "أرشفة مجموعة المرادفات",
                          }),
                          path: { id: row.group.id },
                          description: row.group.canonicalTerm,
                        })
                      }
                    >
                      {t({ en: "Archive", ar: "أرشفة" })}
                    </Button>
                  </div>
                )}
              </article>
            ))}
            <ArrayPager
              page={page}
              empty={!synonyms.data.length}
              onChange={setPage}
            />
          </>
        )}
      </Panel>
      <Panel title={t({ en: "Abbreviations", ar: "الاختصارات" })}>
        {permissions.includes("search.abbreviations.manage") && (
          <Button
            onClick={() =>
              setEdit({
                operation: "post_api_v1_admin_search_abbreviations",
                title: t({ en: "Create abbreviation", ar: "إنشاء اختصار" }),
                initial: { scope: "Global", status: "Active" },
              })
            }
          >
            {t({ en: "New abbreviation", ar: "اختصار جديد" })}
          </Button>
        )}
        <QueryStatus query={abbreviations} />
        {abbreviations.data && (
          <>
            {abbreviations.data.map((row) => (
              <article className="operations-card" key={row.id}>
                <Facts value={row} />
                {permissions.includes("search.abbreviations.manage") && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setEdit({
                        operation:
                          "put_api_v1_admin_search_abbreviations_by_id",
                        title: t({
                          en: "Save abbreviation",
                          ar: "حفظ الاختصار",
                        }),
                        path: { id: row.id },
                        initial: row,
                      })
                    }
                  >
                    {t({ en: "Edit abbreviation", ar: "تعديل الاختصار" })}
                  </Button>
                )}
              </article>
            ))}
            <ArrayPager
              page={abbreviationPage}
              empty={!abbreviations.data.length}
              onChange={setAbbreviationPage}
            />
          </>
        )}
      </Panel>
      {canAnalytics && (
        <Panel title={t({ en: "Search queries", ar: "استعلامات البحث" })}>
          <label>
            {t({ en: "Query date", ar: "تاريخ الاستعلام" })}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          {[
            {
              q: top,
              title: t({ en: "Top queries", ar: "الاستعلامات الأبرز" }),
            },
            {
              q: zero,
              title: t({ en: "No-result queries", ar: "استعلامات بلا نتائج" }),
            },
          ].map(({ q, title }) => (
            <section key={title}>
              <h3>{title}</h3>
              <QueryStatus query={q} />
              {q.data && (
                <>
                  <Table value={q.data} />
                  <div className="operations-toolbar">
                    {q.data
                      .filter((v) => v.query != null && v.query.trim())
                      .map((row) => (
                        <Button
                          key={row.query}
                          variant="outline"
                          onClick={() =>
                            setEdit({
                              operation:
                                "post_api_v1_admin_search_query_approvals",
                              title: t({
                                en: "Save query approval",
                                ar: "حفظ اعتماد الاستعلام",
                              }),
                              initial: { query: row.query, approved: false },
                              description: t({
                                en: "Choose the desired approval state. Analytics does not return the current approval state.",
                                ar: "اختر حالة الاعتماد المطلوبة. لا تعرض التحليلات حالة الاعتماد الحالية.",
                              }),
                            })
                          }
                        >
                          {t({ en: "Review query", ar: "مراجعة الاستعلام" })}:{" "}
                          {row.query}
                        </Button>
                      ))}
                  </div>
                </>
              )}
            </section>
          ))}
        </Panel>
      )}
      <Panel title={t({ en: "Search index jobs", ar: "مهام فهرس البحث" })}>
        <p>
          {t({
            en: "A queued request is not a completed reindex. Use the job status and counts to follow progress.",
            ar: "الطلب المدرج بالطابور لا يعني اكتمال إعادة الفهرسة. تابع الحالة والأعداد لمعرفة التقدم.",
          })}
        </p>
        <Button
          onClick={() =>
            setEdit({
              operation: "post_api_v1_admin_search_reindex",
              title: t({ en: "Request reindex", ar: "طلب إعادة الفهرسة" }),
              initial: { scopeType: "" },
            })
          }
        >
          {t({ en: "Review reindex scope", ar: "مراجعة نطاق إعادة الفهرسة" })}
        </Button>
        <label>
          {t({ en: "Reindex job ID", ar: "معرّف مهمة الفهرسة" })}
          <input value={jobId} onChange={(e) => setJobId(e.target.value)} />
        </label>
        {jobId && (
          <>
            <QueryStatus query={job} />
            {job.data ? (
              <Facts value={job.data} />
            ) : (
              !job.isPending &&
              !job.isError && (
                <p>{t({ en: "Job not found", ar: "المهمة غير موجودة" })}</p>
              )
            )}
            <Button variant="outline" onClick={() => void job.refetch()}>
              {t({ en: "Refresh job status", ar: "تحديث حالة المهمة" })}
            </Button>
            {job.data && (
              <Button
                variant="outline"
                onClick={() =>
                  setEdit({
                    operation: "post_api_v1_admin_search_reindex_by_id_resume",
                    title: t({
                      en: "Resume reindex job",
                      ar: "استئناف مهمة الفهرسة",
                    }),
                    path: { id: jobId },
                    description: jobId,
                  })
                }
              >
                {t({ en: "Review resume", ar: "مراجعة الاستئناف" })}
              </Button>
            )}
          </>
        )}
      </Panel>
      {edit && (
        <OperationsEditor
          {...edit}
          requireFields={
            edit.operation === "post_api_v1_admin_search_reindex"
              ? ["scopeType"]
              : []
          }
          onSaved={(value) => {
            if (edit.operation === "post_api_v1_admin_search_reindex")
              setJobId(string(record(value).id));
          }}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
function ArrayPager({
  page,
  empty,
  onChange,
}: {
  page: number;
  empty: boolean;
  onChange: (p: number) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="operations-toolbar">
      <Button
        variant="outline"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        {t({ en: "Previous", ar: "السابق" })}
      </Button>
      <span>{page}</span>
      <Button
        variant="outline"
        disabled={empty}
        onClick={() => onChange(page + 1)}
      >
        {t({ en: "Next", ar: "التالي" })}
      </Button>
    </div>
  );
}
