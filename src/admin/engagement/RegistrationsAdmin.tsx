import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { record, string } from "../../services/api/mapping";
import type { Schemas } from "../../services/api/schema.generated";
import {
  useEngagementConnection,
  useEngagementQuery,
  QueryStatus,
  Pager,
  Empty,
  rows,
} from "../../features/engagement/shared";
import {
  EngagementEditor,
  EngagementConfirm,
} from "../../features/engagement/Forms";
export function EventRegistrationsAdmin({
  eventId,
  eventVersion,
  permissions,
}: {
  eventId: string;
  eventVersion: string;
  permissions: string[];
}) {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [wPage, setWPage] = useState(1),
    [registrationId, setRegistrationId] = useState(""),
    [manual, setManual] = useState(false),
    [promote, setPromote] = useState<{ id?: string; version: string } | null>(
      null,
    ),
    can = (p: string) => permissions.includes(p);
  const list = useEngagementQuery(
      "event-registrations",
      (signal) =>
        api.get_api_v1_admin_events_by_id_registrations({
          path: { id: eventId },
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      [eventId, page],
      can("events.registrations.view"),
      true,
    ),
    answers = useEngagementQuery(
      "registration-answers",
      (signal) =>
        api.get_api_v1_admin_events_by_id_registrations_by_registrationId_answers(
          { path: { id: eventId, registrationId }, signal },
        ),
      [eventId, registrationId],
      !!registrationId && can("events.registrations.view"),
      true,
    ),
    waitlist = useEngagementQuery(
      "event-waitlist",
      (signal) =>
        api.get_api_v1_admin_events_by_id_waitlist({
          path: { id: eventId },
          query: { Page: wPage, PageSize: 20 },
          signal,
        }),
      [eventId, wPage],
      can("events.waitlist.manage"),
      true,
    );
  return (
    <section>
      {can("events.registrations.add_manual") && (
        <Button onClick={() => setManual(true)}>
          {t({ en: "Register a student manually", ar: "تسجيل طالب يدويًا" })}
        </Button>
      )}
      {can("events.registrations.view") && (
        <>
          <h3>{t({ en: "Registrations", ar: "التسجيلات" })}</h3>
          <QueryStatus query={list} />
          {list.data && (
            <>
              {rows(list.data.items).map((r) => (
                <div className="engagement-row" key={string(r.id)}>
                  <div>
                    <strong>{string(r.userId)}</strong>
                    <p>
                      {string(r.status)} · {string(r.registrationSource)} ·{" "}
                      {string(r.registeredAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setRegistrationId(string(r.id))}
                  >
                    {t({ en: "Submitted answers", ar: "الإجابات المرسلة" })}
                  </Button>
                </div>
              ))}
              <Empty items={rows(list.data.items)} />
              <Pager
                page={page}
                total={Number(list.data.totalItems)}
                onChange={setPage}
              />
            </>
          )}
          {registrationId && (
            <>
              <QueryStatus query={answers} />
              {rows(answers.data).map((answer) => {
                let question: unknown, answerValue: unknown;
                try {
                  question = JSON.parse(string(answer.questionSnapshotJson));
                } catch {
                  question = answer.questionSnapshotJson;
                }
                try {
                  answerValue = JSON.parse(string(answer.answerJson));
                } catch {
                  answerValue = answer.answerJson;
                }
                return (
                  <div className="engagement-row" key={string(answer.id)}>
                    <div>
                      <strong>
                        {string(record(question).textAr) ||
                          string(record(question).textEn) ||
                          string(record(question).text) ||
                          JSON.stringify(question)}
                      </strong>
                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {typeof answerValue === "string"
                          ? answerValue
                          : JSON.stringify(answerValue)}
                      </p>
                      <small>
                        {t({ en: "Attempt", ar: "المحاولة" })}{" "}
                        {Number(answer.attempt)}
                      </small>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
      {can("events.waitlist.manage") && (
        <>
          <h3>{t({ en: "Waiting list", ar: "قائمة الانتظار" })}</h3>
          <Button
            variant="outline"
            disabled={!eventVersion}
            onClick={() => setPromote({ version: eventVersion })}
          >
            {t({
              en: "Offer next seat in order",
              ar: "عرض المقعد التالي بالترتيب",
            })}
          </Button>
          <QueryStatus query={waitlist} />
          {waitlist.data && (
            <>
              {rows(waitlist.data.items).map((entry) => (
                <div className="engagement-row" key={string(entry.id)}>
                  <div>
                    <strong>
                      #{Number(entry.queueSequence)} ·{" "}
                      {string(entry.registrationId)}
                    </strong>
                    <p>
                      {string(entry.status)} · {string(entry.offerExpiresAt)} ·{" "}
                      {string(entry.skipReason)}
                    </p>
                  </div>
                  {can("events.waitlist.override_fifo") && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setPromote({
                          id: string(entry.id),
                          version: string(entry.version),
                        })
                      }
                    >
                      {t({
                        en: "Override order and offer seat",
                        ar: "تجاوز الترتيب وعرض المقعد",
                      })}
                    </Button>
                  )}
                </div>
              ))}
              <Empty items={rows(waitlist.data.items)} />
              <Pager
                page={wPage}
                total={Number(waitlist.data.totalItems)}
                onChange={setWPage}
              />
            </>
          )}
        </>
      )}
      {manual && (
        <EngagementEditor
          title={t({ en: "Manual registration", ar: "تسجيل يدوي" })}
          schema="EventManualRegistrationRequest"
          initial={{ userId: "", reason: "", answers: [] }}
          onClose={() => setManual(false)}
          onSave={(body) =>
            api.post_api_v1_admin_events_by_id_registrations({
              path: { id: eventId },
              body: body as Schemas["EventManualRegistrationRequest"],
            })
          }
          description={t({
            en: "Use the published question IDs for any answers. Registration and capacity are checked by the server.",
            ar: "استخدم معرّفات الأسئلة المنشورة للإجابات. يتحقق الخادم من التسجيل والسعة.",
          })}
        />
      )}
      {promote && (
        <EngagementConfirm
          title={t(
            promote.id
              ? {
                  en: "Override waiting-list order",
                  ar: "تجاوز ترتيب الانتظار",
                }
              : { en: "Offer the next seat", ar: "عرض المقعد التالي" },
          )}
          version={promote.version}
          onClose={() => setPromote(null)}
          onExecute={(body) =>
            promote.id
              ? api.post_api_v1_admin_events_by_id_waitlist_by_entryId_override_promote(
                  { path: { id: eventId, entryId: promote.id }, body },
                )
              : api.post_api_v1_admin_events_by_id_waitlist_promote_next({
                  path: { id: eventId },
                  body,
                })
          }
        >
          <p>
            {t({
              en: "An offer still needs the student’s confirmation. It is not a confirmed registration.",
              ar: "يظل العرض بحاجة إلى تأكيد الطالب ولا يُعد تسجيلًا مؤكدًا.",
            })}
          </p>
        </EngagementConfirm>
      )}
    </section>
  );
}
