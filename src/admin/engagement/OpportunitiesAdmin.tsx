import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { record, string } from "../../services/api/mapping";
import type { Schemas } from "../../services/api/schema.generated";
import {
  useEngagementConnection,
  useEngagementQuery,
  useEngagementAction,
  QueryStatus,
  Panel,
  Pager,
  Empty,
  rows,
} from "../../features/engagement/shared";
import {
  localizedField,
  opportunityDraft,
} from "../../features/engagement/model";
import {
  EngagementEditor,
  EngagementConfirm,
} from "../../features/engagement/Forms";
export function OpportunitiesAdmin({ permissions }: { permissions: string[] }) {
  const { api } = useEngagementConnection(),
    { t, locale } = useLocale(),
    [page, setPage] = useState(1),
    [id, setId] = useState(""),
    [editing, setEditing] = useState<{
      initial: Record<string, unknown>;
      version?: string;
      id?: string;
    } | null>(null),
    [command, setCommand] = useState<{
      kind: "publish" | "close" | "archive";
      version: string;
    } | null>(null),
    action = useEngagementAction(),
    can = (p: string) => permissions.includes("opportunities." + p);
  const list = useEngagementQuery(
      "admin-opportunities",
      (signal) =>
        api.get_api_v1_admin_opportunities({
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      page,
      can("view_admin"),
      true,
    ),
    detail = useEngagementQuery(
      "admin-opportunity",
      (signal) =>
        api.get_api_v1_admin_opportunities_by_id({ path: { id }, signal }),
      id,
      !!id && can("view_admin"),
      true,
    ),
    v = record(detail.data);
  return (
    <>
      <Panel title={t({ en: "Opportunities", ar: "الفرص" })}>
        {can("create") && (
          <Button
            onClick={() =>
              setEditing({
                initial: {
                  titleAr: "",
                  sourceUrl: "",
                  type: "",
                  timezoneId: "Asia/Amman",
                  isFeatured: false,
                  audiences: [],
                  eligibleStudyYears: [],
                  presentation: null,
                },
              })
            }
          >
            {t({ en: "New opportunity draft", ar: "مسودة فرصة جديدة" })}
          </Button>
        )}
        <QueryStatus query={list} />
        {list.data && (
          <>
            {rows(list.data.items).map((item) => (
              <button
                className="engagement-record"
                key={string(item.id)}
                onClick={() => setId(string(item.id))}
              >
                <strong>{localizedField(item, "title", locale)}</strong>
                <span>{string(item.status)}</span>
              </button>
            ))}
            <Empty items={rows(list.data.items)} />
            <Pager
              page={page}
              total={Number(list.data.totalItems)}
              onChange={setPage}
            />
          </>
        )}
      </Panel>
      {id && (
        <Panel
          title={
            localizedField(v, "title", locale) ||
            t({ en: "Opportunity", ar: "الفرصة" })
          }
        >
          <QueryStatus query={detail} />
          {detail.data && (
            <>
              <p>
                {string(v.status)} · {string(v.deadlineAt)}
              </p>
              <p>{localizedField(v, "summary", locale)}</p>
              <div className="student-connected-actions">
                {can("update") && (
                  <Button
                    onClick={() =>
                      void action.run(
                        async () => opportunityDraft(v),
                        (initial) =>
                          setEditing({
                            id,
                            initial,
                            version: string(v.version),
                          }),
                        "",
                        false,
                      )
                    }
                  >
                    {t({ en: "Edit draft", ar: "تعديل المسودة" })}
                  </Button>
                )}
                {(["publish", "close", "archive"] as const)
                  .filter(can)
                  .map((kind) => (
                    <Button
                      key={kind}
                      variant="outline"
                      onClick={() =>
                        setCommand({ kind, version: string(v.version) })
                      }
                    >
                      {t(
                        kind === "publish"
                          ? { en: "Publish", ar: "نشر" }
                          : kind === "close"
                            ? { en: "Close opportunity", ar: "إغلاق الفرصة" }
                            : { en: "Archive", ar: "أرشفة" },
                      )}
                    </Button>
                  ))}
              </div>
              {action.feedback}
            </>
          )}
        </Panel>
      )}
      {editing && (
        <EngagementEditor
          title={t({ en: "Opportunity draft", ar: "مسودة الفرصة" })}
          schema="OpportunityRequest"
          initial={editing.initial}
          version={editing.version}
          description={t({
            en: "Saving is separate from publishing. Review the complete audience.",
            ar: "الحفظ منفصل عن النشر. راجع الجمهور الكامل.",
          })}
          onClose={() => setEditing(null)}
          onSave={(body) =>
            editing.id
              ? api.put_api_v1_admin_opportunities_by_id({
                  path: { id: editing.id },
                  body: body as Schemas["OpportunityRequest"],
                })
              : api.post_api_v1_admin_opportunities({
                  body: body as Schemas["OpportunityRequest"],
                })
          }
        />
      )}
      {command && (
        <EngagementConfirm
          title={t({
            en: command.kind + " opportunity",
            ar: "إجراء على الفرصة",
          })}
          version={command.version}
          onClose={() => setCommand(null)}
          onExecute={(body) =>
            command.kind === "publish"
              ? api.post_api_v1_admin_opportunities_by_id_publish({
                  path: { id },
                  body,
                })
              : command.kind === "close"
                ? api.post_api_v1_admin_opportunities_by_id_close({
                    path: { id },
                    body,
                  })
                : api.post_api_v1_admin_opportunities_by_id_archive({
                    path: { id },
                    body,
                  })
          }
        >
          <p>
            {localizedField(v, "title", locale)} · {id}
          </p>
        </EngagementConfirm>
      )}
    </>
  );
}
