import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../../components/navigation/AppLink";
import { Button } from "../../components/ui/button";
import { record, string } from "../../services/api/mapping";
import type { Schemas } from "../../services/api/schema.generated";
import {
  useEngagementConnection,
  useEngagementQuery,
  QueryStatus,
  Panel,
  Pager,
  Empty,
  rows,
} from "./shared";
import { EngagementEditor, EngagementConfirm } from "./Forms";
import { AssetAction } from "./Events";
export function MyVolunteerHours() {
  const { owner, session } = useEngagementConnection();
  return <VolunteerHours key={String(owner) + session} />;
}
export function VolunteerHours({
  admin = false,
  permissions = [],
}: {
  admin?: boolean;
  permissions?: string[];
}) {
  const { api, owner } = useEngagementConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [id, setId] = useState(""),
    [editing, setEditing] = useState<{
      initial: Record<string, unknown>;
      version?: string;
      id?: string;
    } | null>(null),
    [command, setCommand] = useState<
      "submit" | "cancel" | "approve" | "reject" | "correct" | null
    >(null),
    [selected, setSelected] = useState<Record<string, unknown>>({});
  const list = useEngagementQuery(
      "volunteer-list",
      (signal) =>
        admin
          ? api.get_api_v1_admin_volunteer_hours({
              query: { Page: page, PageSize: 20 },
              signal,
            })
          : api.get_api_v1_volunteer_hours_my({
              query: { Page: page, PageSize: 20 },
              signal,
            }),
      [admin, page],
      !admin || permissions.includes("volunteer_hours.view_all"),
      true,
    ),
    detail = useEngagementQuery(
      "volunteer-detail",
      (signal) =>
        api.get_api_v1_volunteer_hours_by_id({ path: { id }, signal }),
      id,
      !!id,
      true,
    ),
    entry = record(detail.data?.entry);
  const can = (p: string) => permissions.includes("volunteer_hours." + p);
  async function execute(body: {
    version?: string;
    reason: string;
    approvedHours?: number;
  }) {
    if (command === "submit")
      return api.post_api_v1_volunteer_hours_by_id_submit({
        path: { id: string(selected.id) },
        body,
      });
    if (command === "cancel")
      return api.post_api_v1_volunteer_hours_by_id_cancel({
        path: { id: string(selected.id) },
        body,
      });
    if (command === "approve")
      return api.post_api_v1_admin_volunteer_hours_by_id_approve({
        path: { id: string(selected.id) },
        body,
      });
    if (command === "reject")
      return api.post_api_v1_admin_volunteer_hours_by_id_reject({
        path: { id: string(selected.id) },
        body,
      });
    return api.post_api_v1_admin_volunteer_hours_by_id_correct({
      path: { id: string(selected.id) },
      body,
    });
  }
  return (
    <div className={admin ? "" : "container engagement-page"}>
      <header>
        <h1 data-page-heading tabIndex={-1}>
          {t({
            en: admin ? "Volunteer hours" : "My volunteer hours",
            ar: admin ? "الساعات التطوعية" : "ساعاتي التطوعية",
          })}
        </h1>
        {!admin && (
          <AppLink href="/my/events">
            {t({ en: "My events", ar: "فعالياتي" })}
          </AppLink>
        )}
      </header>
      {(!admin || can("create_admin")) && (
        <Button
          onClick={() =>
            setEditing({
              initial: {
                hours: 1,
                activityDescription: "",
                serviceDate: "",
                evidenceAssetIds: [],
              },
            })
          }
        >
          {t({
            en: admin ? "Add hours for a student" : "New volunteer draft",
            ar: admin ? "إضافة ساعات لطالب" : "مسودة تطوع جديدة",
          })}
        </Button>
      )}
      {(!admin || can("view_all")) && <QueryStatus query={list} />}
      {list.data && (
        <>
          {rows(list.data.items).map((row) => (
            <button
              className="engagement-record"
              key={string(row.id)}
              onClick={() => setId(string(row.id))}
            >
              <strong>{string(row.activityDescription)}</strong>
              <span>
                {string(row.serviceDate)} · {Number(row.hours)} ·{" "}
                {string(row.status)}
              </span>
              {row.approvedHours != null && (
                <span>
                  {t({ en: "Approved", ar: "المعتمد" })}:{" "}
                  {Number(row.approvedHours)}
                </span>
              )}
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
      {id && (
        <Panel title={t({ en: "Hours record", ar: "سجل الساعات" })}>
          <QueryStatus query={detail} />
          {detail.data && (
            <>
              <h3>{string(entry.activityDescription)}</h3>
              <p>
                {string(entry.serviceDate)} · {Number(entry.hours)} ·{" "}
                {string(entry.status)}
              </p>
              {entry.approvedHours != null && (
                <p>
                  {t({ en: "Approved hours", ar: "الساعات المعتمدة" })}:{" "}
                  {Number(entry.approvedHours)}
                </p>
              )}
              <p>{string(entry.decisionReason)}</p>
              <div className="student-connected-actions">
                {!admin &&
                  entry.userId === owner &&
                  string(entry.status).toLowerCase() === "draft" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setEditing({
                            id,
                            version: string(entry.version),
                            initial: {
                              hours: entry.hours,
                              activityDescription: entry.activityDescription,
                              serviceDate: entry.serviceDate,
                              evidenceAssetIds: detail.data!.evidence,
                            },
                          })
                        }
                      >
                        {t({ en: "Edit draft", ar: "تعديل المسودة" })}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelected(structuredClone(entry));
                          setCommand("submit");
                        }}
                      >
                        {t({ en: "Submit for review", ar: "إرسال للمراجعة" })}
                      </Button>
                    </>
                  )}
                {!admin &&
                  entry.userId === owner &&
                  ["draft", "submitted", "pending"].includes(
                    string(entry.status).toLowerCase(),
                  ) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelected(structuredClone(entry));
                        setCommand("cancel");
                      }}
                    >
                      {t({ en: "Cancel entry", ar: "إلغاء السجل" })}
                    </Button>
                  )}
                {admin &&
                  (["approve", "reject", "correct"] as const)
                    .filter((action) =>
                      can(action === "correct" ? "correct" : "review"),
                    )
                    .map((action) => (
                      <Button
                        key={action}
                        variant="outline"
                        onClick={() => {
                          setSelected(structuredClone(entry));
                          setCommand(action);
                        }}
                      >
                        {t(
                          action === "approve"
                            ? { en: "Approve", ar: "اعتماد" }
                            : action === "reject"
                              ? { en: "Reject", ar: "رفض" }
                              : { en: "Correct hours", ar: "تصحيح الساعات" },
                        )}
                      </Button>
                    ))}
              </div>
              {(detail.data.evidence || []).map((assetId) => (
                <AssetAction key={assetId} assetId={assetId} />
              ))}
              {rows(detail.data.corrections).map((c) => (
                <p key={string(c.id)}>
                  {Number(c.beforeHours)} → {Number(c.afterHours)} ·{" "}
                  {string(c.reason)}
                </p>
              ))}
            </>
          )}
        </Panel>
      )}
      {editing && (
        <EngagementEditor
          title={t({ en: "Volunteer hours", ar: "الساعات التطوعية" })}
          schema={admin ? "AdminVolunteerRequest" : "VolunteerRequest"}
          initial={editing.initial}
          version={editing.version}
          onClose={() => setEditing(null)}
          onSave={(body) =>
            admin
              ? api.post_api_v1_admin_volunteer_hours({
                  body: body as Schemas["AdminVolunteerRequest"],
                })
              : editing.id
                ? api.put_api_v1_volunteer_hours_by_id_draft({
                    path: { id: editing.id },
                    body: body as Schemas["VolunteerRequest"],
                  })
                : api.post_api_v1_volunteer_hours({
                    body: body as Schemas["VolunteerRequest"],
                  })
          }
        />
      )}
      {command && (
        <EngagementConfirm
          title={t({
            en: command + " volunteer hours",
            ar: "إجراء على الساعات التطوعية",
          })}
          version={string(selected.version)}
          requireHours={command === "correct"}
          allowHours={admin && (command === "approve" || command === "correct")}
          onClose={() => setCommand(null)}
          onExecute={execute}
        >
          <p>
            {string(selected.activityDescription)} · {Number(selected.hours)} ·{" "}
            {string(selected.serviceDate)}
          </p>
        </EngagementConfirm>
      )}
    </div>
  );
}
