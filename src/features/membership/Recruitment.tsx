import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { AppLink } from "../../components/navigation/AppLink";
import { RecruitmentNavigation } from "../../components/navigation/RecruitmentNavigation";
import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import {
  useMembershipConnection,
  useMembershipQuery,
  useMembershipAction,
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
  AnswersForm,
  PrivateText,
  type Edit,
} from "./UI";
import { record, string } from "../../services/api/mapping";
import {
  bodyDraft,
  taskAction,
  visibleCandidateHistory,
  visibleCandidateInterviews,
  type Question,
} from "./model";
import "../../styles/membership-connect.css";
const hiddenAction = [
  "revisionId",
  "reviewerId",
  "status",
  "feedback",
  "internalNotes",
];
export function RecruitmentDirectory() {
  const { api, owner } = useMembershipConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    q = useMembershipQuery(
      "recruitment-openings",
      (signal) =>
        api.get_api_v1_team_recruitment_openings({
          query: { Page: page, PageSize: 20, Search: search || undefined },
          signal,
        }),
      [page, search],
      !!owner,
      true,
    );
  return (
    <div className="container membership-connected recruitment-v9">
      <RecruitmentNavigation />
      <header className="recruitment-hero artwork-scene">
        <SectionHeading
          title={t({ en: "Join a team", ar: "انضم إلى فريق" })}
          body={t({
            en: "Review open roles and apply, or save a draft for later.",
            ar: "راجع الفرص المتاحة وقدّم طلباً، أو احفظ مسودة لوقت لاحق.",
          })}
        />
        <HeroArtwork section="team" />
      </header>
      {!owner ? (
        <AppLink href="/auth/sign-in">
          {t({
            en: "Sign in to view recruitment openings",
            ar: "سجل الدخول لعرض فرص الانضمام",
          })}
        </AppLink>
      ) : (
        <>
          <label>
            {t({ en: "Search openings", ar: "البحث في الفرص" })}
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </label>
          <QueryStatus query={q} />
          {q.data && (
            <>
              <div className="membership-grid">
                {q.data.items.map((row) => (
                  <article className="membership-card" key={row.id}>
                    <h3>
                      <Localized row={row} field="title" />
                    </h3>
                    <p>
                      <Localized row={row} field="description" />
                    </p>
                    <Facts
                      value={{
                        status: row.status,
                        opensAt: row.opensAt,
                        closesAt: row.closesAt,
                        applicationCount: row.applicationCount,
                      }}
                    />
                    <AppLink href={"/recruitment/" + row.id}>
                      {t({ en: "Review opening", ar: "مراجعة الفرصة" })}
                    </AppLink>
                  </article>
                ))}
              </div>
              <Empty items={q.data.items} />
              <Pager page={page} total={q.data.totalItems} onChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}
export function RecruitmentOpening() {
  const { slug: id = "" } = useParams(),
    { api, owner } = useMembershipConnection(),
    { t } = useLocale(),
    [apply, setApply] = useState(false),
    [edit, setEdit] = useState<Edit | null>(null),
    [created, setCreated] = useState(""),
    action = useMembershipAction(),
    q = useMembershipQuery(
      "opening-detail",
      (signal) =>
        api.get_api_v1_team_recruitment_openings_by_id({
          path: { id },
          signal,
        }),
      id,
      !!id && !!owner,
      true,
    );
  return (
    <div className="container membership-connected recruitment-v9">
      <RecruitmentNavigation />
      <SectionHeading
        title={t({ en: "Recruitment opening", ar: "فرصة الانضمام" })}
      />
      <AppLink href="/recruitment">
        {t({ en: "Back to openings", ar: "العودة إلى الفرص" })}
      </AppLink>
      {!owner ? (
        <AppLink href="/auth/sign-in">
          {t({
            en: "Sign in to review and apply",
            ar: "سجل الدخول للمراجعة والتقديم",
          })}
        </AppLink>
      ) : (
        <>
          <QueryStatus query={q} />
          {q.data && (
            <>
              <article className="membership-card">
                <h2>
                  <Localized row={q.data} field="title" />
                </h2>
                <p>
                  <Localized row={q.data} field="description" />
                </p>
                <Facts
                  value={{
                    status: q.data.status,
                    opensAt: q.data.opensAt,
                    closesAt: q.data.closesAt,
                    applicationCount: q.data.applicationCount,
                  }}
                />
                <Presentation value={q.data.presentation} />
                <div className="membership-actions">
                  <Button onClick={() => setApply(true)}>
                    {t({ en: "Apply now", ar: "التقديم الآن" })}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setEdit({
                        operation: "post_api_v1_team_applications_drafts",
                        title: t({
                          en: "Save application draft",
                          ar: "حفظ مسودة الطلب",
                        }),
                        initial: { openingId: id, consentConfirmed: false },
                        hiddenFields: ["openingId"],
                        description: t({
                          en: "Saving a draft does not submit an application.",
                          ar: "حفظ المسودة لا يرسل الطلب.",
                        }),
                      })
                    }
                  >
                    {t({ en: "Save a draft", ar: "حفظ مسودة" })}
                  </Button>
                </div>
              </article>
              {apply && (
                <AnswersForm
                  title={t({ en: "Submit application", ar: "إرسال الطلب" })}
                  questions={q.data.questions as Question[]}
                  busy={action.busy}
                  feedback={action.feedback}
                  onClose={() => setApply(false)}
                  onSubmit={(answers) =>
                    action.run(
                      () =>
                        api.post_api_v1_team_recruitment_openings_by_id_apply({
                          path: { id },
                          body: { answers },
                        }),
                      (v) => {
                        setCreated(v.id!);
                        setApply(false);
                      },
                      t({ en: "Application submitted", ar: "تم إرسال الطلب" }),
                    )
                  }
                />
              )}
            </>
          )}
          {created && (
            <AppLink href={"/my/applications?application=" + created}>
              {t({ en: "Open my application", ar: "فتح طلبي" })}
            </AppLink>
          )}
          {edit && (
            <EditDialog
              edit={edit}
              onClose={() => setEdit(null)}
              onSaved={(v) => setCreated(string(record(v).id))}
            />
          )}
        </>
      )}
    </div>
  );
}
export function Presentation({ value }: { value: unknown }) {
  const r = record(value),
    { t } = useLocale();
  return (
    <>
      {["responsibilities", "requirements", "skills"].map(
        (k) =>
          Array.isArray(r[k]) && (
            <section key={k}>
              <h3>
                {t(
                  k === "responsibilities"
                    ? { en: "Responsibilities", ar: "المسؤوليات" }
                    : k === "requirements"
                      ? { en: "Requirements", ar: "المتطلبات" }
                      : { en: "Skills", ar: "المهارات" },
                )}
              </h3>
              <ul>
                {(r[k] as unknown[]).map((v, i) => (
                  <li key={i}>
                    <LocalizedText value={v} />
                  </li>
                ))}
              </ul>
            </section>
          ),
      )}
      <Facts
        value={{
          commitmentHoursPerWeek: r.commitmentHoursPerWeek,
          openings: r.openings,
        }}
      />
    </>
  );
}
function LocalizedText({ value }: { value: unknown }) {
  const { locale } = useLocale(),
    r = record(value);
  return <>{string(r[locale]) || string(r.ar) || string(r.en)}</>;
}
export function MyApplications() {
  const { api, owner } = useMembershipConnection(),
    { t } = useLocale(),
    [params] = useSearchParams(),
    [page, setPage] = useState(1),
    [id, setId] = useState(params.get("application") || ""),
    q = useMembershipQuery(
      "my-applications",
      (signal) =>
        api.get_api_v1_team_applications_my({
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      page,
      !!owner,
      true,
    );
  return (
    <div className="container membership-connected recruitment-v9">
      <RecruitmentNavigation />
      <SectionHeading title={t({ en: "My applications", ar: "طلباتي" })} />
      <QueryStatus query={q} />
      {q.data && (
        <>
          <div className="membership-grid">
            {q.data.items.map((row) => (
              <article className="membership-card" key={row.id}>
                <h3>{t({ en: "Team application", ar: "طلب الانضمام" })}</h3>
                <Facts
                  value={{ status: row.status, submittedAt: row.submittedAt }}
                />
                <Button variant="outline" onClick={() => setId(row.id)}>
                  {t({ en: "Open application", ar: "فتح الطلب" })}
                </Button>
              </article>
            ))}
          </div>
          <Empty items={q.data.items} />
          <Pager page={page} total={q.data.totalItems} onChange={setPage} />
        </>
      )}
      {id && <ApplicationDetails key={id} id={id} />}
    </div>
  );
}
export function ApplicationDetails({
  id,
  admin = false,
  permissions = [],
}: {
  id: string;
  admin?: boolean;
  permissions?: string[];
}) {
  const { api } = useMembershipConnection(),
    { t } = useLocale(),
    [edit, setEdit] = useState<Edit | null>(null),
    [submit, setSubmit] = useState(false),
    q = useMembershipQuery(
      admin ? "admin-application" : "my-application",
      (signal) =>
        admin
          ? api.get_api_v1_admin_team_applications_by_id({
              path: { id },
              signal,
            })
          : api.get_api_v1_team_applications_my_by_id({ path: { id }, signal }),
      [id, admin],
      true,
      true,
    ),
    opening = useMembershipQuery(
      "application-opening",
      (signal) =>
        api.get_api_v1_team_recruitment_openings_by_id({
          path: { id: q.data!.openingId },
          signal,
        }),
      q.data?.openingId,
      !!q.data && !admin && /^draft$/i.test(q.data.status),
      true,
    ),
    action = useMembershipAction();
  return (
    <Panel title={t({ en: "Application details", ar: "تفاصيل الطلب" })}>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <Facts
            value={{
              id: q.data.id,
              status: q.data.status,
              submittedAt: q.data.submittedAt,
              motivation: q.data.motivation,
              experience: q.data.experience,
              availability: q.data.availability,
              consentConfirmed: q.data.consentConfirmed,
            }}
          />
          <h3>{t({ en: "Answers", ar: "الإجابات" })}</h3>
          <Table value={q.data.answers} />
          <h3>{t({ en: "History", ar: "السجل" })}</h3>
          <Table
            value={
              admin ? q.data.history : visibleCandidateHistory(q.data.history)
            }
          />
          <h3>{t({ en: "Interviews", ar: "المقابلات" })}</h3>
          {admin ? (
            <Table value={q.data.interviews} />
          ) : (
            visibleCandidateInterviews(q.data.interviews).map((row) => (
              <article key={string(row.id)} className="membership-card">
                <Facts
                  value={{
                    scheduledAt: row.scheduledAt,
                    durationMinutes: row.durationMinutes,
                    mode: row.mode,
                    status: row.status,
                  }}
                />
                {typeof row.meetingUrl === "string" && row.meetingUrl && (
                  <PrivateText
                    label={t({
                      en: "interview meeting link",
                      ar: "رابط المقابلة",
                    })}
                    value={row.meetingUrl}
                  />
                )}{" "}
                {typeof row.locationInstructions === "string" &&
                  row.locationInstructions && (
                    <PrivateText
                      label={t({
                        en: "interview location",
                        ar: "مكان المقابلة",
                      })}
                      value={row.locationInstructions}
                    />
                  )}
              </article>
            ))
          )}
          {!admin && (
            <div className="membership-actions">
              {/^draft$/i.test(q.data.status) && (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setEdit({
                        operation: "put_api_v1_team_applications_drafts_by_id",
                        title: t({
                          en: "Save application draft",
                          ar: "حفظ مسودة الطلب",
                        }),
                        path: { id },
                        initial: bodyDraft(
                          "put_api_v1_team_applications_drafts_by_id",
                          q.data,
                        ),
                        hiddenFields: ["openingId"],
                      })
                    }
                  >
                    {t({ en: "Edit draft", ar: "تعديل المسودة" })}
                  </Button>
                  <Button
                    disabled={!q.data.consentConfirmed || !opening.data}
                    onClick={() => setSubmit(true)}
                  >
                    {t({
                      en: "Review draft submission",
                      ar: "مراجعة إرسال المسودة",
                    })}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() =>
                  setEdit({
                    operation:
                      "post_api_v1_team_applications_my_by_id_withdraw",
                    title: t({ en: "Withdraw application", ar: "سحب الطلب" }),
                    path: { id },
                    initial: { version: q.data.version },
                    requireFields: ["reason"],
                    hiddenFields: hiddenAction,
                  })
                }
              >
                {t({ en: "Review withdrawal", ar: "مراجعة السحب" })}
              </Button>
            </div>
          )}
          {!admin && /^draft$/i.test(q.data.status) && (
            <>
              <QueryStatus query={opening} />
              {!q.data.consentConfirmed && (
                <p>
                  {t({
                    en: "Edit the draft and explicitly confirm consent before submission.",
                    ar: "عدّل المسودة وأكد الموافقة صراحة قبل الإرسال.",
                  })}
                </p>
              )}
            </>
          )}
          {admin && (
            <div className="membership-actions">
              <Button
                variant="outline"
                onClick={() =>
                  setEdit({
                    operation:
                      "post_api_v1_admin_team_applications_by_id_transition",
                    title: t({
                      en: "Change application stage",
                      ar: "تغيير مرحلة الطلب",
                    }),
                    path: { id },
                    initial: { version: q.data.version },
                    requireFields: ["status", "reason"],
                    hiddenFields: ["revisionId", "reviewerId", "feedback"],
                    description: t({
                      en: "Enter the intended stage. The backend validates allowed transitions, permissions and onboarding requirements.",
                      ar: "أدخل المرحلة المقصودة. يتحقق الخادم من الانتقالات المسموحة والصلاحيات ومتطلبات التهيئة.",
                    }),
                  })
                }
              >
                {t({ en: "Review stage change", ar: "مراجعة تغيير المرحلة" })}
              </Button>
              {permissions.includes("recruitment.interviews.manage") && (
                <Button
                  onClick={() =>
                    setEdit({
                      operation:
                        "post_api_v1_admin_team_applications_by_id_interviews",
                      title: t({
                        en: "Schedule interview",
                        ar: "جدولة مقابلة",
                      }),
                      path: { id },
                      initial: {
                        mode: "Online",
                        durationMinutes: 30,
                        status: "Scheduled",
                      },
                      requireFields: ["interviewerUserId"],
                    })
                  }
                >
                  {t({ en: "New interview", ar: "مقابلة جديدة" })}
                </Button>
              )}
            </div>
          )}
          {admin &&
            permissions.includes("recruitment.interviews.manage") &&
            q.data.interviews.map((row) => (
              <Button
                key={row.id}
                variant="outline"
                onClick={() =>
                  setEdit({
                    operation: "put_api_v1_admin_application_interviews_by_id",
                    title: t({ en: "Save interview", ar: "حفظ المقابلة" }),
                    path: { id: row.id },
                    initial: bodyDraft(
                      "put_api_v1_admin_application_interviews_by_id",
                      row,
                    ),
                    requireFields: ["interviewerUserId"],
                    description: t({
                      en: "The read omits the interviewer account ID. Supply its authoritative value; the interview version is retained.",
                      ar: "لا تعرض القراءة معرّف حساب المحاور. أدخل قيمته المعتمدة؛ مع الاحتفاظ بنسخة المقابلة.",
                    }),
                  })
                }
              >
                {t({ en: "Edit interview", ar: "تعديل المقابلة" })}{" "}
                {row.scheduledAt}
              </Button>
            ))}
          {q.data.onboardingTasks && (
            <>
              <h3>{t({ en: "Onboarding tasks", ar: "مهام التهيئة" })}</h3>
              {q.data.onboardingTasks.map((task) => (
                <article className="membership-card" key={task.id}>
                  <h4>{task.titleSnapshot}</h4>
                  <p>{task.descriptionSnapshot}</p>
                  <Facts
                    value={{
                      status: task.status,
                      isRequired: task.isRequired,
                      completedAt: task.completedAt,
                    }}
                  />
                  {!admin &&
                    /^(Accepted|Onboarding)$/i.test(q.data.status) &&
                    !/completed|waived/i.test(task.status) && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setEdit({
                            operation:
                              "post_api_v1_team_applications_my_by_id_onboarding_tasks_by_taskId_toggle",
                            title: t({
                              en: "Claim or unclaim task completion",
                              ar: "تأكيد أو سحب إقرار إكمال المهمة",
                            }),
                            path: { id, taskId: task.id },
                            initial: taskAction(task),
                            hiddenFields: hiddenAction,
                            description: t({
                              en: "This updates your claim. An administrator must separately verify completion.",
                              ar: "يحدّث هذا الإجراء إقرارك. يجب أن يتحقق مسؤول من الإكمال بشكل مستقل.",
                            }),
                          })
                        }
                      >
                        {t({
                          en: "Review task claim",
                          ar: "مراجعة إقرار المهمة",
                        })}
                      </Button>
                    )}
                </article>
              ))}
            </>
          )}
          {q.data.createdMemberProfileId && (
            <AppLink href={"/my/team?member=" + q.data.createdMemberProfileId}>
              {t({ en: "Open membership profile", ar: "فتح ملف العضوية" })}
            </AppLink>
          )}
          {submit && opening.data && (
            <AnswersForm
              title={t({
                en: "Submit saved draft",
                ar: "إرسال المسودة المحفوظة",
              })}
              questions={opening.data.questions as Question[]}
              busy={action.busy}
              feedback={action.feedback}
              onClose={() => setSubmit(false)}
              onSubmit={(answers) =>
                action.run(
                  () =>
                    api.post_api_v1_team_applications_drafts_by_id_submit({
                      path: { id },
                      body: { version: q.data.version, answers },
                    }),
                  () => setSubmit(false),
                  t({ en: "Draft submitted", ar: "تم إرسال المسودة" }),
                )
              }
            />
          )}
        </>
      )}
      {edit && <EditDialog edit={edit} onClose={() => setEdit(null)} />}
    </Panel>
  );
}
