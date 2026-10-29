import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { MentorshipNavigation } from "../../components/navigation/MentorshipNavigation";
import {
  useMembershipConnection,
  useMembershipQuery,
  Panel,
  QueryStatus,
  Pager,
} from "./shared";
import {
  Facts,
  Table,
  PrivateText,
  SectionHeading,
  EditDialog,
  type Edit,
} from "./UI";
import { mentorDraft, slotDraft, parsed } from "./model";
import { record, string, array } from "../../services/api/mapping";
import "../../styles/membership-connect.css";
const actionHidden = [
  "revisionId",
  "reviewerId",
  "status",
  "feedback",
  "internalNotes",
];
export function MyMentorship() {
  const { t } = useLocale(),
    [tab, setTab] = useState("student");
  return (
    <div className="container membership-connected mentorship-v6">
      <MentorshipNavigation />
      <SectionHeading
        title={t({ en: "My mentorship", ar: "الإرشاد الخاص بي" })}
      />
      <nav className="membership-tabs">
        {[
          {
            id: "student",
            en: "My requests and sessions",
            ar: "طلباتي وجلساتي",
          },
          { id: "mentor", en: "Mentor inbox", ar: "صندوق المرشد" },
          { id: "profile", en: "My mentor profile", ar: "ملف المرشد الخاص بي" },
        ].map((v) => (
          <Button
            key={v.id}
            variant={tab === v.id ? "default" : "outline"}
            onClick={() => setTab(v.id)}
          >
            {t(v)}
          </Button>
        ))}
      </nav>
      {tab === "student" && <MentorInbox />}
      {tab === "mentor" && <MentorInbox mentor />}
      {tab === "profile" && <MentorProfile />}
    </div>
  );
}
export function MentorInbox({ mentor = false }: { mentor?: boolean }) {
  const { api, owner } = useMembershipConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [sessionPage, setSessionPage] = useState(1),
    [edit, setEdit] = useState<Edit | null>(null),
    requests = useMembershipQuery(
      mentor ? "mentor-requests" : "my-requests",
      (signal) =>
        mentor
          ? api.get_api_v1_mentor_requests({
              query: { Page: page, PageSize: 20 },
              signal,
            })
          : api.get_api_v1_mentorship_requests_my({
              query: { Page: page, PageSize: 20 },
              signal,
            }),
      [mentor, page],
      !!owner,
      true,
    ),
    sessions = useMembershipQuery(
      mentor ? "mentor-sessions" : "my-sessions",
      (signal) =>
        mentor
          ? api.get_api_v1_mentor_sessions({
              query: { Page: sessionPage, PageSize: 20 },
              signal,
            })
          : api.get_api_v1_mentorship_sessions_my({
              query: { Page: sessionPage, PageSize: 20 },
              signal,
            }),
      [mentor, sessionPage],
      !!owner,
      true,
    );
  return (
    <>
      <Panel
        title={t({
          en: mentor ? "Mentor requests" : "My mentorship requests",
          ar: mentor ? "طلبات المرشد" : "طلبات الإرشاد الخاصة بي",
        })}
      >
        <QueryStatus query={requests} />
        {requests.data && (
          <>
            {requests.data.items.map((row) => (
              <article key={row.id} className="membership-card">
                <Facts
                  value={{
                    id: row.id,
                    status: row.status,
                    submittedAt: row.submittedAt,
                    studentMessage: row.studentMessage,
                    decisionReason: row.decisionReason,
                  }}
                />
                <Table value={row.answers} />
                <div className="membership-actions">
                  {mentor ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setEdit({
                            operation:
                              "post_api_v1_mentor_requests_by_id_accept",
                            title: t({
                              en: "Accept mentorship request",
                              ar: "قبول طلب الإرشاد",
                            }),
                            path: { id: row.id },
                            initial: { version: row.version },
                            hiddenFields: actionHidden,
                          })
                        }
                      >
                        {t({ en: "Review acceptance", ar: "مراجعة القبول" })}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setEdit({
                            operation:
                              "post_api_v1_mentor_requests_by_id_reject",
                            title: t({
                              en: "Reject mentorship request",
                              ar: "رفض طلب الإرشاد",
                            }),
                            path: { id: row.id },
                            initial: { version: row.version },
                            requireFields: ["reason"],
                            hiddenFields: actionHidden,
                          })
                        }
                      >
                        {t({ en: "Review rejection", ar: "مراجعة الرفض" })}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          operation:
                            "post_api_v1_mentorship_requests_by_id_withdraw",
                          title: t({
                            en: "Withdraw mentorship request",
                            ar: "سحب طلب الإرشاد",
                          }),
                          path: { id: row.id },
                          initial: { version: row.version },
                          hiddenFields: actionHidden,
                        })
                      }
                    >
                      {t({ en: "Review withdrawal", ar: "مراجعة السحب" })}
                    </Button>
                  )}
                </div>
              </article>
            ))}
            <Pager
              page={page}
              total={requests.data.totalItems}
              onChange={setPage}
            />
          </>
        )}
      </Panel>
      <Panel
        title={t({
          en: mentor ? "Mentor sessions" : "My mentorship sessions",
          ar: mentor ? "جلسات المرشد" : "جلسات الإرشاد الخاصة بي",
        })}
      >
        <QueryStatus query={sessions} />
        {sessions.data && (
          <>
            {sessions.data.items.map((row) => (
              <article className="membership-card" key={row.id}>
                <Facts
                  value={{
                    id: row.id,
                    startsAt: row.startsAt,
                    endsAt: row.endsAt,
                    mode: row.mode,
                    status: row.status,
                  }}
                />
                {row.meetingUrl && (
                  <PrivateText
                    key={row.id + "meeting"}
                    label={t({
                      en: "private meeting link",
                      ar: "رابط الاجتماع الخاص",
                    })}
                    value={row.meetingUrl}
                  />
                )}{" "}
                {row.locationInstructions && (
                  <PrivateText
                    key={row.id + "location"}
                    label={t({
                      en: "private location instructions",
                      ar: "تعليمات الموقع الخاصة",
                    })}
                    value={row.locationInstructions}
                  />
                )}
                <div className="membership-actions">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setEdit({
                        operation:
                          "post_api_v1_mentorship_sessions_by_id_cancel",
                        title: t({
                          en: "Cancel mentorship session",
                          ar: "إلغاء جلسة الإرشاد",
                        }),
                        path: { id: row.id },
                        initial: { version: row.version },
                        requireFields: ["reason"],
                        hiddenFields: actionHidden,
                      })
                    }
                  >
                    {t({
                      en: "Review session cancellation",
                      ar: "مراجعة إلغاء الجلسة",
                    })}
                  </Button>
                  {mentor && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          operation:
                            "post_api_v1_mentor_sessions_by_id_complete",
                          title: t({
                            en: "Complete mentorship session",
                            ar: "إكمال جلسة الإرشاد",
                          }),
                          path: { id: row.id },
                          initial: { version: row.version },
                          hiddenFields: actionHidden,
                        })
                      }
                    >
                      {t({
                        en: "Review session completion",
                        ar: "مراجعة إكمال الجلسة",
                      })}
                    </Button>
                  )}
                  {!mentor && /^completed$/i.test(row.status) && (
                    <Button
                      onClick={() =>
                        setEdit({
                          operation:
                            "post_api_v1_mentorship_sessions_by_id_feedback",
                          title: t({
                            en: "Send session feedback",
                            ar: "إرسال تقييم الجلسة",
                          }),
                          path: { id: row.id },
                          initial: { isVisibleToMentor: false },
                          requireFields: ["rating"],
                          description: t({
                            en: "Comments are private unless you explicitly choose to share them with the mentor.",
                            ar: "التعليقات خاصة ما لم تختر صراحة مشاركتها مع المرشد.",
                          }),
                        })
                      }
                    >
                      {t({ en: "Review feedback", ar: "مراجعة التقييم" })}
                    </Button>
                  )}
                </div>
              </article>
            ))}
            <Pager
              page={sessionPage}
              total={sessions.data.totalItems}
              onChange={setSessionPage}
            />
          </>
        )}
      </Panel>
      {edit && <EditDialog edit={edit} onClose={() => setEdit(null)} />}
    </>
  );
}
export function MentorProfile({
  admin = false,
  selectedId = "",
  permissions = [],
}: {
  admin?: boolean;
  selectedId?: string;
  permissions?: string[];
}) {
  const { api, owner } = useMembershipConnection(),
    { t } = useLocale(),
    [lookup, setLookup] = useState(selectedId),
    [id, setId] = useState(selectedId),
    [page, setPage] = useState(1),
    [edit, setEdit] = useState<Edit | null>(null),
    [lastSave, setLastSave] = useState<Record<string, unknown> | null>(null),
    canEdit = !admin || permissions.includes("mentorship.mentors.approve"),
    q = useMembershipQuery(
      admin ? "admin-mentor" : "owned-mentor",
      (signal) =>
        admin
          ? api.get_api_v1_admin_mentors_by_id({ path: { id }, signal })
          : api.get_api_v1_mentors_by_id({ path: { id }, signal }),
      id,
      !!id && !!owner,
      true,
    ),
    slots = useMembershipQuery(
      "profile-availability",
      (signal) =>
        api.get_api_v1_mentors_by_id_availability({
          path: { id },
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      [id, page],
      !!id && !!owner,
      true,
    ),
    feedback = useMembershipQuery(
      admin ? "admin-mentor-feedback" : "mentor-feedback",
      (signal) =>
        admin
          ? api.get_api_v1_admin_mentors_by_id_feedback({
              path: { id },
              signal,
            })
          : api.get_api_v1_mentor_by_id_feedback({ path: { id }, signal }),
      id,
      !!id &&
        !!owner &&
        (!admin || permissions.includes("mentorship.reports.view")),
      true,
    );
  return (
    <>
      <Panel
        title={t({
          en: admin ? "Mentor profile management" : "My mentor profile",
          ar: admin ? "إدارة ملف المرشد" : "ملف المرشد الخاص بي",
        })}
      >
        {canEdit && (
          <Button
            onClick={() =>
              setEdit({
                operation: admin
                  ? "post_api_v1_admin_mentors"
                  : "post_api_v1_mentor_profile",
                title: t({ en: "Create mentor profile", ar: "إنشاء ملف مرشد" }),
                initial: {
                  userId: admin ? null : owner,
                  supportsIndividual: true,
                  supportsGroup: false,
                  supportsOnline: true,
                  supportsInPerson: false,
                  defaultCapacity: 1,
                  areaIds: [],
                },
                description: t({
                  en: "Profiles require approval. Creation does not publish the profile.",
                  ar: "تحتاج الملفات إلى اعتماد. الإنشاء لا ينشر الملف.",
                }),
              })
            }
          >
            {t({ en: "New mentor profile", ar: "ملف مرشد جديد" })}
          </Button>
        )}
        {!admin && (
          <>
            <p>
              {t({
                en: "Open a known profile ID. Swagger has no private “my mentor profile” read. Pending profiles can be edited from the copy captured by your last save in this session.",
                ar: "افتح معرّف ملف معروف. لا يوفر العقد قراءة خاصة لملف المرشد الحالي. يمكن تعديل الملفات المعلقة من نسخة آخر حفظ في هذه الجلسة.",
              })}
            </p>
            <div className="membership-toolbar">
              <label>
                {t({ en: "Mentor profile ID", ar: "معرّف ملف المرشد" })}
                <input
                  value={lookup}
                  onChange={(e) => setLookup(e.target.value)}
                />
              </label>
              <Button onClick={() => setId(lookup)}>
                {t({ en: "Open mentor profile", ar: "فتح ملف المرشد" })}
              </Button>
            </div>
          </>
        )}
        {id && <QueryStatus query={q} />}{" "}
        {q.data && (
          <>
            <Facts
              value={{
                id: q.data.id,
                name: q.data.displayNameSnapshot,
                status: q.data.status,
              }}
            />
            {canEdit && (
              <Button
                variant="outline"
                onClick={() =>
                  setEdit({
                    operation: admin
                      ? "put_api_v1_admin_mentors_by_id"
                      : "put_api_v1_mentor_profile_by_id",
                    title: t({
                      en: "Save mentor profile",
                      ar: "حفظ ملف المرشد",
                    }),
                    path: { id },
                    initial: mentorDraft(q.data),
                  })
                }
              >
                {t({ en: "Edit mentor profile", ar: "تعديل ملف المرشد" })}
              </Button>
            )}
            {admin && (
              <div className="membership-actions">
                {(
                  [
                    {
                      operation: "post_api_v1_admin_mentors_by_id_approve",
                      permission: "mentorship.mentors.approve",
                      en: "Approve mentor",
                      ar: "اعتماد المرشد",
                    },
                    {
                      operation: "post_api_v1_admin_mentors_by_id_pause",
                      permission: "mentorship.mentors.pause",
                      en: "Pause mentor",
                      ar: "إيقاف المرشد مؤقتاً",
                    },
                    {
                      operation: "post_api_v1_admin_mentors_by_id_archive",
                      permission: "mentorship.mentors.pause",
                      en: "Archive mentor",
                      ar: "أرشفة المرشد",
                    },
                  ] as const
                )
                  .filter((a) => permissions.includes(a.permission))
                  .map((a) => (
                    <Button
                      key={a.operation}
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          operation: a.operation,
                          title: t(a),
                          path: { id },
                          initial: { version: q.data.version },
                          requireFields: ["reason"],
                          hiddenFields: actionHidden,
                        })
                      }
                    >
                      {t(a)}
                    </Button>
                  ))}
              </div>
            )}
          </>
        )}
        {!admin && lastSave && (
          <section className="membership-card">
            <p>
              {t({
                en: "Captured from your last profile save; this is not a fresh private detail read.",
                ar: "نسخة ملتقطة من آخر حفظ لملفك؛ وليست قراءة خاصة حديثة.",
              })}
            </p>
            <Facts value={{ id: lastSave.id }} />
            <Button
              variant="outline"
              onClick={() =>
                setEdit({
                  operation: "put_api_v1_mentor_profile_by_id",
                  title: t({
                    en: "Save captured mentor profile",
                    ar: "حفظ نسخة ملف المرشد",
                  }),
                  path: { id: string(lastSave.id) },
                  initial: lastSave,
                })
              }
            >
              {t({ en: "Edit last saved profile", ar: "تعديل آخر ملف محفوظ" })}
            </Button>
          </section>
        )}
      </Panel>
      {id && (
        <>
          <Panel
            title={t({
              en: "Availability and questions",
              ar: "المواعيد والأسئلة",
            })}
          >
            <Button
              onClick={() =>
                setEdit({
                  operation: "post_api_v1_mentor_availability",
                  title: t({
                    en: "Create mentor time slot",
                    ar: "إنشاء موعد مرشد",
                  }),
                  initial: {
                    mentorProfileId: id,
                    capacity: 1,
                    mode: "Online",
                    sessionType: "Individual",
                  },
                  hiddenFields: ["mentorProfileId"],
                  description: t({
                    en: "Use offset-bearing times. Meeting details are private; overlap overrides require server permission.",
                    ar: "استخدم أوقاتاً مع فرق التوقيت. تفاصيل الاجتماع خاصة؛ وتجاوز التداخل يحتاج صلاحية الخادم.",
                  }),
                })
              }
            >
              {t({ en: "New time slot", ar: "موعد جديد" })}
            </Button>
            <QueryStatus query={slots} />
            {slots.data && (
              <>
                {slots.data.items.map((row) => (
                  <article key={row.id} className="membership-card">
                    <Facts value={row} />
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEdit({
                          operation: "put_api_v1_mentor_availability_by_id",
                          title: t({
                            en: "Save mentor time slot",
                            ar: "حفظ موعد المرشد",
                          }),
                          path: { id: row.id },
                          initial: slotDraft(row, id),
                          hiddenFields: ["mentorProfileId"],
                          description: t({
                            en: "The public availability read omits meeting secrets and saved presentation. Re-enter the complete intended values before saving; blank values may clear them.",
                            ar: "لا تعرض القراءة العامة أسرار الاجتماع وتفاصيل العرض المحفوظة. أعد إدخال القيم المقصودة كاملة قبل الحفظ؛ وقد تمسح القيم الفارغة البيانات.",
                          }),
                        })
                      }
                    >
                      {t({ en: "Edit time slot", ar: "تعديل الموعد" })}
                    </Button>
                  </article>
                ))}
                <Pager
                  page={page}
                  total={slots.data.totalItems}
                  onChange={setPage}
                />
              </>
            )}
            <Button
              variant="outline"
              onClick={() =>
                setEdit({
                  operation: "post_api_v1_mentor_by_id_questions",
                  title: t({
                    en: "Create mentor question",
                    ar: "إنشاء سؤال للمرشد",
                  }),
                  path: { id },
                  initial: {
                    active: true,
                    required: false,
                    displayOrder: 0,
                    options: [],
                  },
                })
              }
            >
              {t({ en: "New mentor question", ar: "سؤال مرشد جديد" })}
            </Button>
            {q.data?.questions.map((row) => (
              <article className="membership-card" key={row.id}>
                <p>
                  {row.textAr} {row.textEn}
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setEdit({
                      operation:
                        "put_api_v1_mentor_by_id_questions_by_questionId",
                      title: t({
                        en: "Save mentor question",
                        ar: "حفظ سؤال المرشد",
                      }),
                      path: { id, questionId: row.id },
                      initial: { ...row, options: parsed(row.optionsJson) },
                      manualVersion: true,
                      requireFields: ["version", "displayOrder", "active"],
                      description: t({
                        en: "The mentor detail omits question version, display order and active state. Supply the authoritative question values; the mentor version is a different record.",
                        ar: "لا يعرض ملف المرشد نسخة السؤال وترتيبه وحالة تفعيله. أدخل قيم السؤال المعتمدة؛ نسخة المرشد تخص سجلاً آخر.",
                      }),
                    })
                  }
                >
                  {t({ en: "Edit mentor question", ar: "تعديل سؤال المرشد" })}
                </Button>
              </article>
            ))}
          </Panel>
          <Panel title={t({ en: "Mentor feedback", ar: "تقييم المرشد" })}>
            <QueryStatus query={feedback} />
            {feedback.data && (
              <>
                <Facts
                  value={{
                    count: feedback.data.count,
                    averageRating: feedback.data.averageRating,
                  }}
                />
                <Table value={feedback.data.comments} />
              </>
            )}
          </Panel>
        </>
      )}
      {edit && (
        <EditDialog
          edit={edit}
          onClose={() => setEdit(null)}
          onSaved={(v, body) => {
            if (
              edit.operation === "post_api_v1_mentor_profile" ||
              edit.operation === "put_api_v1_mentor_profile_by_id"
            ) {
              const r = record(v);
              setLastSave({ ...body, id: r.id, version: r.version });
              setId(string(r.id));
              setLookup(string(r.id));
            }
            if (edit.operation === "post_api_v1_admin_mentors") {
              setId(string(record(v).id));
              setLookup(string(record(v).id));
            }
          }}
        />
      )}
    </>
  );
}
