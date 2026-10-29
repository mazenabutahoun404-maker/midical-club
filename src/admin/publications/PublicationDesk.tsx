import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { record, string } from "../../services/api/mapping";
import {
  publicationVersion,
  type PublicationSection,
} from "../../services/api/publication-contracts";
import {
  usePublicationConnection,
  usePublicationQuery,
  QueryStatus,
  Panel,
  Pager,
  Empty,
  rows,
} from "../../features/publications/shared";
import {
  publicationTitle,
  sectionInfo,
} from "../../features/publications/model";
import { PublicDocument } from "../../features/publications/Publications";
import { publicationActions, type Action } from "./actions";
import { PublicationEditor } from "./PublicationEditor";
import { ChildrenPanel } from "./ChildrenPanel";
import { ActionDialog, actionNames, type ActionKind } from "./ActionDialog";
import { CampaignAlbumAdmin, SetCurrentBody } from "./SpecialPanels";
export function PublicationDesk({
  section,
  permissions,
}: {
  section: PublicationSection;
  permissions: string[];
}) {
  const { api } = usePublicationConnection(),
    { t, locale, label } = useLocale(),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [submitted, setSubmitted] = useState(""),
    [id, setId] = useState(""),
    [creating, setCreating] = useState(false),
    actions = publicationActions(api, section);
  const can = (action: string) =>
      permissions.includes(`${sectionInfo[section].prefix}.${action}`),
    canCreate = can(section === "executive-bodies" ? "manage" : "create");
  const list = usePublicationQuery(
    "admin-list",
    (signal) => actions.list(page, submitted, signal),
    [section, page, submitted],
    true,
    true,
  );
  return (
    <>
      <Panel title={t(sectionInfo[section])}>
        <form
          className="publication-filters"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSubmitted(search.trim());
          }}
        >
          <label>
            {label("search")}
            <input
              maxLength={100}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <Button type="submit">{label("search")}</Button>
          {canCreate && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreating(true)}
            >
              {t({ en: "New draft", ar: "مسودة جديدة" })}
            </Button>
          )}
        </form>
        <QueryStatus query={list} />
        {list.data && (
          <>
            <div className="publication-records">
              {rows(list.data.items).map((item) => (
                <button
                  type="button"
                  key={string(item.id)}
                  aria-pressed={id === item.id}
                  onClick={() => setId(string(item.id))}
                >
                  <strong>{publicationTitle(item, locale)}</strong>
                  <span>
                    {string(item.status)}
                    {item.hasUnpublishedChanges === true
                      ? " · " +
                        t({
                          en: "Unpublished changes",
                          ar: "تغييرات غير منشورة",
                        })
                      : ""}
                  </span>
                </button>
              ))}
            </div>
            <Empty items={rows(list.data.items)} />
            <Pager
              page={page}
              total={Number(list.data.total)}
              onChange={setPage}
            />
          </>
        )}
      </Panel>
      {creating && (
        <PublicationEditor
          section={section}
          onClose={() => setCreating(false)}
          onSave={async (doc, summary) => {
            const result = await actions.create(doc, summary);
            setId(string(result.id));
            return result;
          }}
        />
      )}
      {id && (
        <PublicationRecord
          key={section + id}
          section={section}
          id={id}
          permissions={permissions}
        />
      )}
    </>
  );
}
function PublicationRecord({
  section,
  id,
  permissions,
}: {
  section: PublicationSection;
  id: string;
  permissions: string[];
}) {
  const { api } = usePublicationConnection(),
    { t, locale } = useLocale(),
    actions = publicationActions(api, section),
    [tab, setTab] = useState("draft"),
    [editor, setEditor] = useState<Record<string, unknown> | null>(null),
    [dialog, setDialog] = useState<{
      kind: ActionKind;
      version: string;
      versionId?: string;
      scheduleId?: string;
      title: string;
    } | null>(null),
    [historyPage, setHistoryPage] = useState(1),
    [schedulePage, setSchedulePage] = useState(1),
    [selectedVersion, setSelectedVersion] = useState("");
  const recordQuery = usePublicationQuery(
      "admin-record",
      (signal) => actions.get(id, signal),
      [section, id],
      true,
      true,
    ),
    history = usePublicationQuery(
      "admin-versions",
      (signal) => actions.versions(id, historyPage, signal),
      [section, id, historyPage],
      tab === "versions",
      true,
    ),
    schedules = usePublicationQuery(
      "admin-schedules",
      (signal) => actions.schedules(id, schedulePage, signal),
      [section, id, schedulePage],
      tab === "schedules",
      true,
    ),
    preview = usePublicationQuery(
      "admin-preview",
      (signal) => actions.preview(id, selectedVersion || undefined, signal),
      [section, id, selectedVersion],
      tab === "preview",
      true,
    );
  const data = record(recordQuery.data),
    title =
      publicationTitle(record(data.document), locale) || string(data.slug),
    can = (action: string) =>
      permissions.includes(`${sectionInfo[section].prefix}.${action}`),
    canEdit = can(section === "executive-bodies" ? "manage" : "update");
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
      title,
    });
  async function execute(body: Action, compatibility: boolean) {
    if (!dialog) return;
    if (dialog.kind === "publish") return actions.publish(id, body);
    if (dialog.kind === "archive") return actions.archive(id, body);
    if (dialog.kind === "schedule")
      return actions.schedule(id, body, compatibility);
    if (dialog.kind === "restore")
      return actions.restore(id, dialog.versionId!, body);
    if (dialog.kind === "retry")
      return actions.retry(id, dialog.scheduleId!, body);
    return actions.cancel(id, dialog.scheduleId!, body);
  }
  return (
    <Panel title={title || t({ en: "Publication", ar: "المنشور" })}>
      <QueryStatus query={recordQuery} />
      {recordQuery.data && (
        <>
          <p>
            {string(data.status)} ·{" "}
            {data.hasUnpublishedChanges === true
              ? t({
                  en: "Draft differs from public version",
                  ar: "المسودة تختلف عن الإصدار العام",
                })
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
              <PublicDocument value={data.document} />
              <div className="student-connected-actions">
                {canEdit && (
                  <Button onClick={() => setEditor(structuredClone(data))}>
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
              <ChildrenPanel
                section={section}
                parent={data}
                canEdit={canEdit}
              />
              {section === "campaigns" && (
                <CampaignAlbumAdmin parent={data} canCreate={can("create")} />
              )}{" "}
              {section === "executive-bodies" && can("manage") && (
                <SetCurrentBody parent={data} />
              )}
            </>
          )}
          {tab === "preview" && (
            <>
              <label>
                {t({ en: "Saved version", ar: "الإصدار المحفوظ" })}
                <input
                  value={selectedVersion}
                  placeholder={t({
                    en: "Leave blank for current draft",
                    ar: "اتركه فارغًا للمسودة الحالية",
                  })}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                />
              </label>
              <QueryStatus query={preview} />
              {preview.data && (
                <>
                  <p className="eyebrow">
                    {t({ en: "Administrative preview", ar: "معاينة إدارية" })} ·{" "}
                    {string(preview.data.versionId)}
                  </p>
                  <PublicDocument value={preview.data.document} />
                </>
              )}
            </>
          )}
          {tab === "versions" && (
            <>
              <QueryStatus query={history} />
              {history.data && (
                <>
                  {rows(history.data.items).map((row) => (
                    <div className="publication-row" key={string(row.id)}>
                      <div>
                        <strong>#{Number(row.versionNumber)}</strong>
                        <p>
                          {string(row.changeSummary)} · {string(row.createdAt)}
                        </p>
                        <code>{string(row.checksum)}</code>
                      </div>
                      <div className="student-connected-actions">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedVersion(string(row.id));
                            setTab("preview");
                          }}
                        >
                          {t({ en: "Preview version", ar: "معاينة الإصدار" })}
                        </Button>
                        {can("restore_version") && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              open(
                                "restore",
                                string(data.version),
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
                  <Empty items={rows(history.data.items)} />
                  <Pager
                    page={historyPage}
                    total={Number(history.data.total)}
                    onChange={setHistoryPage}
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
                  {rows(schedules.data.items).map((row) => {
                    const permit = can(
                      /archive/i.test(string(row.action))
                        ? "archive"
                        : "publish",
                    );
                    return (
                      <div key={string(row.id)} className="publication-row">
                        <div>
                          <strong>
                            {string(row.action)} · {string(row.status)}
                          </strong>
                          <p>
                            {string(row.executeAt)} ·{" "}
                            {t({ en: "Attempts", ar: "المحاولات" })}:{" "}
                            {Number(row.attempts)} {string(row.errorCode)}
                          </p>
                          <code>{string(row.version)}</code>
                        </div>
                        {permit && (
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
                    );
                  })}
                  <Empty items={rows(schedules.data.items)} />
                  <Pager
                    page={schedulePage}
                    total={Number(schedules.data.total)}
                    onChange={setSchedulePage}
                  />
                </>
              )}
            </>
          )}
          {editor && (
            <PublicationEditor
              section={section}
              snapshot={editor}
              onSave={(doc, summary, version) =>
                actions.save(id, version!, doc, summary)
              }
              onClose={() => setEditor(null)}
            />
          )}
          {dialog && (
            <ActionDialog
              {...dialog}
              allowCompatibility={section !== "conferences"}
              onExecute={execute}
              onClose={() => setDialog(null)}
            />
          )}
        </>
      )}
    </Panel>
  );
}
