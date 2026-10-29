import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { record, string } from "../../services/api/mapping";
import {
  usePublicationConnection,
  usePublicationQuery,
  QueryStatus,
  Panel,
  Pager,
  Empty,
  rows,
} from "../../features/publications/shared";
import { publicationTitle } from "../../features/publications/model";
import { PublicationEditor } from "./PublicationEditor";
import { ActionDialog } from "./ActionDialog";
import { publicationVersion } from "../../services/api/publication-contracts";
export function CampaignAlbumAdmin({
  parent,
  canCreate,
}: {
  parent: Record<string, unknown>;
  canCreate: boolean;
}) {
  const { api } = usePublicationConnection(),
    { t, locale } = useLocale(),
    [page, setPage] = useState(1),
    [creating, setCreating] = useState(false),
    id = string(parent.id),
    q = usePublicationQuery(
      "admin-campaign-albums",
      (signal) =>
        api.get_api_v1_admin_media_campaigns_by_id_albums({
          path: { id },
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      [id, page],
      true,
      true,
    );
  return (
    <Panel title={t({ en: "Campaign albums", ar: "ألبومات الحملة" })}>
      <QueryStatus query={q} />
      {canCreate && (
        <Button variant="outline" onClick={() => setCreating(true)}>
          {t({
            en: "New album in this campaign",
            ar: "ألبوم جديد في هذه الحملة",
          })}
        </Button>
      )}
      {q.data && (
        <>
          {rows(q.data.items).map((x) => (
            <div key={string(x.id)} className="publication-row">
              <strong>{publicationTitle(x, locale)}</strong>
              <span>
                {string(x.status)} · {string(x.id)}
              </span>
            </div>
          ))}
          <Empty items={rows(q.data.items)} />
          <Pager page={page} total={Number(q.data.total)} onChange={setPage} />
        </>
      )}
      {creating && (
        <PublicationEditor
          section="albums"
          snapshot={{
            document: {
              campaignId: id,
              slug: "",
              titleEn: "",
              titleAr: "",
              assets: [],
              links: [],
              items: [],
            },
          }}
          onClose={() => setCreating(false)}
          onSave={(document, changeSummary) =>
            api.post_api_v1_admin_media_campaigns_by_id_albums({
              path: { id },
              body: {
                document: { ...document, campaignId: id },
                changeSummary,
              },
            })
          }
        />
      )}
    </Panel>
  );
}
export function SetCurrentBody({
  parent,
}: {
  parent: Record<string, unknown>;
}) {
  const { api } = usePublicationConnection(),
    { t } = useLocale(),
    [show, setShow] = useState(false),
    [end, setEnd] = useState(""),
    [reviewed, setReviewed] = useState(false),
    [dialog, setDialog] = useState(false),
    current = usePublicationQuery(
      "admin-current-body-public",
      (signal) =>
        api.get_api_v1_executive_bodies_current({
          query: { Locale: "en" },
          signal,
        }),
      "",
      show,
      true,
    ),
    previousId = string(record(current.data).id),
    previous = usePublicationQuery(
      "admin-previous-current",
      (signal) =>
        api.get_api_v1_admin_by_contentType_by_id({
          path: { contentType: "executive-bodies", id: previousId },
          signal,
        }),
      previousId,
      show && !!previousId && previousId !== parent.id,
      true,
    );
  const noPrevious =
    current.error &&
    typeof current.error === "object" &&
    "status" in current.error &&
    current.error.status === 404;
  return (
    <Panel
      title={t({ en: "Current executive body", ar: "الهيئة الإدارية الحالية" })}
    >
      <Button variant="outline" onClick={() => setShow((v) => !v)}>
        {t({
          en: "Review current body change",
          ar: "مراجعة تغيير الهيئة الحالية",
        })}
      </Button>
      {show && (
        <>
          {!noPrevious && <QueryStatus query={current} />}{" "}
          {previousId === parent.id ? (
            <p>
              {t({
                en: "This is already the published current body.",
                ar: "هذه هي الهيئة الحالية المنشورة بالفعل.",
              })}
            </p>
          ) : (
            <>
              {previousId && (
                <>
                  <QueryStatus query={previous} />
                  {previous.data && (
                    <>
                      <p>
                        {t({ en: "Previous body", ar: "الهيئة السابقة" })}:{" "}
                        {string(previous.data.slug)} ·{" "}
                        <code>{string(previous.data.version)}</code>
                      </p>
                      <label>
                        {t({
                          en: "Previous term end date",
                          ar: "تاريخ نهاية الدورة السابقة",
                        })}
                        <input
                          type="date"
                          value={end}
                          onChange={(e) => setEnd(e.target.value)}
                        />
                      </label>
                    </>
                  )}
                </>
              )}
              {noPrevious && (
                <p>
                  {t({
                    en: "No current body is publicly visible. Confirm only if no other body is current in the administration records.",
                    ar: "لا تظهر هيئة حالية للعامة. أكّد فقط إذا لم توجد هيئة حالية أخرى في سجلات الإدارة.",
                  })}
                </p>
              )}
              <label className="publication-check">
                <input
                  type="checkbox"
                  checked={reviewed}
                  onChange={(e) => setReviewed(e.target.checked)}
                />
                {t({
                  en: "I reviewed the current and previous terms.",
                  ar: "راجعت الدورة الحالية والسابقة.",
                })}
              </label>
              <Button
                disabled={
                  !reviewed || (!noPrevious && (!previous.data || !end))
                }
                onClick={() => setDialog(true)}
              >
                {t({ en: "Set as current", ar: "تعيين كهيئة حالية" })}
              </Button>
            </>
          )}
        </>
      )}
      {dialog && (
        <ActionDialog
          kind="set-current"
          title={string(parent.slug)}
          version={publicationVersion(parent.version)}
          extra={
            previous.data
              ? {
                  previousCurrentId: previousId,
                  previousCurrentVersion: publicationVersion(
                    previous.data.version,
                  ),
                  previousTermEndDate: end,
                }
              : {}
          }
          onClose={() => setDialog(false)}
          onExecute={(body) =>
            api.post_api_v1_admin_executive_bodies_by_id_set_current({
              path: { id: string(parent.id) },
              body,
            })
          }
        />
      )}
    </Panel>
  );
}
