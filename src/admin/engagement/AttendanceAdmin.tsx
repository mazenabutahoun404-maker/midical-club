import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { ApiError } from "../../services/api/client";
import { record, string } from "../../services/api/mapping";
import type { Schemas } from "../../services/api/schema.generated";
import {
  useEngagementConnection,
  useEngagementQuery,
  useEngagementAction,
  QueryStatus,
  Pager,
  Empty,
  rows,
} from "../../features/engagement/shared";
import { EngagementEditor } from "../../features/engagement/Forms";
export function AttendanceAdmin({
  eventId,
  permissions,
}: {
  eventId: string;
  permissions: string[];
}) {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [editing, setEditing] = useState<{
      recordId?: string;
      initial: Record<string, unknown>;
      version?: string;
      registrationId?: string;
    } | null>(null),
    can = (p: string) => permissions.includes(p),
    q = useEngagementQuery(
      "event-attendance",
      (signal) =>
        api.get_api_v1_admin_events_by_id_attendance({
          path: { id: eventId },
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      [eventId, page],
      can("attendance.view"),
      true,
    );
  return (
    <section>
      {can("attendance.override") && (
        <Button
          variant="outline"
          onClick={() =>
            setEditing({
              initial: {
                registrationId: "",
                reason: "",
                checkinAt: null,
                checkoutAt: null,
                eligibleOverride: false,
              },
            })
          }
        >
          {t({ en: "Record attendance manually", ar: "تسجيل الحضور يدويًا" })}
        </Button>
      )}
      {can("attendance.view") && (
        <>
          <QueryStatus query={q} />
          {q.data && (
            <>
              {rows(q.data.items).map((row) => (
                <div key={string(row.id)} className="engagement-row">
                  <div>
                    <strong>
                      {string(row.userId)} · {string(row.eligibilityStatus)}
                    </strong>
                    <p>
                      {string(row.checkinAt)} → {string(row.checkoutAt)} ·{" "}
                      {row.attendanceMinutes == null
                        ? "—"
                        : Number(row.attendanceMinutes)}{" "}
                      {t({ en: "minutes", ar: "دقيقة" })}
                    </p>
                    <p>
                      {string(row.eligibilityReason)} ·{" "}
                      {string(row.manualReason)}
                    </p>
                    {row.highRisk === true && (
                      <p>
                        {t({ en: "Flagged for review", ar: "معلّم للمراجعة" })}
                      </p>
                    )}
                  </div>
                  {can("attendance.correct") && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        setEditing({
                          recordId: string(row.id),
                          registrationId: string(row.registrationId),
                          version: string(row.version),
                          initial: {
                            registrationId: row.registrationId,
                            reason: "",
                            checkinAt: row.checkinAt,
                            checkoutAt: row.checkoutAt,
                            eligibleOverride: false,
                          },
                        })
                      }
                    >
                      {t({ en: "Correct record", ar: "تصحيح السجل" })}
                    </Button>
                  )}
                </div>
              ))}
              <Empty items={rows(q.data.items)} />
              <Pager
                page={page}
                total={Number(q.data.totalItems)}
                onChange={setPage}
              />
            </>
          )}
        </>
      )}
      {editing && (
        <EngagementEditor
          title={t({
            en: editing.recordId ? "Correct attendance" : "Manual attendance",
            ar: editing.recordId ? "تصحيح الحضور" : "حضور يدوي",
          })}
          schema="EventAttendanceRequest"
          initial={editing.initial}
          version={editing.version}
          description={t({
            en: "Review the registration, explicit check-in/out instants, eligibility override and reason. The server checks self-override permissions.",
            ar: "راجع التسجيل وأوقات الدخول والخروج وتجاوز الأهلية والسبب. يتحقق الخادم من صلاحيات تعديل الحضور الشخصي.",
          })}
          onClose={() => setEditing(null)}
          onSave={(body) => {
            if (
              editing.recordId &&
              body.registrationId !== editing.registrationId
            )
              throw new ApiError(
                "A correction must retain the selected registration ID.",
                422,
                "REGISTRATION_MISMATCH",
              );
            return editing.recordId
              ? api.put_api_v1_admin_attendance_by_recordId_correct({
                  path: { recordId: editing.recordId },
                  body: body as Schemas["EventAttendanceRequest"],
                })
              : api.post_api_v1_admin_events_by_id_attendance_manual({
                  path: { id: eventId },
                  body: body as Schemas["EventAttendanceRequest"],
                });
          }}
        />
      )}
    </section>
  );
}
export function AttendanceScanner() {
  const { api } = useEngagementConnection(),
    { t } = useLocale(),
    [eventId, setEventId] = useState(""),
    [token, setToken] = useState(""),
    [operation, setOperation] = useState("CheckIn"),
    [reviewed, setReviewed] = useState(false),
    [result, setResult] = useState<Record<string, unknown> | null>(null),
    action = useEngagementAction();
  return (
    <section>
      <h2>{t({ en: "Attendance desk", ar: "مكتب الحضور" })}</h2>
      <p>
        {t({
          en: "Paste the token read by your QR scanner. No camera permission is required.",
          ar: "ألصق الرمز الذي قرأه ماسح QR. لا يلزم إذن الكاميرا.",
        })}
      </p>
      <form
        className="engagement-form"
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(
            () =>
              api.post_api_v1_attendance_scan({
                body: {
                  eventId: eventId.trim(),
                  token: token.trim(),
                  operation: operation.trim(),
                },
              }),
            (v) => {
              setResult(record(v));
              setToken("");
              setReviewed(false);
            },
          );
        }}
      >
        <label>
          {t({ en: "Event ID", ar: "معرّف الفعالية" })}
          <input
            required
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setResult(null);
              setReviewed(false);
            }}
          />
        </label>
        <label>
          {t({ en: "Attendance token", ar: "رمز الحضور" })}
          <textarea
            required
            autoComplete="off"
            spellCheck={false}
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setResult(null);
              setReviewed(false);
            }}
          />
        </label>
        <label>
          {t({ en: "Operation", ar: "العملية" })}
          <input
            required
            value={operation}
            onChange={(e) => {
              setOperation(e.target.value);
              setReviewed(false);
            }}
            list="attendance-operations"
          />
          <datalist id="attendance-operations">
            <option value="CheckIn" />
            <option value="CheckOut" />
          </datalist>
        </label>
        <label className="engagement-check">
          <input
            type="checkbox"
            required
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
          />
          {t({
            en: "I checked the event and attendance operation.",
            ar: "تحققت من الفعالية وعملية الحضور.",
          })}
        </label>
        {action.feedback}
        <Button type="submit" disabled={action.busy || !reviewed}>
          {t({ en: "Record scan", ar: "تسجيل المسح" })}
        </Button>
      </form>
      {result && (
        <div role="status">
          <strong>{string(result.result)}</strong>
          <p>
            {string(result.checkinAt)} · {string(result.checkoutAt)} ·{" "}
            {string(result.eligibilityStatus)}
          </p>
        </div>
      )}
    </section>
  );
}
