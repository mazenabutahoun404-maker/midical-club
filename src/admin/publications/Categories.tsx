import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { string } from "../../services/api/mapping";
import { publicationVersion } from "../../services/api/publication-contracts";
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
import { sectionInfo } from "../../features/publications/model";
import { Fields } from "./Fields";
import { ActionDialog } from "./ActionDialog";
import type { Schemas } from "../../services/api/schema.generated";
export function Categories({
  section,
}: {
  section: "activities" | "honor-plate";
}) {
  const { api } = usePublicationConnection(),
    { t } = useLocale(),
    [page, setPage] = useState(1),
    [editing, setEditing] = useState<Record<string, unknown> | null>(null),
    [archive, setArchive] = useState<Record<string, unknown> | null>(null),
    q = usePublicationQuery(
      "admin-categories",
      (signal) =>
        api.get_api_v1_admin_by_contentType_categories({
          path: { contentType: section },
          query: { Page: page, PageSize: 20 },
          signal,
        }),
      [section, page],
      true,
      true,
    );
  return (
    <Panel
      title={
        t(sectionInfo[section]) + " · " + t({ en: "Categories", ar: "الفئات" })
      }
    >
      <Button variant="outline" onClick={() => setEditing({ displayOrder: 0 })}>
        {t({ en: "New category", ar: "فئة جديدة" })}
      </Button>
      <QueryStatus query={q} />
      {q.data && (
        <>
          {rows(q.data.items).map((row) => (
            <div key={string(row.id)} className="publication-row">
              <div>
                <strong>
                  {string(row.name) ||
                    string(row.nameEn) ||
                    string(row.nameAr) ||
                    string(row.slug)}
                </strong>
                <p>{string(row.status)}</p>
              </div>
              <div className="student-connected-actions">
                <Button
                  variant="outline"
                  disabled={!row.version}
                  onClick={() => setEditing(structuredClone(row))}
                >
                  {t({ en: "Edit", ar: "تعديل" })}
                </Button>
                <Button
                  variant="outline"
                  disabled={!row.version}
                  onClick={() => setArchive(structuredClone(row))}
                >
                  {t({ en: "Archive", ar: "أرشفة" })}
                </Button>
              </div>
            </div>
          ))}
          <Empty items={rows(q.data.items)} />
          <Pager page={page} total={Number(q.data.total)} onChange={setPage} />
        </>
      )}
      {editing && (
        <CategoryEditor
          section={section}
          snapshot={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {archive && (
        <ActionDialog
          kind="archive"
          allowFutureArchive={false}
          title={string(archive.name) || string(archive.slug)}
          version={publicationVersion(archive.version)}
          onClose={() => setArchive(null)}
          onExecute={(body) =>
            api.post_api_v1_admin_by_contentType_categories_by_id_archive({
              path: { contentType: section, id: string(archive.id) },
              body,
            })
          }
        />
      )}
    </Panel>
  );
}
function CategoryEditor({
  section,
  snapshot,
  onClose,
}: {
  section: "activities" | "honor-plate";
  snapshot: Record<string, unknown>;
  onClose: () => void;
}) {
  const { api } = usePublicationConnection(),
    { t } = useLocale(),
    [draft, setDraft] = useState(() =>
      Object.fromEntries(
        [
          "nameEn",
          "nameAr",
          "slug",
          "descriptionEn",
          "descriptionAr",
          "displayOrder",
          "version",
        ]
          .filter((k) => snapshot[k] !== undefined)
          .map((k) => [k, snapshot[k]]),
      ),
    ),
    action = usePublicationAction();
  return (
    <Modal
      open
      title={t({ en: "Category", ar: "الفئة" })}
      description={t({
        en: "Edit the category metadata.",
        ar: "تعديل بيانات الفئة.",
      })}
      className="publication-modal"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(
            () =>
              snapshot.id
                ? api.put_api_v1_admin_by_contentType_categories_by_id({
                    path: { contentType: section, id: string(snapshot.id) },
                    body: {
                      ...draft,
                      version: publicationVersion(snapshot.version),
                    } as Schemas["PublicCategoryInput"],
                  })
                : api.post_api_v1_admin_by_contentType_categories({
                    path: { contentType: section },
                    body: draft as Schemas["PublicCategoryInput"],
                  }),
            onClose,
          );
        }}
      >
        <Fields
          schema="PublicCategoryInput"
          value={draft}
          onChange={setDraft}
        />
        {action.feedback}
        <Button type="submit" disabled={action.busy}>
          {t({ en: "Save category", ar: "حفظ الفئة" })}
        </Button>
      </form>
    </Modal>
  );
}
