import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { ApiError } from "../../services/api/client";
import {
  AudienceFields,
  audienceRequest,
  emptyAudience,
} from "../../features/schedule/AudienceFields";
import {
  Panel,
  Pager,
  QueryStatus,
  Confirm,
  useScheduleAction,
  useScheduleConnection,
  useScheduleQuery,
} from "../../features/schedule/shared";
export function Campaigns() {
  const { api } = useScheduleConnection(),
    { t } = useLocale(),
    action = useScheduleAction();
  const [page, setPage] = useState(1),
    [team, setTeam] = useState(""),
    [selected, setSelected] = useState(""),
    [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
      title: "",
      body: "",
      category: "",
      targetType: "",
      targetId: "",
      teamId: "",
    }),
    [audience, setAudience] = useState(emptyAudience);
  const [preview, setPreview] = useState<{
      id: string;
      version: string;
      count: number;
    } | null>(null),
    [command, setCommand] = useState<{
      kind: "publish" | "cancel";
      id: string;
      version: string;
      title: string;
      count?: number;
    } | null>(null);
  const list = useScheduleQuery(
    "campaigns",
    (signal) =>
      api.get_api_v1_admin_notification_campaigns({
        query: { Page: page, PageSize: 20, teamId: team || undefined },
        signal,
      }),
    [page, team],
  );
  const detail = useScheduleQuery(
      "campaign",
      (signal) =>
        api.get_api_v1_admin_notification_campaigns_by_id({
          path: { id: selected },
          signal,
        }),
      selected,
      !!selected,
    ),
    campaign = detail.data;
  function patch(v: Partial<typeof draft>) {
    setDraft((old) => ({ ...old, ...v }));
  }
  return (
    <>
      <Panel title={t({ en: "Notification campaigns", ar: "حملات الإشعارات" })}>
        <label className="schedule-fields">
          {t({
            en: "Team ID filter (optional)",
            ar: "تصفية بمعرّف الفريق (اختياري)",
          })}
          <input
            value={team}
            onChange={(e) => {
              setTeam(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <QueryStatus query={list} />
        {list.data?.items.map((row) => (
          <div className="student-connected-row" key={row.id}>
            <div>
              <strong>{row.title}</strong>
              <small>
                {row.status} · {row.delivered}{" "}
                {t({ en: "delivered", ar: "تم تسليمها" })}
              </small>
            </div>
            <Button
              variant="outline"
              disabled={action.busy}
              onClick={() => {
                setSelected(row.id);
                setPreview(null);
                setCommand(null);
                setCreating(false);
              }}
            >
              {t({ en: "Open campaign", ar: "فتح الحملة" })}
            </Button>
          </div>
        ))}
        {!list.isPending && !list.error && !list.data?.items.length && (
          <p>{t({ en: "No campaigns yet.", ar: "لا توجد حملات بعد." })}</p>
        )}
        <Pager page={page} total={list.data?.total || 0} onChange={setPage} />
        <Button
          disabled={action.busy}
          onClick={() => {
            setCreating(true);
            setSelected("");
            setPreview(null);
            setCommand(null);
            setDraft({
              title: "",
              body: "",
              category: "",
              targetType: "",
              targetId: "",
              teamId: team,
            });
            setAudience(emptyAudience());
          }}
        >
          {t({ en: "New campaign draft", ar: "مسودة حملة جديدة" })}
        </Button>
      </Panel>
      {creating && (
        <Panel
          title={t({ en: "Create a campaign draft", ar: "إنشاء مسودة حملة" })}
        >
          <p>
            {t({
              en: "Saving creates a draft. It does not send notifications. Review the audience before publishing.",
              ar: "ينشئ الحفظ مسودة ولا يرسل إشعارات. راجع الجمهور قبل النشر.",
            })}
          </p>
          <form
            className="schedule-fields"
            onSubmit={(e) => {
              e.preventDefault();
              void action.run(
                async () => {
                  const result =
                    await api.post_api_v1_admin_notification_campaigns({
                      body: {
                        title: draft.title.trim(),
                        body: draft.body,
                        category: draft.category,
                        audience: audienceRequest(audience),
                        targetType: draft.targetType || null,
                        targetId: draft.targetId || null,
                        teamId: draft.teamId || null,
                      },
                    });
                  setSelected(result.id);
                },
                () => setCreating(false),
              );
            }}
          >
            <label>
              {t({ en: "Title", ar: "العنوان" })}
              <input
                required
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </label>
            <label>
              {t({ en: "Message", ar: "الرسالة" })}
              <textarea
                required
                value={draft.body}
                onChange={(e) => patch({ body: e.target.value })}
              />
            </label>
            <label>
              {t({ en: "Category", ar: "الفئة" })}
              <input
                required
                value={draft.category}
                onChange={(e) => patch({ category: e.target.value })}
                list="campaign-categories"
              />
              <datalist id="campaign-categories">
                {[
                  ...new Set(list.data?.items.map((v) => v.category) || []),
                ].map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </label>
            <AudienceFields value={audience} onChange={setAudience} />
            <details>
              <summary>
                {t({
                  en: "Optional scope and destination",
                  ar: "النطاق والوجهة (اختياري)",
                })}
              </summary>
              <label>
                {t({ en: "Team ID", ar: "معرّف الفريق" })}
                <input
                  value={draft.teamId}
                  onChange={(e) => patch({ teamId: e.target.value })}
                />
              </label>
              <label>
                {t({ en: "Target type", ar: "نوع الهدف" })}
                <input
                  value={draft.targetType}
                  onChange={(e) => patch({ targetType: e.target.value })}
                />
              </label>
              <label>
                {t({ en: "Target ID", ar: "معرّف الهدف" })}
                <input
                  value={draft.targetId}
                  onChange={(e) => patch({ targetId: e.target.value })}
                />
              </label>
            </details>
            <div className="student-connected-actions">
              <Button disabled={action.busy}>
                {t({ en: "Save draft", ar: "حفظ المسودة" })}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={action.busy}
                onClick={() => setCreating(false)}
              >
                {t({ en: "Cancel", ar: "إلغاء" })}
              </Button>
            </div>
          </form>
        </Panel>
      )}
      {selected && (
        <Panel title={campaign?.title || t({ en: "Campaign", ar: "الحملة" })}>
          <QueryStatus query={detail} />
          {campaign && (
            <>
              <p>{campaign.body}</p>
              <p>
                {campaign.category} · {campaign.status} · {campaign.delivered}{" "}
                {t({ en: "delivered", ar: "تم تسليمها" })}
              </p>
              <details>
                <summary>
                  {t({ en: "Audience configuration", ar: "إعداد الجمهور" })}
                </summary>
                <pre
                  style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                >
                  {campaign.audienceJson}
                </pre>
              </details>
              <div className="student-connected-actions">
                <Button
                  variant="outline"
                  disabled={action.busy}
                  onClick={() =>
                    void action.run(
                      async () => {
                        setPreview(null);
                        const version = campaign.version;
                        if (!version)
                          throw new ApiError(
                            "Reload the campaign version.",
                            409,
                            "VERSION_REQUIRED",
                          );
                        const result =
                          await api.post_api_v1_admin_notification_campaigns_by_id_preview_audience(
                            { path: { id: selected } },
                          );
                        const latest =
                          await api.get_api_v1_admin_notification_campaigns_by_id(
                            { path: { id: selected } },
                          );
                        if (latest.version !== version)
                          throw new ApiError(
                            "The campaign changed during preview. Reload and preview it again.",
                            409,
                            "CAMPAIGN_CHANGED",
                          );
                        if (
                          result.sent !== false ||
                          !Number.isInteger(result.recipientCount) ||
                          result.recipientCount < 0
                        )
                          throw new ApiError(
                            "The audience preview was not a valid unsent preview.",
                            502,
                            "INVALID_PREVIEW",
                          );
                        setPreview({
                          id: selected,
                          version,
                          count: result.recipientCount,
                        });
                      },
                      undefined,
                      t({
                        en: "Audience preview ready; no notifications sent",
                        ar: "معاينة الجمهور جاهزة؛ لم تُرسل إشعارات",
                      }),
                    )
                  }
                >
                  {t({ en: "Preview audience", ar: "معاينة الجمهور" })}
                </Button>
                <Button
                  disabled={
                    action.busy ||
                    !preview ||
                    preview.id !== selected ||
                    preview.version !== campaign.version ||
                    preview.count < 1 ||
                    campaign.status !== "Draft"
                  }
                  onClick={() =>
                    setCommand({
                      kind: "publish",
                      id: selected,
                      version: campaign.version!,
                      title: campaign.title || "",
                      count: preview!.count,
                    })
                  }
                >
                  {t({ en: "Publish campaign", ar: "نشر الحملة" })}
                </Button>
                <Button
                  variant="outline"
                  disabled={action.busy || campaign.status === "Cancelled"}
                  onClick={() =>
                    setCommand({
                      kind: "cancel",
                      id: selected,
                      version: campaign.version!,
                      title: campaign.title || "",
                    })
                  }
                >
                  {t({ en: "Cancel campaign", ar: "إلغاء الحملة" })}
                </Button>
              </div>
              {preview &&
                preview.id === selected &&
                preview.version === campaign.version && (
                  <p role="status">
                    {t({
                      en: `Audience preview: approximately ${preview.count} recipients. The count may change before publication.`,
                      ar: `معاينة الجمهور: نحو ${preview.count} مستلم. قد يتغير العدد قبل النشر.`,
                    })}
                  </p>
                )}
              {command && (
                <Confirm
                  busy={action.busy}
                  onCancel={() => setCommand(null)}
                  onConfirm={() =>
                    void action.run(
                      () => {
                        if (command.kind === "publish") {
                          if (
                            !preview ||
                            preview.id !== command.id ||
                            preview.version !== command.version
                          )
                            throw new ApiError(
                              "Preview this campaign again before publishing.",
                              409,
                              "PREVIEW_REQUIRED",
                            );
                          return api.post_api_v1_admin_notification_campaigns_by_id_publish(
                            {
                              path: { id: command.id },
                              body: { version: command.version },
                            },
                          );
                        }
                        return api.post_api_v1_admin_notification_campaigns_by_id_cancel(
                          {
                            path: { id: command.id },
                            body: { version: command.version },
                          },
                        );
                      },
                      () => {
                        setCommand(null);
                        setPreview(null);
                      },
                    )
                  }
                >
                  {t(
                    command.kind === "publish"
                      ? {
                          en: `Publish “${command.title}” to approximately ${command.count} recipients? This starts notification delivery.`,
                          ar: `نشر «${command.title}» لنحو ${command.count} مستلم؟ سيبدأ هذا تسليم الإشعارات.`,
                        }
                      : {
                          en: `Cancel “${command.title}”? Notifications already delivered are not recalled.`,
                          ar: `إلغاء «${command.title}»؟ لن تُسحب الإشعارات التي سُلّمت بالفعل.`,
                        },
                  )}
                </Confirm>
              )}
            </>
          )}
        </Panel>
      )}
      {action.feedback}
    </>
  );
}
