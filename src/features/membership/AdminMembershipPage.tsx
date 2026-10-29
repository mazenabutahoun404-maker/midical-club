import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAccess } from "../../admin/governance/useGovernance";
import { Button } from "../../components/ui/button";
import {
  useMembershipConnection,
  useMembershipQuery,
  MembershipScope,
  Panel,
  QueryStatus,
  Pager,
} from "./shared";
import {
  Facts,
  Table,
  Localized,
  SectionHeading,
  EditDialog,
  type Edit,
} from "./UI";
import { MentorProfile, MentorInbox } from "./MentorWorkspace";
import { ApplicationDetails } from "./Recruitment";
import { MemberDetails } from "./Members";
import { bodyDraft, openingDraft } from "./model";
import { record, string } from "../../services/api/mapping";
import "../../styles/membership-connect.css";
export default function AdminMembershipPage() {
  return (
    <MembershipScope>
      <AdminWorkspace />
    </MembershipScope>
  );
}
function AdminWorkspace() {
  const { t } = useLocale(),
    access = useAccess(),
    permissions = access.data?.permissions || [],
    [selected, setSelected] = useState(""),
    [team, setTeam] = useState(""),
    [teamDraft, setTeamDraft] = useState("");
  const tabs = [
      ...(permissions.some((v) => v.startsWith("mentorship."))
        ? [{ id: "mentors", en: "Mentorship", ar: "الإرشاد" }]
        : []),
      ...(permissions.some((v) => v.startsWith("recruitment."))
        ? [{ id: "recruitment", en: "Recruitment", ar: "الانضمام" }]
        : []),
      ...(permissions.some(
        (v) =>
          v.startsWith("member_profiles.") ||
          v === "recruitment.onboarding.manage",
      )
        ? [
            {
              id: "members",
              en: "Members & onboarding",
              ar: "الأعضاء والتهيئة",
            },
          ]
        : []),
    ],
    tab = tabs.some((v) => v.id === selected) ? selected : tabs[0]?.id;
  return (
    <div className="container membership-connected">
      <SectionHeading
        title={t({
          en: "Mentorship & membership administration",
          ar: "إدارة الإرشاد والعضوية",
        })}
      />
      <QueryStatus query={access} />
      <nav className="membership-tabs">
        {tabs.map((v) => (
          <Button
            key={v.id}
            variant={tab === v.id ? "default" : "outline"}
            onClick={() => setSelected(v.id)}
          >
            {t(v)}
          </Button>
        ))}
      </nav>
      {tab === "mentors" && <AdminMentorship permissions={permissions} />}{" "}
      {(tab === "recruitment" || tab === "members") && (
        <>
          <Panel title={t({ en: "Team scope", ar: "نطاق الفريق" })}>
            <p>
              {t({
                en: "Choose a real team ID from Teams & titles. The backend applies your team permissions.",
                ar: "اختر معرّف فريق حقيقي من الفرق والألقاب. يطبق الخادم صلاحيات فريقك.",
              })}
            </p>
            <div className="membership-toolbar">
              <label>
                {t({ en: "Team ID", ar: "معرّف الفريق" })}
                <input
                  value={teamDraft}
                  onChange={(e) => setTeamDraft(e.target.value)}
                />
              </label>
              <Button disabled={!teamDraft} onClick={() => setTeam(teamDraft)}>
                {t({ en: "Open team workspace", ar: "فتح مساحة الفريق" })}
              </Button>
            </div>
          </Panel>
          {team &&
            (tab === "recruitment" ? (
              <AdminRecruitment
                key={team}
                teamId={team}
                permissions={permissions}
              />
            ) : (
              <AdminMembers
                key={team}
                teamId={team}
                permissions={permissions}
              />
            ))}
        </>
      )}
    </div>
  );
}
function AdminMentorship({ permissions }: { permissions: string[] }) {
  const { api } = useMembershipConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [qaPage, setQaPage] = useState(1),
    [status, setStatus] = useState(""),
    [id, setId] = useState(""),
    [edit, setEdit] = useState<Edit | null>(null),
    q = useMembershipQuery(
      "admin-mentors",
      (signal) =>
        api.get_api_v1_admin_mentors({
          query: { Page: page, PageSize: 20, Status: status || undefined },
          signal,
        }),
      [page, status],
      permissions.includes("mentorship.view_admin"),
      true,
    ),
    areas = useMembershipQuery(
      "admin-areas",
      (signal) => api.get_api_v1_admin_mentorship_areas({ signal }),
      "",
      permissions.includes("mentorship.areas.manage"),
      true,
    ),
    qa = useMembershipQuery(
      "admin-public-qa",
      (signal) =>
        api.get_api_v1_admin_mentorship_public_qa({
          query: { Page: qaPage, PageSize: 20 },
          signal,
        }),
      qaPage,
      permissions.includes("mentorship.sessions.manage"),
      true,
    );
  return (
    <>
      <Panel title={t({ en: "Mentors", ar: "المرشدون" })}>
        <label>
          {t({ en: "Status", ar: "الحالة" })}
          <input
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          />
        </label>
        <QueryStatus query={q} />
        {q.data && (
          <>
            {q.data.items.map((row) => (
              <article key={row.id} className="membership-card">
                <h3>{row.displayNameSnapshot}</h3>
                <Facts
                  value={{ status: row.status, capacity: row.defaultCapacity }}
                />
                <Button variant="outline" onClick={() => setId(row.id)}>
                  {t({ en: "Manage mentor", ar: "إدارة المرشد" })}
                </Button>
              </article>
            ))}
            <Pager page={page} total={q.data.totalItems} onChange={setPage} />
          </>
        )}
      </Panel>
      <MentorProfile key={id} admin selectedId={id} permissions={permissions} />
      {permissions.includes("mentorship.sessions.manage") && (
        <MentorInbox mentor />
      )}
      {permissions.includes("mentorship.areas.manage") && (
        <Panel title={t({ en: "Mentorship areas", ar: "مجالات الإرشاد" })}>
          <Button
            onClick={() =>
              setEdit({
                operation: "post_api_v1_admin_mentorship_areas",
                title: t({
                  en: "Create mentorship area",
                  ar: "إنشاء مجال إرشاد",
                }),
                initial: { displayOrder: 0, status: "Active" },
              })
            }
          >
            {t({ en: "New area", ar: "مجال جديد" })}
          </Button>
          <QueryStatus query={areas} />
          {areas.data?.map((row) => (
            <article key={row.id} className="membership-card">
              <h3>
                <Localized row={row} field="name" />
              </h3>
              <Facts value={row} />
              <Button
                variant="outline"
                onClick={() =>
                  setEdit({
                    operation: "put_api_v1_admin_mentorship_areas_by_id",
                    title: t({
                      en: "Save mentorship area",
                      ar: "حفظ مجال الإرشاد",
                    }),
                    path: { id: row.id },
                    initial: bodyDraft(
                      "put_api_v1_admin_mentorship_areas_by_id",
                      row,
                    ),
                    requireFields: ["displayOrder"],
                    description: t({
                      en: "Some category response variants omit order/description. Review complete intended values before saving.",
                      ar: "قد لا تعرض بعض نسخ الاستجابة الترتيب والوصف. راجع القيم المقصودة كاملة قبل الحفظ.",
                    }),
                  })
                }
              >
                {t({ en: "Edit area", ar: "تعديل المجال" })}
              </Button>
            </article>
          ))}
        </Panel>
      )}
      {permissions.includes("mentorship.sessions.manage") && (
        <Panel title={t({ en: "Mentorship questions", ar: "أسئلة الإرشاد" })}>
          <Button
            variant="outline"
            onClick={() =>
              setEdit({
                operation: "post_api_v1_admin_mentorship_questions",
                title: t({
                  en: "Create shared mentorship question",
                  ar: "إنشاء سؤال إرشاد مشترك",
                }),
                initial: {
                  active: true,
                  required: false,
                  displayOrder: 0,
                  options: [],
                },
              })
            }
          >
            {t({ en: "New shared question", ar: "سؤال مشترك جديد" })}
          </Button>
          <Button
            onClick={() =>
              setEdit({
                operation: "post_api_v1_admin_mentorship_public_qa",
                title: t({
                  en: "Create public answer draft",
                  ar: "إنشاء مسودة إجابة عامة",
                }),
                initial: { tags: [] },
              })
            }
          >
            {t({ en: "New public answer draft", ar: "مسودة إجابة عامة جديدة" })}
          </Button>
          <QueryStatus query={qa} />
          {qa.data && (
            <>
              {qa.data.items.map((row) => (
                <article key={row.id} className="membership-card">
                  <h3>
                    <Localized row={row} field="question" />
                  </h3>
                  <p>
                    <Localized row={row} field="answer" />
                  </p>
                  <Facts
                    value={{
                      status: row.status,
                      answererNameSnapshot: row.answererNameSnapshot,
                    }}
                  />
                  <div className="membership-actions">
                    <Button
                      variant="outline"
                      disabled={/^published$/i.test(string(row.status))}
                      onClick={() =>
                        setEdit({
                          operation:
                            "put_api_v1_admin_mentorship_public_qa_by_id",
                          title: t({
                            en: "Save public answer draft",
                            ar: "حفظ مسودة الإجابة العامة",
                          }),
                          path: { id: row.id },
                          initial: bodyDraft(
                            "put_api_v1_admin_mentorship_public_qa_by_id",
                            row,
                          ),
                        })
                      }
                    >
                      {t({
                        en: "Edit answer draft",
                        ar: "تعديل مسودة الإجابة",
                      })}
                    </Button>
                    {permissions.includes("mentorship.mentors.approve") && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setEdit({
                              operation:
                                "post_api_v1_admin_mentorship_public_qa_by_id_publish",
                              title: t({
                                en: "Publish reviewed answer",
                                ar: "نشر الإجابة المراجعة",
                              }),
                              path: { id: row.id },
                              initial: { version: row.version },
                              hiddenFields: [
                                "revisionId",
                                "reviewerId",
                                "status",
                                "feedback",
                                "internalNotes",
                              ],
                              description: t({
                                en: "The backend requires an independent reviewer and a current version.",
                                ar: "يتطلب الخادم مراجعاً مستقلاً ونسخة حديثة.",
                              }),
                            })
                          }
                        >
                          {t({ en: "Review publication", ar: "مراجعة النشر" })}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setEdit({
                              operation:
                                "post_api_v1_admin_mentorship_public_qa_by_id_archive",
                              title: t({
                                en: "Archive public answer",
                                ar: "أرشفة الإجابة العامة",
                              }),
                              path: { id: row.id },
                              initial: { version: row.version },
                              requireFields: ["reason"],
                              hiddenFields: [
                                "revisionId",
                                "reviewerId",
                                "status",
                                "feedback",
                                "internalNotes",
                              ],
                            })
                          }
                        >
                          {t({ en: "Review archive", ar: "مراجعة الأرشفة" })}
                        </Button>
                      </>
                    )}
                  </div>
                </article>
              ))}
              <Pager
                page={qaPage}
                total={qa.data.totalItems}
                onChange={setQaPage}
              />
            </>
          )}
        </Panel>
      )}
      {edit && <EditDialog edit={edit} onClose={() => setEdit(null)} />}
    </>
  );
}
function AdminRecruitment({
  teamId,
  permissions,
}: {
  teamId: string;
  permissions: string[];
}) {
  const { api } = useMembershipConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [id, setId] = useState(""),
    [appPage, setAppPage] = useState(1),
    [application, setApplication] = useState(""),
    [edit, setEdit] = useState<Edit | null>(null),
    canManage = permissions.includes("recruitment.openings.manage"),
    q = useMembershipQuery(
      "admin-openings",
      (signal) =>
        api.get_api_v1_admin_teams_by_teamId_recruitment_openings({
          path: { teamId },
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      [teamId, page],
      canManage,
      true,
    ),
    detail = useMembershipQuery(
      "admin-opening",
      (signal) =>
        api.get_api_v1_admin_recruitment_openings_by_id({
          path: { id },
          signal,
        }),
      id,
      !!id && canManage,
      true,
    ),
    apps = useMembershipQuery(
      "opening-applications",
      (signal) =>
        api.get_api_v1_admin_recruitment_openings_by_id_applications({
          path: { id },
          query: { Page: appPage, PageSize: 20 },
          signal,
        }),
      [id, appPage],
      !!id && permissions.includes("recruitment.applications.view"),
      true,
    );
  return (
    <>
      <Panel
        title={t({
          en: "Team recruitment openings",
          ar: "فرص الانضمام للفريق",
        })}
      >
        {canManage && (
          <Button
            onClick={() =>
              setEdit({
                operation:
                  "post_api_v1_admin_teams_by_teamId_recruitment_openings",
                title: t({
                  en: "Create recruitment opening",
                  ar: "إنشاء فرصة انضمام",
                }),
                path: { teamId },
                initial: { questions: [] },
              })
            }
          >
            {t({ en: "New recruitment opening", ar: "فرصة انضمام جديدة" })}
          </Button>
        )}
        <QueryStatus query={q} />
        {q.data && (
          <>
            {q.data.items.map((row) => (
              <article key={row.id} className="membership-card">
                <h3>
                  <Localized row={row} field="title" />
                </h3>
                <Facts
                  value={{
                    status: row.status,
                    opensAt: row.opensAt,
                    closesAt: row.closesAt,
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setId(row.id);
                    setAppPage(1);
                    setApplication("");
                  }}
                >
                  {t({ en: "Manage opening", ar: "إدارة الفرصة" })}
                </Button>
              </article>
            ))}
            <Pager page={page} total={q.data.totalItems} onChange={setPage} />
          </>
        )}
        {!canManage && (
          <div className="membership-toolbar">
            <label>
              {t({
                en: "Opening ID to review applications",
                ar: "معرّف الفرصة لمراجعة الطلبات",
              })}
              <input
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setAppPage(1);
                }}
              />
            </label>
          </div>
        )}
      </Panel>
      {id && (
        <>
          <Panel title={t({ en: "Opening management", ar: "إدارة الفرصة" })}>
            <QueryStatus query={detail} />
            {detail.data && (
              <>
                <Facts
                  value={{
                    status: detail.data.status,
                    opensAt: detail.data.opensAt,
                    closesAt: detail.data.closesAt,
                    applicationCount: detail.data.applicationCount,
                  }}
                />
                <div className="membership-actions">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setEdit({
                        operation:
                          "put_api_v1_admin_recruitment_openings_by_id",
                        title: t({
                          en: "Save recruitment opening",
                          ar: "حفظ فرصة الانضمام",
                        }),
                        path: { id },
                        initial: openingDraft(detail.data),
                        requireFields: ["questions", "presentation"],
                        description: t({
                          en: "Review the complete question list. The read omits each question’s active flag; explicitly set active in each replacement question.",
                          ar: "راجع قائمة الأسئلة كاملة. لا تعرض القراءة حالة تفعيل كل سؤال؛ حدد active صراحة في كل سؤال بديل.",
                        }),
                      })
                    }
                  >
                    {t({ en: "Edit opening", ar: "تعديل الفرصة" })}
                  </Button>
                  {(
                    [
                      {
                        operation:
                          "post_api_v1_admin_recruitment_openings_by_id_open",
                        en: "Open applications",
                        ar: "فتح التقديم",
                      },
                      {
                        operation:
                          "post_api_v1_admin_recruitment_openings_by_id_close",
                        en: "Close applications",
                        ar: "إغلاق التقديم",
                      },
                      {
                        operation:
                          "post_api_v1_admin_recruitment_openings_by_id_archive",
                        en: "Archive opening",
                        ar: "أرشفة الفرصة",
                      },
                    ] as const
                  ).map((v) => (
                    <Button
                      key={v.operation}
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          operation: v.operation,
                          title: t(v),
                          path: { id },
                          initial: { version: detail.data.version },
                          requireFields: ["reason"],
                          hiddenFields: [
                            "revisionId",
                            "reviewerId",
                            "status",
                            "feedback",
                            "internalNotes",
                          ],
                        })
                      }
                    >
                      {t(v)}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </Panel>
          {permissions.includes("recruitment.applications.view") && (
            <Panel
              title={t({ en: "Opening applications", ar: "طلبات الفرصة" })}
            >
              <QueryStatus query={apps} />
              {apps.data && (
                <>
                  {apps.data.items.map((row) => (
                    <article key={row.id} className="membership-card">
                      <Facts
                        value={{
                          id: row.id,
                          status: row.status,
                          submittedAt: row.submittedAt,
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => setApplication(row.id)}
                      >
                        {t({ en: "Review application", ar: "مراجعة الطلب" })}
                      </Button>
                    </article>
                  ))}
                  <Pager
                    page={appPage}
                    total={apps.data.totalItems}
                    onChange={setAppPage}
                  />
                </>
              )}
            </Panel>
          )}
        </>
      )}
      {application && (
        <ApplicationDetails
          key={application}
          id={application}
          admin
          permissions={permissions}
        />
      )}{" "}
      {edit && (
        <EditDialog
          edit={edit}
          onClose={() => setEdit(null)}
          onSaved={(v) => {
            if (
              edit.operation ===
              "post_api_v1_admin_teams_by_teamId_recruitment_openings"
            )
              setId(string(record(v).id));
          }}
        />
      )}
    </>
  );
}
function AdminMembers({
  teamId,
  permissions,
}: {
  teamId: string;
  permissions: string[];
}) {
  const { api } = useMembershipConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [id, setId] = useState(""),
    [edit, setEdit] = useState<Edit | null>(null),
    q = useMembershipQuery(
      "admin-members",
      (signal) =>
        api.get_api_v1_admin_teams_by_teamId_members_profiles({
          path: { teamId },
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      [teamId, page],
      permissions.includes("member_profiles.view_admin"),
      true,
    ),
    templates = useMembershipQuery(
      "onboarding-templates",
      (signal) =>
        api.get_api_v1_admin_teams_by_teamId_onboarding_templates({
          path: { teamId },
          signal,
        }),
      teamId,
      permissions.includes("recruitment.onboarding.manage"),
      true,
    );
  return (
    <>
      <Panel
        title={t({ en: "Team member profiles", ar: "ملفات أعضاء الفريق" })}
      >
        <QueryStatus query={q} />
        {q.data && (
          <>
            {q.data.items.map((row) => (
              <article className="membership-card" key={row.id}>
                <h3>{row.displayNameSnapshot}</h3>
                <Facts value={{ status: row.status }} />
                <Button variant="outline" onClick={() => setId(row.id)}>
                  {t({ en: "Manage member", ar: "إدارة العضو" })}
                </Button>
              </article>
            ))}
            <Pager page={page} total={q.data.totalItems} onChange={setPage} />
          </>
        )}
      </Panel>
      {id && (
        <MemberDetails
          key={id}
          id={id}
          mode="admin"
          permissions={permissions}
        />
      )}
      {permissions.includes("recruitment.onboarding.manage") && (
        <Panel title={t({ en: "Onboarding templates", ar: "قوالب التهيئة" })}>
          <Button
            onClick={() =>
              setEdit({
                operation:
                  "post_api_v1_admin_teams_by_teamId_onboarding_templates",
                title: t({
                  en: "Create onboarding template",
                  ar: "إنشاء قالب تهيئة",
                }),
                path: { teamId },
                initial: {
                  isRequired: true,
                  displayOrder: 0,
                  status: "Active",
                },
              })
            }
          >
            {t({ en: "New onboarding template", ar: "قالب تهيئة جديد" })}
          </Button>
          <QueryStatus query={templates} />
          {templates.data?.map((row) => (
            <article className="membership-card" key={row.id}>
              <h3>
                <Localized row={row} field="title" />
              </h3>
              <Facts
                value={{
                  isRequired: row.isRequired,
                  status: row.status,
                  displayOrder: row.displayOrder,
                }}
              />
              <Button
                variant="outline"
                onClick={() =>
                  setEdit({
                    operation:
                      "put_api_v1_admin_teams_by_teamId_onboarding_templates_by_id",
                    title: t({
                      en: "Save onboarding template",
                      ar: "حفظ قالب التهيئة",
                    }),
                    path: { teamId, id: row.id },
                    initial: bodyDraft(
                      "put_api_v1_admin_teams_by_teamId_onboarding_templates_by_id",
                      row,
                    ),
                  })
                }
              >
                {t({ en: "Edit template", ar: "تعديل القالب" })}
              </Button>
            </article>
          ))}
        </Panel>
      )}
      {edit && <EditDialog edit={edit} onClose={() => setEdit(null)} />}
    </>
  );
}
