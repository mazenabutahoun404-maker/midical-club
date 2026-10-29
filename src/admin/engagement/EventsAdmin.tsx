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
import { localizedField, eventDraft } from "../../features/engagement/model";
import {
  EngagementEditor,
  EngagementConfirm,
} from "../../features/engagement/Forms";
import { EventFacts } from "../../features/engagement/Events";
import { EventRegistrationsAdmin } from "./RegistrationsAdmin";
import { AttendanceAdmin } from "./AttendanceAdmin";
import { EventCertificatesAdmin } from "./CertificatesAdmin";
import { EventReports } from "./Reports";
export function EventsAdmin({ permissions }: { permissions: string[] }) {
  const { api } = useEngagementConnection(),
    { t, locale } = useLocale(),
    [page, setPage] = useState(1),
    [id, setId] = useState(""),
    [entered, setEntered] = useState(""),
    [create, setCreate] = useState(false),
    can = (p: string) => permissions.includes("events." + p),
    list = useEngagementQuery(
      "admin-events",
      (signal) =>
        api.get_api_v1_admin_events({
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      page,
      can("view_admin"),
      true,
    );
  return (
    <>
      <Panel title={t({ en: "Events", ar: "الفعاليات" })}>
        {can("create") && (
          <Button onClick={() => setCreate(true)}>
            {t({ en: "New event draft", ar: "مسودة فعالية جديدة" })}
          </Button>
        )}
        {can("view_admin") && (
          <>
            <QueryStatus query={list} />
            {list.data && (
              <>
                {rows(list.data.items).map((event) => (
                  <button
                    className="engagement-record"
                    key={string(event.id)}
                    onClick={() => setId(string(event.id))}
                  >
                    <strong>{localizedField(event, "title", locale)}</strong>
                    <span>
                      {string(event.status)} · {string(event.startsAt)}
                    </span>
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
          </>
        )}
        <form
          className="engagement-toolbar"
          onSubmit={(e) => {
            e.preventDefault();
            setId(entered.trim());
          }}
        >
          <label>
            {t({ en: "Open an event by ID", ar: "فتح فعالية بالمعرّف" })}
            <input
              required
              value={entered}
              onChange={(e) => setEntered(e.target.value)}
            />
          </label>
          <Button variant="outline" type="submit">
            {t({ en: "Open", ar: "فتح" })}
          </Button>
        </form>
      </Panel>
      {id && <AdminEventRecord key={id} id={id} permissions={permissions} />}{" "}
      {create && (
        <EngagementEditor
          title={t({ en: "New event draft", ar: "مسودة فعالية جديدة" })}
          schema="EventDefinition"
          initial={{
            slug: "",
            titleAr: "",
            timezoneId: "Asia/Amman",
            locationMode: "",
            attendanceMode: "",
            certificateRule: "",
            capacity: null,
            waitlistEnabled: false,
            promotionConfirmationHours: 24,
            certificateEnabled: false,
            autoIssueCertificates: false,
            evaluationEnabled: false,
            volunteerHoursEnabled: false,
            audiences: [],
            registrationQuestions: [],
            evaluationQuestions: [],
            assets: [],
          }}
          onSave={(body) =>
            api.post_api_v1_admin_events({
              body: body as Schemas["EventDefinition"],
            })
          }
          onClose={() => setCreate(false)}
          description={t({
            en: "Saving creates a draft. Publication is a separate reviewed action. Times require explicit UTC offsets.",
            ar: "ينشئ الحفظ مسودة. النشر إجراء منفصل بعد المراجعة. تتطلب الأوقات فرق التوقيت.",
          })}
        />
      )}
    </>
  );
}
function AdminEventRecord({
  id,
  permissions,
}: {
  id: string;
  permissions: string[];
}) {
  const { api } = useEngagementConnection(),
    { t, locale } = useLocale(),
    [tab, setTab] = useState("definition"),
    [editing, setEditing] = useState<Record<string, unknown> | null>(null),
    [command, setCommand] = useState<{
      kind: "publish" | "cancel" | "complete" | "archive";
      version: string;
    } | null>(null),
    action = useEngagementAction(),
    can = (p: string) => permissions.includes(p),
    q = useEngagementQuery(
      "admin-event",
      (signal) => api.get_api_v1_admin_events_by_id({ path: { id }, signal }),
      id,
      can("events.view_admin"),
      true,
    ),
    event = record(q.data?.event);
  const tabs = [
    ...(can("events.view_admin")
      ? [{ id: "definition", label: t({ en: "Definition", ar: "التعريف" }) }]
      : []),
    ...(can("events.registrations.view") ||
    can("events.waitlist.manage") ||
    can("events.registrations.add_manual")
      ? [
          {
            id: "registrations",
            label: t({
              en: "Registrations & waiting list",
              ar: "التسجيلات وقائمة الانتظار",
            }),
          },
        ]
      : []),
    ...(can("attendance.view") ||
    can("attendance.override") ||
    can("attendance.correct")
      ? [{ id: "attendance", label: t({ en: "Attendance", ar: "الحضور" }) }]
      : []),
    ...(can("certificates.issue") ||
    can("certificates.revoke") ||
    can("certificates.reissue")
      ? [
          {
            id: "certificates",
            label: t({ en: "Certificates", ar: "الشهادات" }),
          },
        ]
      : []),
    { id: "reports", label: t({ en: "Reports", ar: "التقارير" }) },
  ];
  const selected = tabs.some((x) => x.id === tab) ? tab : tabs[0]?.id;
  async function execute(body: { version?: string; reason: string }) {
    if (command?.kind === "publish")
      return api.post_api_v1_admin_events_by_id_publish({ path: { id }, body });
    if (command?.kind === "cancel")
      return api.post_api_v1_admin_events_by_id_cancel({ path: { id }, body });
    if (command?.kind === "complete")
      return api.post_api_v1_admin_events_by_id_complete({
        path: { id },
        body,
      });
    return api.post_api_v1_admin_events_by_id_archive({ path: { id }, body });
  }
  return (
    <Panel title={localizedField(event, "title", locale) || id}>
      <div className="student-connected-actions">
        {tabs.map((item) => (
          <Button
            key={item.id}
            variant={selected === item.id ? "default" : "outline"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {selected === "definition" && (
        <>
          <QueryStatus query={q} />
          {q.data && (
            <>
              <p>
                {string(event.status)} · {q.data.temporalStatus}
              </p>
              <EventFacts event={event} />
              {q.data.linkedContentWarning && (
                <p>
                  {t({
                    en: "The server reports a linked-content warning. Review it before publication.",
                    ar: "يُبلغ الخادم عن تحذير في المحتوى المرتبط. راجعه قبل النشر.",
                  })}
                </p>
              )}
              <div className="student-connected-actions">
                {can("events.update") && (
                  <Button
                    onClick={() =>
                      void action.run(
                        async () => eventDraft(q.data),
                        setEditing,
                        "",
                        false,
                      )
                    }
                  >
                    {t({
                      en: "Edit saved draft",
                      ar: "تعديل المسودة المحفوظة",
                    })}
                  </Button>
                )}
                {(["publish", "cancel", "complete", "archive"] as const)
                  .filter((kind) => can("events." + kind))
                  .map((kind) => (
                    <Button
                      key={kind}
                      variant="outline"
                      onClick={() =>
                        setCommand({ kind, version: string(event.version) })
                      }
                    >
                      {t(
                        kind === "publish"
                          ? { en: "Publish", ar: "نشر" }
                          : kind === "cancel"
                            ? { en: "Cancel event", ar: "إلغاء الفعالية" }
                            : kind === "complete"
                              ? { en: "Complete event", ar: "إنهاء الفعالية" }
                              : { en: "Archive", ar: "أرشفة" },
                      )}
                    </Button>
                  ))}
              </div>
              {action.feedback}
              <details className="engagement-json">
                <summary>
                  {t({
                    en: "Complete saved draft and history",
                    ar: "المسودة المحفوظة الكاملة والسجل",
                  })}
                </summary>
                <pre>{JSON.stringify(q.data.draft, null, 2)}</pre>
                {rows(q.data.history).map((h) => (
                  <p key={string(h.id)}>
                    {string(h.occurredAt)} · {string(h.action)} ·{" "}
                    {string(h.reason)}
                  </p>
                ))}
              </details>
            </>
          )}
        </>
      )}
      {selected === "registrations" && (
        <EventRegistrationsAdmin
          eventId={id}
          eventVersion={string(event.version)}
          permissions={permissions}
        />
      )}
      {selected === "attendance" && (
        <AttendanceAdmin eventId={id} permissions={permissions} />
      )}
      {selected === "certificates" && (
        <EventCertificatesAdmin
          eventId={id}
          eventVersion={string(event.version)}
          permissions={permissions}
        />
      )}
      {selected === "reports" && (
        <EventReports eventId={id} permissions={permissions} />
      )}
      {editing && (
        <EngagementEditor
          title={t({ en: "Event draft", ar: "مسودة الفعالية" })}
          schema="EventDefinition"
          initial={editing}
          version={string(event.version)}
          onSave={(body) =>
            api.put_api_v1_admin_events_by_id({
              path: { id },
              body: body as Schemas["EventDefinition"],
            })
          }
          onClose={() => setEditing(null)}
          description={t({
            en: "This replaces the complete reviewed draft. Audience, questions and assets are retained. Saving does not publish.",
            ar: "يستبدل هذا المسودة الكاملة المراجعة. يُحتفظ بالجمهور والأسئلة والملفات. الحفظ لا ينشر.",
          })}
        />
      )}
      {command && (
        <EngagementConfirm
          title={t({ en: command.kind + " event", ar: "إجراء على الفعالية" })}
          version={command.version}
          onClose={() => setCommand(null)}
          onExecute={execute}
        >
          <p>
            {localizedField(event, "title", locale)} · {id}
          </p>
          {command.kind === "complete" && (
            <p>
              {t({
                en: "Completion may trigger configured certificate/hour workers. Their results are checked separately.",
                ar: "قد يشغّل الإنهاء مهام الشهادات والساعات المهيأة. تُراجع نتائجها بشكل منفصل.",
              })}
            </p>
          )}
        </EngagementConfirm>
      )}
    </Panel>
  );
}
