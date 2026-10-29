import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { AppLink } from "../../components/navigation/AppLink";
import { RecruitmentNavigation } from "../../components/navigation/RecruitmentNavigation";
import {
  useMembershipConnection,
  useMembershipQuery,
  Panel,
  QueryStatus,
  Pager,
  Empty,
} from "./shared";
import {
  Facts,
  Table,
  Localized,
  SectionHeading,
  EditDialog,
  type Edit,
} from "./UI";
import { bodyDraft, taskAction } from "./model";
import "../../styles/membership-connect.css";
const hiddenAction = [
  "revisionId",
  "reviewerId",
  "status",
  "feedback",
  "internalNotes",
];
export function Members({ mine = false }: { mine?: boolean }) {
  const { api, owner } = useMembershipConnection(),
    { t } = useLocale(),
    [params] = useSearchParams(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [id, setId] = useState(params.get("member") || ""),
    q = useMembershipQuery(
      mine ? "my-members" : "public-members",
      (signal) =>
        mine
          ? api.get_api_v1_member_profiles_my({
              query: { Page: page, PageSize: 20, Search: search || undefined },
              signal,
            })
          : api.get_api_v1_member_profiles({
              query: { Page: page, PageSize: 20, Search: search || undefined },
              signal,
            }),
      [mine, page, search],
      !mine || !!owner,
      mine,
    );
  return (
    <div className="container membership-connected recruitment-v9">
      <RecruitmentNavigation />
      <SectionHeading
        title={t(
          mine
            ? { en: "My team memberships", ar: "عضوياتي في الفرق" }
            : { en: "Club members", ar: "أعضاء النادي" },
        )}
        body={
          !mine
            ? t({
                en: "Active profiles whose owners consented to public display.",
                ar: "ملفات نشطة وافق أصحابها على عرضها للعامة.",
              })
            : undefined
        }
      />
      <label>
        {t({ en: "Search members", ar: "البحث عن الأعضاء" })}
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </label>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <div className="membership-grid">
            {q.data.items.map((row) => (
              <article key={row.id} className="membership-card">
                <h3>{row.displayNameSnapshot}</h3>
                <p>
                  <Localized row={row} field="bio" />
                </p>
                <Facts value={{ status: row.status, joinedAt: row.joinedAt }} />
                <Button variant="outline" onClick={() => setId(row.id)}>
                  {t({ en: "Open member profile", ar: "فتح ملف العضو" })}
                </Button>
              </article>
            ))}
          </div>
          <Empty items={q.data.items} />
          <Pager page={page} total={q.data.totalItems} onChange={setPage} />
        </>
      )}
      {id && <MemberDetails key={id} id={id} mode={mine ? "mine" : "public"} />}
    </div>
  );
}
export function MemberDetails({
  id,
  mode = "public",
  permissions = [],
}: {
  id: string;
  mode?: "public" | "mine" | "admin";
  permissions?: string[];
}) {
  const { api } = useMembershipConnection(),
    { t } = useLocale(),
    [edit, setEdit] = useState<Edit | null>(null),
    q = useMembershipQuery(
      "member-detail",
      (signal) =>
        mode === "admin"
          ? api.get_api_v1_admin_member_profiles_by_id({ path: { id }, signal })
          : mode === "mine"
            ? api.get_api_v1_member_profiles_my_by_id({ path: { id }, signal })
            : api.get_api_v1_member_profiles_by_id({ path: { id }, signal }),
      [id, mode],
      true,
      mode !== "public",
    );
  return (
    <Panel title={t({ en: "Membership profile", ar: "ملف العضوية" })}>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <h3>{q.data.displayNameSnapshot}</h3>
          <p>
            <Localized row={q.data} field="bio" />
          </p>
          <Facts
            value={{
              status: q.data.status,
              joinedAt: q.data.joinedAt,
              publicVisibility: q.data.publicVisibility,
            }}
          />
          <h3>{t({ en: "Positions", ar: "المناصب" })}</h3>
          <Table value={q.data.positions} />
          {mode === "mine" && (
            <Button
              variant="outline"
              onClick={() =>
                setEdit({
                  operation: "put_api_v1_member_profiles_my_public_visibility",
                  title: t({
                    en: "Save public visibility consent",
                    ar: "حفظ موافقة العرض العام",
                  }),
                  initial: {
                    memberProfileId: id,
                    version: q.data.version,
                    publicVisibility: false,
                    consent: false,
                  },
                  hiddenFields: ["memberProfileId"],
                  description: t({
                    en: "To make this profile public, explicitly enable visibility and consent. Leave visibility off to remove public display.",
                    ar: "لإظهار الملف للعامة، فعّل العرض والموافقة صراحة. أبقِ العرض معطلاً لإيقاف الظهور العام.",
                  }),
                })
              }
            >
              {t({ en: "Review public visibility", ar: "مراجعة العرض العام" })}
            </Button>
          )}
          {mode === "admin" && (
            <div className="membership-actions">
              {permissions.includes("member_profiles.manage") && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setEdit({
                      operation: "put_api_v1_admin_member_profiles_by_id",
                      title: t({
                        en: "Save member profile",
                        ar: "حفظ ملف العضو",
                      }),
                      path: { id },
                      initial: bodyDraft(
                        "put_api_v1_admin_member_profiles_by_id",
                        q.data,
                      ),
                    })
                  }
                >
                  {t({ en: "Edit member profile", ar: "تعديل ملف العضو" })}
                </Button>
              )}
              {permissions.includes("member_profiles.positions.manage") && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setEdit({
                      operation:
                        "post_api_v1_admin_member_profiles_by_id_positions",
                      title: t({
                        en: "Add member position",
                        ar: "إضافة منصب للعضو",
                      }),
                      path: { id },
                      initial: { displayOrder: 0 },
                    })
                  }
                >
                  {t({ en: "Add position", ar: "إضافة منصب" })}
                </Button>
              )}
              {permissions.includes("recruitment.onboarding.manage") && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setEdit({
                      operation:
                        "post_api_v1_admin_member_profiles_by_id_activate",
                      title: t({
                        en: "Activate membership profile",
                        ar: "تفعيل ملف العضوية",
                      }),
                      path: { id },
                      initial: { version: q.data.version },
                      hiddenFields: hiddenAction,
                      description: t({
                        en: "Activation is checked against onboarding requirements. This does not grant system roles or permissions.",
                        ar: "تخضع عملية التفعيل لمتطلبات التهيئة. لا يمنح هذا الإجراء أدواراً أو صلاحيات في النظام.",
                      }),
                    })
                  }
                >
                  {t({ en: "Review activation", ar: "مراجعة التفعيل" })}
                </Button>
              )}
            </div>
          )}
          {mode !== "public" && (
            <>
              <h3>{t({ en: "Onboarding tasks", ar: "مهام التهيئة" })}</h3>
              {q.data.tasks === null ? (
                <p>
                  {t({
                    en: "Task details unavailable",
                    ar: "تفاصيل المهام غير متاحة",
                  })}
                </p>
              ) : (
                q.data.tasks.map((task) => (
                  <article className="membership-card" key={task.id}>
                    <h4>{task.titleSnapshot}</h4>
                    <p>{task.descriptionSnapshot}</p>
                    <Facts
                      value={{
                        status: task.status,
                        isRequired: task.isRequired,
                        completedAt: task.completedAt,
                        waiverReason: task.waiverReason,
                      }}
                    />
                    {mode === "admin" &&
                      permissions.includes("recruitment.onboarding.manage") && (
                        <div className="membership-actions">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setEdit({
                                operation:
                                  "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_complete",
                                title: t({
                                  en: "Verify onboarding task completion",
                                  ar: "التحقق من إكمال مهمة التهيئة",
                                }),
                                path: { id, taskId: task.id },
                                initial: taskAction(task),
                                hiddenFields: hiddenAction,
                              })
                            }
                          >
                            {t({
                              en: "Verify completion",
                              ar: "التحقق من الإكمال",
                            })}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              setEdit({
                                operation:
                                  "post_api_v1_admin_member_profiles_by_id_onboarding_by_taskId_waive",
                                title: t({
                                  en: "Waive onboarding task",
                                  ar: "الإعفاء من مهمة التهيئة",
                                }),
                                path: { id, taskId: task.id },
                                initial: taskAction(task),
                                requireFields: ["reason"],
                                hiddenFields: hiddenAction,
                              })
                            }
                          >
                            {t({ en: "Review waiver", ar: "مراجعة الإعفاء" })}
                          </Button>
                        </div>
                      )}
                  </article>
                ))
              )}
            </>
          )}
        </>
      )}
      {edit && <EditDialog edit={edit} onClose={() => setEdit(null)} />}
    </Panel>
  );
}
export function EngagementWorkspace() {
  const { api, owner } = useMembershipConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    dashboard = useMembershipQuery(
      "engagement-dashboard",
      (signal) => api.get_api_v1_engagement_dashboard({ signal }),
      "",
      !!owner,
      true,
    ),
    results = useMembershipQuery(
      "engagement-search",
      (signal) =>
        api.get_api_v1_engagement_search({
          query: { Page: page, PageSize: 20, Q: search || undefined },
          signal,
        }),
      [page, search],
      !!owner,
      true,
    );
  return (
    <div className="container membership-connected">
      <SectionHeading title={t({ en: "My engagement", ar: "مشاركتي" })} />
      <div className="membership-actions">
        <AppLink href="/my/contributions">
          {t({ en: "My contributions", ar: "مساهماتي" })}
        </AppLink>
        <AppLink href="/my/mentorship">
          {t({ en: "My mentorship", ar: "إرشادي" })}
        </AppLink>
        <AppLink href="/my/applications">
          {t({ en: "My applications", ar: "طلباتي" })}
        </AppLink>
        <AppLink href="/my/team">
          {t({ en: "My memberships", ar: "عضوياتي" })}
        </AppLink>
      </div>
      <Panel title={t({ en: "Engagement dashboard", ar: "لوحة المشاركة" })}>
        <QueryStatus query={dashboard} />
        {dashboard.data && (
          <>
            {[
              { key: "contributions", en: "Contributions", ar: "المساهمات" },
              {
                key: "savedOpportunities",
                en: "Saved opportunities",
                ar: "الفرص المحفوظة",
              },
              { key: "sessions", en: "Sessions", ar: "الجلسات" },
              {
                key: "teamApplications",
                en: "Team applications",
                ar: "طلبات الفرق",
              },
            ].map((v) => (
              <section key={v.key}>
                <h3>{t(v)}</h3>
                <Table
                  value={dashboard.data[v.key as keyof typeof dashboard.data]}
                />
              </section>
            ))}
          </>
        )}
      </Panel>
      <Panel
        title={t({
          en: "Search engagement resources",
          ar: "البحث في موارد المشاركة",
        })}
      >
        <label>
          {t({ en: "Search", ar: "بحث" })}
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </label>
        <QueryStatus query={results} />
        {results.data && (
          <>
            <Table value={results.data.items} />
            <Pager
              page={page}
              total={results.data.totalItems}
              onChange={setPage}
            />
          </>
        )}
      </Panel>
    </div>
  );
}
