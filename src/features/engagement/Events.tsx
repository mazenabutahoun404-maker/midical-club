import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { AppLink } from "../../components/navigation/AppLink";
import { HeroArtwork } from "../../components/data-display/HeroArtwork";
import { record, string } from "../../services/api/mapping";
import { engagementUrl } from "../../services/api/engagement-contracts";
import { qrcodegen } from "../../vendor/qrcode/qrcodegen";
import {
  useEngagementConnection,
  useEngagementQuery,
  useEngagementAction,
  QueryStatus,
  Panel,
  Pager,
  Empty,
  rows,
} from "./shared";
import { localizedField, dynamicAnswers, canShowAttendancePass } from "./model";
import { DynamicQuestions, EngagementConfirm } from "./Forms";
export function EventCatalog() {
  const { api } = useEngagementConnection(),
    { label, locale } = useLocale(),
    [page, setPage] = useState(1),
    [from, setFrom] = useState(""),
    q = useEngagementQuery(
      "events",
      (signal) =>
        api.get_api_v1_events({
          query: { Page: page, PageSize: 20, From: from || undefined },
          signal,
        }),
      [page, from],
    );
  return (
    <div className="container discovery-page event-hub engagement-page">
      <section className="discovery-hero event-discovery-hero artwork-scene">
        <div className="discovery-hero-copy">
          <span className="eyebrow">{label("eventsHubEyebrow")}</span>
          <h1 data-page-heading tabIndex={-1}>
            {label("eventsHubTitle")}
          </h1>
          <p>{label("eventsHubBody")}</p>
        </div>
        <HeroArtwork section="involved" />
      </section>
      <label className="engagement-date-filter">
        {label("date")}
        <input
          type="date"
          value={from ? from.slice(0, 10) : ""}
          onChange={(e) => {
            setPage(1);
            setFrom(e.target.value ? e.target.value + "T00:00:00+03:00" : "");
          }}
        />
      </label>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <div className="event-ticket-grid">
            {rows(q.data.items).map((event) => (
              <article className="engagement-ticket" key={string(event.id)}>
                <span className="eyebrow">{string(event.status)}</span>
                <h2>
                  <AppLink
                    href={"/events/" + encodeURIComponent(string(event.slug))}
                  >
                    {localizedField(event, "title", locale)}
                  </AppLink>
                </h2>
                <p>{localizedField(event, "summary", locale)}</p>
                <EventFacts event={event} />
              </article>
            ))}
          </div>
          <Empty items={rows(q.data.items)} />
          <Pager
            page={page}
            total={Number(q.data.totalItems)}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
export function EventFacts({ event }: { event: Record<string, unknown> }) {
  const { locale, t } = useLocale();
  return (
    <dl className="engagement-facts">
      {[
        ["startsAt", { en: "Starts", ar: "البداية" }],
        ["endsAt", { en: "Ends", ar: "النهاية" }],
      ].map(([key, label]) =>
        event[key as string] ? (
          <div key={key as string}>
            <dt>{t(label as { en: string; ar: string })}</dt>
            <dd>
              <time dateTime={string(event[key as string])}>
                {new Date(string(event[key as string])).toLocaleString(locale, {
                  timeZone: string(event.timezoneId) || "Asia/Amman",
                })}
              </time>
            </dd>
          </div>
        ) : null,
      )}
      <div>
        <dt>{t({ en: "Location", ar: "المكان" })}</dt>
        <dd>
          {localizedField(event, "locationName", locale) ||
            string(event.locationMode)}
        </dd>
      </div>
      {"capacity" in event && (
        <div>
          <dt>{t({ en: "Capacity", ar: "السعة" })}</dt>
          <dd>
            {event.capacity == null
              ? t({ en: "No declared limit", ar: "لا يوجد حد معلن" })
              : Number(event.capacity)}
          </dd>
        </div>
      )}
    </dl>
  );
}
export function EventDetail() {
  const { slug } = useParams(),
    { owner, session } = useEngagementConnection();
  return <EventDetailBody key={String(owner) + session + slug} slug={slug!} />;
}
function EventDetailBody({ slug }: { slug: string }) {
  const { api, owner } = useEngagementConnection(),
    { locale, label, t } = useLocale(),
    q = useEngagementQuery(
      "event",
      (signal) => api.get_api_v1_events_by_slug({ path: { slug }, signal }),
      slug,
    ),
    event = record(q.data?.event);
  return (
    <div className="container event-detail-page engagement-page">
      <AppLink className="detail-back" href="/events">
        {label("events")}
      </AppLink>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <section className="event-detail-hero">
            <div>
              <span className="eyebrow">
                {string(event.status)} · {q.data.temporalStatus}
              </span>
              <h1 data-page-heading tabIndex={-1}>
                {localizedField(event, "title", locale)}
              </h1>
              <p>{localizedField(event, "summary", locale)}</p>
              <EventFacts event={event} />
            </div>
          </section>
          <div className="event-detail-layout">
            <section className="event-agenda-panel">
              <h2>{t({ en: "About this event", ar: "عن هذه الفعالية" })}</h2>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {localizedField(event, "description", locale)}
              </p>
              <p>{localizedField(event, "locationInstructions", locale)}</p>
              {engagementUrl(event.publicOnlineUrl) && (
                <a
                  href={engagementUrl(event.publicOnlineUrl)!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t({ en: "Open online event link", ar: "فتح رابط الفعالية" })}
                </a>
              )}
              {rows(q.data.assets).map((asset) => (
                <AssetAction
                  key={string(asset.assetId)}
                  assetId={string(asset.assetId)}
                  label={string(asset.usageKey)}
                />
              ))}
            </section>
            <aside className="event-registration-panel">
              {owner ? (
                <EventParticipation
                  eventId={string(event.id)}
                  questions={rows(q.data.questions)}
                  evaluation={event.evaluationEnabled === true}
                />
              ) : (
                <AppLink className="button button-primary" href="/auth/sign-in">
                  {t({ en: "Sign in to register", ar: "سجّل الدخول للتسجيل" })}
                </AppLink>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
function RegistrationForm({
  eventId,
  questions,
  onClose,
}: {
  eventId: string;
  questions: Record<string, unknown>[];
  onClose: () => void;
}) {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    [captured] = useState(() => structuredClone(questions)),
    [answers, setAnswers] = useState<Record<string, unknown>>({}),
    action = useEngagementAction();
  return (
    <Modal
      open
      title={t({ en: "Register for event", ar: "التسجيل في الفعالية" })}
      description={t({
        en: "Submit your answers. The server determines registration or waiting-list status.",
        ar: "أرسل إجاباتك. يحدد الخادم حالة التسجيل أو قائمة الانتظار.",
      })}
      className="engagement-modal"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(
            () =>
              api.post_api_v1_events_by_id_register({
                path: { id: eventId },
                body: { answers: dynamicAnswers(captured, answers) },
              }),
            onClose,
          );
        }}
      >
        <DynamicQuestions
          questions={captured}
          value={answers}
          onChange={setAnswers}
        />
        {action.feedback}
        <Button type="submit" disabled={action.busy}>
          {t({ en: "Submit registration", ar: "إرسال التسجيل" })}
        </Button>
      </form>
    </Modal>
  );
}
export function EventParticipation({
  eventId,
  questions,
  evaluation = false,
}: {
  eventId: string;
  questions?: Record<string, unknown>[];
  evaluation?: boolean;
}) {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    [register, setRegister] = useState(false),
    [command, setCommand] = useState<
      "cancel" | "confirm" | "regenerate" | null
    >(null),
    [token, setToken] = useState(""),
    action = useEngagementAction(),
    q = useEngagementQuery(
      "my-registration",
      (signal) =>
        api.get_api_v1_events_by_id_registration_my({
          path: { id: eventId },
          signal,
        }),
      eventId,
      true,
      true,
    ),
    r = record(q.data),
    absent =
      (q.error && "status" in q.error && q.error.status === 404) ||
      q.data === null;
  const active =
    !!r.id &&
    !["cancelled", "canceled", "expired", "rejected"].includes(
      string(r.status).toLowerCase(),
    );
  const offered =
    active &&
    !!r.promotionExpiresAt &&
    Date.parse(string(r.promotionExpiresAt)) > Date.now();
  const canPass = canShowAttendancePass(r);
  return (
    <section className="engagement-participation">
      <h2>{t({ en: "Your registration", ar: "تسجيلك" })}</h2>
      {!absent && <QueryStatus query={q} />}{" "}
      {!!r.id && (
        <>
          <p>{string(r.status)}</p>
          {active && !canPass && r.waitlistPosition != null && (
            <p>
              {t({ en: "Waiting-list position", ar: "ترتيب قائمة الانتظار" })}:{" "}
              {Number(r.waitlistPosition)}
            </p>
          )}
          {!!r.promotionExpiresAt && (
            <p>
              {t({ en: "Offer expires", ar: "تنتهي فرصة التأكيد" })}:{" "}
              {string(r.promotionExpiresAt)}
            </p>
          )}
        </>
      )}
      {(absent || (!active && !!r.id)) && questions && (
        <Button onClick={() => setRegister(true)}>
          {t({ en: "Register", ar: "تسجيل" })}
        </Button>
      )}
      {active && (
        <>
          <div className="student-connected-actions">
            {offered && (
              <Button onClick={() => setCommand("confirm")}>
                {t({ en: "Confirm offered seat", ar: "تأكيد المقعد المعروض" })}
              </Button>
            )}
            <Button variant="outline" onClick={() => setCommand("cancel")}>
              {t({ en: "Cancel registration", ar: "إلغاء التسجيل" })}
            </Button>
            {canPass && (
              <>
                <Button
                  variant="outline"
                  disabled={action.busy}
                  onClick={() =>
                    void action.run(
                      () =>
                        api.get_api_v1_events_by_id_attendance_qr_my({
                          path: { id: eventId },
                        }),
                      (result) => setToken(result.token),
                      t({
                        en: "Attendance pass loaded",
                        ar: "حُمّلت بطاقة الحضور",
                      }),
                      false,
                    )
                  }
                >
                  {t({ en: "Show attendance pass", ar: "عرض بطاقة الحضور" })}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCommand("regenerate")}
                >
                  {t({
                    en: "Regenerate attendance pass",
                    ar: "إعادة إنشاء بطاقة الحضور",
                  })}
                </Button>
              </>
            )}
          </div>
          {canPass && token && (
            <div className="engagement-pass">
              <AttendanceQr token={token} />
              <Button variant="outline" onClick={() => setToken("")}>
                {t({ en: "Hide pass", ar: "إخفاء البطاقة" })}
              </Button>
            </div>
          )}
          {evaluation && <EventEvaluation eventId={eventId} />}
        </>
      )}
      {action.feedback}
      {register && questions && (
        <RegistrationForm
          eventId={eventId}
          questions={questions}
          onClose={() => setRegister(false)}
        />
      )}
      {command && (
        <EngagementConfirm
          title={t(
            command === "cancel"
              ? { en: "Cancel registration", ar: "إلغاء التسجيل" }
              : command === "confirm"
                ? { en: "Confirm offered seat", ar: "تأكيد المقعد المعروض" }
                : {
                    en: "Regenerate attendance pass",
                    ar: "إعادة إنشاء بطاقة الحضور",
                  },
          )}
          version={string(r.version)}
          onClose={() => setCommand(null)}
          onExecute={async (body) => {
            setToken("");
            const result =
              command === "cancel"
                ? await api.delete_api_v1_events_by_id_registration({
                    path: { id: eventId },
                    body,
                  })
                : command === "confirm"
                  ? await api.post_api_v1_events_by_id_registration_confirm_promotion(
                      { path: { id: eventId }, body },
                    )
                  : await api.post_api_v1_events_by_id_attendance_qr_regenerate(
                      { path: { id: eventId }, body },
                    );
            setToken("");
            return result;
          }}
        >
          <p>
            {command === "regenerate"
              ? t({
                  en: "The previous pass will no longer work. Load the new pass after regeneration.",
                  ar: "لن تعمل البطاقة السابقة. حمّل البطاقة الجديدة بعد إعادة الإنشاء.",
                })
              : t({
                  en: "The server rechecks availability, deadlines and registration status.",
                  ar: "يعيد الخادم التحقق من المقاعد والمواعيد وحالة التسجيل.",
                })}
          </p>
        </EngagementConfirm>
      )}
    </section>
  );
}
function AttendanceQr({ token }: { token: string }) {
  const { t } = useLocale(),
    qr = useMemo(
      () => qrcodegen.QrCode.encodeText(token, qrcodegen.QrCode.Ecc.MEDIUM),
      [token],
    ),
    path = useMemo(() => {
      const cells: string[] = [];
      for (let y = 0; y < qr.size; y++)
        for (let x = 0; x < qr.size; x++)
          if (qr.getModule(x, y)) cells.push(`M${x + 4},${y + 4}h1v1h-1z`);
      return cells.join("");
    }, [qr]);
  return (
    <>
      <svg
        role="img"
        aria-label={t({ en: "Attendance QR code", ar: "رمز QR للحضور" })}
        viewBox={`0 0 ${qr.size + 8} ${qr.size + 8}`}
        width="240"
        height="240"
        shapeRendering="crispEdges"
      >
        <rect width="100%" height="100%" fill="white" />
        <path d={path} fill="black" />
      </svg>
      <p>
        {t({
          en: "Show this pass to the attendance desk.",
          ar: "اعرض هذه البطاقة على مكتب الحضور.",
        })}
      </p>
    </>
  );
}
function EventEvaluation({ eventId }: { eventId: string }) {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    [show, setShow] = useState(false),
    [answers, setAnswers] = useState<Record<string, unknown>>({}),
    action = useEngagementAction(),
    q = useEngagementQuery(
      "evaluation-form",
      (signal) =>
        api.get_api_v1_events_by_id_evaluation_form({
          path: { id: eventId },
          signal,
        }),
      eventId,
      show,
      true,
    );
  return (
    <section>
      <Button variant="outline" onClick={() => setShow((v) => !v)}>
        {t({ en: "Event evaluation", ar: "تقييم الفعالية" })}
      </Button>
      {show && (
        <>
          <QueryStatus query={q} />
          {q.data && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void action.run(
                  () =>
                    api.post_api_v1_events_by_id_evaluations({
                      path: { id: eventId },
                      body: { answers: dynamicAnswers(rows(q.data), answers) },
                    }),
                  () => {
                    setShow(false);
                    setAnswers({});
                  },
                );
              }}
            >
              <DynamicQuestions
                questions={rows(q.data)}
                value={answers}
                onChange={setAnswers}
              />
              {action.feedback}
              <Button type="submit" disabled={action.busy}>
                {t({ en: "Submit evaluation", ar: "إرسال التقييم" })}
              </Button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
export function MyEventRegistrations() {
  const { owner, session } = useEngagementConnection();
  return <MyEventList key={String(owner) + session} />;
}
function MyEventList() {
  const { api } = useEngagementConnection(),
    { t, label } = useLocale(),
    [page, setPage] = useState(1),
    q = useEngagementQuery(
      "my-events",
      (signal) =>
        api.get_api_v1_events_registrations_my({
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      page,
      true,
      true,
    );
  return (
    <div className="container personal-discovery-page engagement-page">
      <header>
        <h1 data-page-heading tabIndex={-1}>
          {label("myEvents")}
        </h1>
        <div className="student-connected-actions">
          <AppLink href="/my/certificates">
            {t({ en: "My certificates", ar: "شهاداتي" })}
          </AppLink>
          <AppLink href="/my/volunteer-hours">
            {t({ en: "My volunteer hours", ar: "ساعاتي التطوعية" })}
          </AppLink>
        </div>
      </header>
      <QueryStatus query={q} />
      {q.data && (
        <>
          {rows(q.data.items).map((r) => (
            <RegistrationCard key={string(r.id)} registration={r} />
          ))}
          <Empty items={rows(q.data.items)} />
          <Pager
            page={page}
            total={Number(q.data.totalItems)}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
function RegistrationCard({
  registration: r,
}: {
  registration: Record<string, unknown>;
}) {
  const { api } = useEngagementConnection(),
    { locale, t } = useLocale(),
    eventId = string(r.eventId),
    q = useEngagementQuery(
      "registered-event-title",
      (signal) =>
        api.get_api_v1_events({
          query: { EventId: eventId, Page: 1, PageSize: 20 },
          signal,
        }),
      eventId,
    ),
    event = rows(q.data?.items).find((e) => e.id === eventId);
  return (
    <Panel
      title={
        event
          ? localizedField(event, "title", locale)
          : t({ en: "Registered event", ar: "فعالية مسجلة" })
      }
    >
      {event && (
        <AppLink href={"/events/" + encodeURIComponent(string(event.slug))}>
          {t({ en: "Event details", ar: "تفاصيل الفعالية" })}
        </AppLink>
      )}
      <p>
        {string(r.status)} · {string(r.registeredAt)}
      </p>
      <EventParticipation eventId={eventId} />
    </Panel>
  );
}
export function AssetAction({
  assetId,
  label,
  download = false,
}: {
  assetId: string;
  label?: string;
  download?: boolean;
}) {
  const { services } = useEngagementConnection(),
    { t } = useLocale(),
    action = useEngagementAction(),
    [url, setUrl] = useState("");
  return (
    <div className="engagement-asset">
      <Button
        variant="outline"
        disabled={action.busy || !services.assets}
        onClick={() =>
          void action.run(
            () =>
              download
                ? services.assets!.download(assetId)
                : services.assets!.preview(assetId),
            (result) => setUrl(result.url),
            t({
              en: "Authorized file link loaded",
              ar: "حُمّل رابط الملف المصرح به",
            }),
            false,
          )
        }
      >
        {label || t({ en: "Open attached file", ar: "فتح الملف المرفق" })}
      </Button>
      {engagementUrl(url) && (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {t({ en: "Open file", ar: "فتح الملف" })}
        </a>
      )}
      {action.feedback}
    </div>
  );
}
