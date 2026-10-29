import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import type { Operations } from "../../services/api/schema.generated";
import { subscriptionAddress } from "../../services/api/schedule-contracts";
import { ApiError } from "../../services/api/client";
import {
  Panel,
  QueryStatus,
  Confirm,
  useScheduleAction,
  useScheduleConnection,
  useScheduleQuery,
  downloadCalendar,
} from "./shared";
type Issued =
  Operations["post_api_v1_calendar_subscription_tokens"]["response"];
export function CalendarSubscriptions() {
  const { owner } = useScheduleConnection();
  return <Subscriptions key={owner} />;
}
function Subscriptions() {
  const { api, services } = useScheduleConnection(),
    { t } = useLocale(),
    action = useScheduleAction();
  const query = useScheduleQuery("subscriptions", (signal) =>
    api.get_api_v1_calendar_subscription_tokens({ signal }),
  );
  const [name, setName] = useState(""),
    [personal, setPersonal] = useState(false),
    [issued, setIssued] = useState<Issued | null>(null),
    [address, setAddress] = useState("");
  const [command, setCommand] = useState<{
    kind: "rotate" | "revoke";
    id: string;
    name: string;
    includePersonalEntries: boolean;
  } | null>(null);
  function show(value: Issued) {
    const url = subscriptionAddress(
      services.api!.baseUrl,
      value.subscriptionPath,
      value.rawToken,
    );
    setIssued(value);
    setAddress(url);
  }
  return (
    <Panel title={t({ en: "Calendar subscriptions", ar: "اشتراكات التقويم" })}>
      <p>
        {t({
          en: "Anyone with a subscription link can read its calendar feed without signing in. The link is shown only when created or rotated. Revoking or rotating it stops the previous link.",
          ar: "يمكن لأي شخص يملك رابط الاشتراك قراءة تقويمه دون تسجيل الدخول. يُعرض الرابط عند إنشائه أو تدويره فقط. يؤدي الإلغاء أو التدوير إلى إيقاف الرابط السابق.",
        })}
      </p>
      <form
        className="schedule-fields"
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(
            () =>
              api.post_api_v1_calendar_subscription_tokens({
                body: { name: name.trim(), includePersonalEntries: personal },
              }),
            (result) => {
              show(result as Issued);
              setName("");
              setPersonal(false);
            },
          );
        }}
      >
        <label>
          {t({ en: "Subscription name", ar: "اسم الاشتراك" })}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="schedule-inline">
          <input
            type="checkbox"
            checked={personal}
            onChange={(e) => setPersonal(e.target.checked)}
          />
          {t({
            en: "Include my personal entries",
            ar: "تضمين مواعيدي الشخصية",
          })}
        </label>
        <Button disabled={action.busy}>
          {t({ en: "Create subscription link", ar: "إنشاء رابط اشتراك" })}
        </Button>
      </form>
      {issued && (
        <aside className="schedule-fields">
          <label>
            {t({ en: "Private subscription URL", ar: "رابط الاشتراك الخاص" })}
            <input
              className="schedule-secret"
              readOnly
              value={address}
              onFocus={(e) => e.currentTarget.select()}
            />
          </label>
          <p className="schedule-note">
            {t({
              en: "Keep this link private. It is not saved in this browser after this panel is closed.",
              ar: "احتفظ بهذا الرابط خاصاً. لن يبقى محفوظاً في المتصفح بعد إغلاق هذه اللوحة.",
            })}
          </p>
          <div className="student-connected-actions">
            <Button
              variant="outline"
              disabled={action.busy}
              onClick={() =>
                void action.run(
                  async () => {
                    if (!navigator.clipboard)
                      throw new ApiError(
                        "Copy the link directly from its field.",
                        422,
                        "CLIPBOARD_UNAVAILABLE",
                      );
                    await navigator.clipboard.writeText(address);
                  },
                  undefined,
                  t({ en: "Link copied", ar: "نُسخ الرابط" }),
                )
              }
            >
              {t({ en: "Copy link", ar: "نسخ الرابط" })}
            </Button>
            <Button
              variant="outline"
              disabled={action.busy}
              onClick={() =>
                void action.run(
                  async () => {
                    downloadCalendar(
                      await api.get_api_v1_calendar_subscriptions_by_rawToken_ics(
                        { path: { rawToken: issued.rawToken } },
                      ),
                    );
                  },
                  undefined,
                  t({
                    en: "Calendar feed downloaded",
                    ar: "نُزّل ملف التقويم",
                  }),
                )
              }
            >
              {t({
                en: "Check and download feed",
                ar: "فحص ملف الاشتراك وتنزيله",
              })}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIssued(null);
                setAddress("");
              }}
            >
              {t({ en: "Hide link", ar: "إخفاء الرابط" })}
            </Button>
          </div>
        </aside>
      )}
      <QueryStatus query={query} />
      {query.data?.map((row) => (
        <div className="student-connected-row" key={row.id}>
          <div>
            <strong>{row.name}</strong>
            <small>
              {t(
                row.revokedAt
                  ? { en: "Revoked", ar: "ملغى" }
                  : row.includePersonalEntries
                    ? {
                        en: "Includes personal entries",
                        ar: "يتضمن المواعيد الشخصية",
                      }
                    : {
                        en: "Personal entries excluded",
                        ar: "يستثني المواعيد الشخصية",
                      },
              )}
            </small>
          </div>
          {!row.revokedAt && (
            <div className="student-connected-actions">
              <Button
                variant="outline"
                disabled={action.busy}
                onClick={() => setCommand({ kind: "rotate", ...row })}
              >
                {t({ en: "Rotate link", ar: "تدوير الرابط" })}
              </Button>
              <Button
                variant="outline"
                disabled={action.busy}
                onClick={() => setCommand({ kind: "revoke", ...row })}
              >
                {t({ en: "Revoke link", ar: "إلغاء الرابط" })}
              </Button>
            </div>
          )}
        </div>
      ))}
      {command && (
        <Confirm
          busy={action.busy}
          onCancel={() => setCommand(null)}
          onConfirm={() =>
            void action.run(
              async () => {
                if (issued?.id === command.id) {
                  setIssued(null);
                  setAddress("");
                }
                if (command.kind === "rotate")
                  return api.post_api_v1_calendar_subscription_tokens_by_id_rotate(
                    {
                      path: { id: command.id },
                      body: {
                        name: command.name,
                        includePersonalEntries: command.includePersonalEntries,
                      },
                    },
                  );
                else {
                  return api.delete_api_v1_calendar_subscription_tokens_by_id({
                    path: { id: command.id },
                  });
                }
              },
              (result) => {
                if (command.kind === "rotate") show(result as Issued);
                setCommand(null);
              },
            )
          }
        >
          {t(
            command.kind === "rotate"
              ? {
                  en: `Rotate “${command.name}”? Its previous link will stop working.`,
                  ar: `تدوير «${command.name}»؟ سيتوقف الرابط السابق عن العمل.`,
                }
              : {
                  en: `Revoke “${command.name}”? Anyone using its link will lose calendar access.`,
                  ar: `إلغاء «${command.name}»؟ سيفقد مستخدمو الرابط الوصول إلى التقويم.`,
                },
          )}
        </Confirm>
      )}
      {action.feedback}
    </Panel>
  );
}
