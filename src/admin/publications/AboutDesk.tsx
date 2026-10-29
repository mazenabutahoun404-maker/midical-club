import { ConflictReview } from "./ConflictReview";
import { ApiError } from "../../services/api/client";
import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { record, string } from "../../services/api/mapping";
import {
  checkPublicationDocument,
  publicationVersion,
} from "../../services/api/publication-contracts";
import {
  usePublicationConnection,
  usePublicationQuery,
  usePublicationAction,
  QueryStatus,
  Panel,
  Pager,
  Empty,
  rows,
} from "../../features/publications/shared";
import { PublishedContent } from "../../features/resources/PublishedContent";
import { ActionDialog, actionNames, type ActionKind } from "./ActionDialog";
import { DocumentJson } from "./Fields";
import type { Schemas } from "../../services/api/schema.generated";
import type { Action } from "./actions";
function AboutEditor({
  snapshot,
  onClose,
}: {
  snapshot: Record<string, unknown>;
  onClose: () => void;
}) {
  const { api } = usePublicationConnection(),
    { t } = useLocale(),
    [version, setVersion] = useState(() =>
      publicationVersion(snapshot.version),
    ),
    [doc, setDoc] = useState(() => structuredClone(record(snapshot.document))),
    [summary, setSummary] = useState(""),
    action = usePublicationAction();
  return (
    <Modal
      open
      title={t({ en: "Edit About draft", ar: "تعديل مسودة نبذة النادي" })}
      description={t({
        en: "The complete saved page is retained. Saving does not publish.",
        ar: "تبقى الصفحة المحفوظة كاملة. لا يعني الحفظ النشر.",
      })}
      className="publication-modal"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(() => {
            checkPublicationDocument(doc, true);
            return api.put_api_v1_admin_about({
              body: {
                version,
                document: doc as Schemas["ContentDocument"],
                changeSummary: summary,
              },
            });
          }, onClose);
        }}
      >
        <div className="publication-fields">
          {["title", "description"].flatMap((key) =>
            ["en", "ar"].map((lang) => (
              <label key={key + lang}>
                {t(
                  key === "title"
                    ? { en: "Title", ar: "العنوان" }
                    : { en: "Description", ar: "الوصف" },
                )}{" "}
                ({lang})
                <textarea
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  value={string(record(doc[key])[lang])}
                  onChange={(e) =>
                    setDoc({
                      ...doc,
                      [key]: { ...record(doc[key]), [lang]: e.target.value },
                    })
                  }
                />
              </label>
            )),
          )}
        </div>
        <DocumentJson
          value={doc}
          onApply={(v) => {
            checkPublicationDocument(v, true);
            setDoc(v);
          }}
        />
        <label>
          {t({ en: "Change summary", ar: "ملخص التغيير" })}
          <input value={summary} onChange={(e) => setSummary(e.target.value)} />
        </label>
        {action.feedback}
        {action.error instanceof ApiError && action.error.status === 409 && (
          <ConflictReview
            about
            load={() => api.get_api_v1_admin_about({})}
            onUse={setVersion}
          />
        )}
        <Button type="submit" disabled={action.busy}>
          {t({ en: "Save draft", ar: "حفظ المسودة" })}
        </Button>
      </form>
    </Modal>
  );
}
export function AboutDesk({ permissions }: { permissions: string[] }) {
  const { api } = usePublicationConnection(),
    { t } = useLocale(),
    [tab, setTab] = useState("draft"),
    [page, setPage] = useState(1),
    [sPage, setSPage] = useState(1),
    [editing, setEditing] = useState<Record<string, unknown> | null>(null),
    [selectedVersion, setSelectedVersion] = useState(""),
    [dialog, setDialog] = useState<{
      kind: ActionKind;
      version: string;
      versionId?: string;
      scheduleId?: string;
    } | null>(null);
  const q = usePublicationQuery(
      "about-admin",
      (signal) => api.get_api_v1_admin_about({ signal }),
      "",
      true,
      true,
    ),
    history = usePublicationQuery(
      "about-versions",
      (signal) =>
        api.get_api_v1_admin_about_versions({
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      page,
      tab === "versions",
      true,
    ),
    schedules = usePublicationQuery(
      "about-schedules",
      (signal) =>
        api.get_api_v1_admin_about_schedules({
          query: { Page: sPage, PageSize: 20 },
          signal,
        }),
      sPage,
      tab === "schedules",
      true,
    ),
    preview = usePublicationQuery(
      "about-preview",
      (signal) =>
        api.get_api_v1_admin_about_preview({
          query: { versionId: selectedVersion || undefined },
          signal,
        }),
      selectedVersion,
      tab === "preview",
      true,
    );
  const data = record(q.data),
    can = (action: string) => permissions.includes("about." + action);
  const open = (
    kind: ActionKind,
    version = string(data.version),
    versionId?: string,
    scheduleId?: string,
  ) =>
    setDialog({
      kind,
      version: publicationVersion(version),
      versionId,
      scheduleId,
    });
  async function execute(body: Action) {
    if (!dialog) return;
    switch (dialog.kind) {
      case "publish":
        return api.post_api_v1_admin_about_publish({ body });
      case "archive":
        return api.post_api_v1_admin_about_archive({ body });
      case "schedule":
        return api.post_api_v1_admin_about_schedule({ body });
      case "restore":
        return api.post_api_v1_admin_about_versions_by_versionId_restore({
          path: { versionId: dialog.versionId! },
          body,
        });
      case "retry":
        return api.post_api_v1_admin_about_schedules_by_scheduleId_retry({
          path: { scheduleId: dialog.scheduleId! },
          body,
        });
      default:
        return api.post_api_v1_admin_about_schedules_by_scheduleId_cancel({
          path: { scheduleId: dialog.scheduleId! },
          body,
        });
    }
  }
  return (
    <Panel title={t({ en: "About the club", ar: "نبذة عن النادي" })}>
      <QueryStatus query={q} />
      {q.data && (
        <>
          <p>
            {string(data.status)} ·{" "}
            {data.hasUnpublishedChanges === true
              ? t({ en: "Unpublished changes", ar: "تغييرات غير منشورة" })
              : t({
                  en: "Saved server state",
                  ar: "الحالة المحفوظة على الخادم",
                })}
          </p>
          <div className="student-connected-actions">
            {["draft", "preview", "versions", "schedules"].map((key) => (
              <Button
                key={key}
                variant={tab === key ? "default" : "outline"}
                onClick={() => setTab(key)}
              >
                {t({
                  en: (
                    {
                      draft: "Draft",
                      preview: "Preview",
                      versions: "Versions",
                      schedules: "Schedules",
                    } as Record<string, string>
                  )[key],
                  ar: (
                    {
                      draft: "المسودة",
                      preview: "معاينة",
                      versions: "الإصدارات",
                      schedules: "الجدولة",
                    } as Record<string, string>
                  )[key],
                })}
              </Button>
            ))}
          </div>
          {tab === "draft" && (
            <>
              <PublishedContent
                content={{ ...record(data.document), visible: true }}
              />
              <div className="student-connected-actions">
                {can("update") && (
                  <Button onClick={() => setEditing(structuredClone(data))}>
                    {t({ en: "Edit draft", ar: "تعديل المسودة" })}
                  </Button>
                )}
                {can("publish") && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() =>
                        open(
                          "publish",
                          string(data.version),
                          string(data.currentDraftVersionId) || undefined,
                        )
                      }
                    >
                      {t(actionNames.publish)}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        open(
                          "schedule",
                          string(data.version),
                          string(data.currentDraftVersionId) || undefined,
                        )
                      }
                    >
                      {t(actionNames.schedule)}
                    </Button>
                  </>
                )}
                {can("archive") && (
                  <Button variant="outline" onClick={() => open("archive")}>
                    {t(actionNames.archive)}
                  </Button>
                )}
              </div>
            </>
          )}
          {tab === "preview" && (
            <>
              <label>
                {t({
                  en: "Saved version ID (blank: current draft)",
                  ar: "معرّف الإصدار المحفوظ (فارغ: المسودة الحالية)",
                })}
                <input
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                />
              </label>
              <QueryStatus query={preview} />
              {preview.data && (
                <PublishedContent
                  content={{ ...record(preview.data.document), visible: true }}
                />
              )}
            </>
          )}
          {tab === "versions" && (
            <>
              <QueryStatus query={history} />
              {history.data && (
                <>
                  {["published", "drafts"].map((kind) => {
                    const data = record(record(history.data)[kind]);
                    return (
                      <section key={kind}>
                        <h3>
                          {t(
                            kind === "published"
                              ? {
                                  en: "Published versions",
                                  ar: "الإصدارات المنشورة",
                                }
                              : { en: "Draft versions", ar: "إصدارات المسودة" },
                          )}
                        </h3>
                        {rows(data.items).map((row) => (
                          <div key={string(row.id)} className="publication-row">
                            <div>
                              <strong>
                                #{Number(row.versionNumber) || string(row.kind)}
                              </strong>
                              <p>
                                {string(row.createdAt)} ·{" "}
                                {string(row.publishReason) ||
                                  string(row.reason)}
                              </p>
                              <code>{string(row.contentHash)}</code>
                            </div>
                            <div className="student-connected-actions">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedVersion(string(row.id));
                                  setTab("preview");
                                }}
                              >
                                {t({
                                  en: "Preview version",
                                  ar: "معاينة الإصدار",
                                })}
                              </Button>
                              {can("restore_version") && can("update") && (
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    open(
                                      "restore",
                                      string(q.data.version),
                                      string(row.id),
                                    )
                                  }
                                >
                                  {t(actionNames.restore)}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        <Empty items={rows(data.items)} />
                      </section>
                    );
                  })}
                  <Pager
                    page={page}
                    total={Math.max(
                      Number(record(history.data.published).total),
                      Number(record(history.data.drafts).total),
                    )}
                    onChange={setPage}
                  />
                </>
              )}
            </>
          )}
          {tab === "schedules" && (
            <>
              <QueryStatus query={schedules} />
              {schedules.data && (
                <>
                  {rows(schedules.data.items).map((row) => (
                    <div key={string(row.id)} className="publication-row">
                      <div>
                        <strong>
                          {string(row.action)} · {string(row.status)}
                        </strong>
                        <p>
                          {string(row.executeAt)} · {Number(row.attempts)} ·{" "}
                          {string(row.error)}
                        </p>
                        <code>{string(row.version)}</code>
                      </div>
                      {can(
                        /archive/i.test(string(row.action))
                          ? "archive"
                          : "publish",
                      ) && (
                        <div className="student-connected-actions">
                          <Button
                            variant="outline"
                            onClick={() =>
                              open(
                                "retry",
                                string(row.version),
                                undefined,
                                string(row.id),
                              )
                            }
                          >
                            {t(actionNames.retry)}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              open(
                                "cancel",
                                string(row.version),
                                undefined,
                                string(row.id),
                              )
                            }
                          >
                            {t(actionNames.cancel)}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  <Empty items={rows(schedules.data.items)} />
                  <Pager
                    page={sPage}
                    total={Number(schedules.data.total)}
                    onChange={setSPage}
                  />
                </>
              )}
            </>
          )}
          {editing && (
            <AboutEditor snapshot={editing} onClose={() => setEditing(null)} />
          )}
          {dialog && (
            <ActionDialog
              {...dialog}
              title={string(data.slug) || "About"}
              onClose={() => setDialog(null)}
              onExecute={execute}
            />
          )}
        </>
      )}
    </Panel>
  );
}
