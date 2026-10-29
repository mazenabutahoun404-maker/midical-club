import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { record, string } from "../../services/api/mapping";
import type { PublicationSection } from "../../services/api/publication-contracts";
import {
  publicationVersion,
  validatePublicationSchema,
} from "../../services/api/publication-contracts";
import { publicationInputSchemas } from "../../services/api/publication-inputs.generated";
import { createRecordUuid } from "../../lib/record-uuid";
import {
  usePublicationConnection,
  usePublicationAction,
  Panel,
  rows,
  Confirm,
} from "../../features/publications/shared";
import { publicationTitle } from "../../features/publications/model";
import { Fields } from "./Fields";
import { childActions, childSchemas, type ChildKind } from "./children";
const names: Record<ChildKind, { en: string; ar: string }> = {
  assets: { en: "Linked assets", ar: "الملفات المرتبطة" },
  links: { en: "Links", ar: "الروابط" },
  speakers: { en: "Speakers", ar: "المتحدثون" },
  scheduleItems: { en: "Programme", ar: "البرنامج" },
  sponsors: { en: "Sponsors", ar: "الرعاة" },
  members: { en: "Members", ar: "الأعضاء" },
  items: { en: "Album items", ar: "عناصر الألبوم" },
};
function ChildEditor({
  section,
  parent,
  kind,
  item,
  onClose,
}: {
  section: PublicationSection;
  parent: Record<string, unknown>;
  kind: ChildKind;
  item?: Record<string, unknown>;
  onClose: () => void;
}) {
  const { api } = usePublicationConnection(),
    { t } = useLocale(),
    [version] = useState(() => publicationVersion(parent.version)),
    [draft, setDraft] = useState<Record<string, unknown>>(() =>
      item
        ? structuredClone(item)
        : { id: createRecordUuid(), displayOrder: 0, sortOrder: 0 },
    ),
    [summary, setSummary] = useState(""),
    action = usePublicationAction();
  // A child has exactly its own schema. Do not send unrelated default fields.
  const props = record(
    record(publicationInputSchemas[childSchemas[kind]]).properties,
  );
  const filtered = Object.fromEntries(
    Object.entries(draft).filter(([key]) => key in props),
  );
  return (
    <Modal
      open
      title={t(names[kind])}
      description={t({
        en: "This changes the parent draft using its reviewed version.",
        ar: "يعدّل هذا مسودة الأصل باستخدام الإصدار المراجع.",
      })}
      className="publication-modal"
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(() => {
            validatePublicationSchema(
              filtered,
              publicationInputSchemas[childSchemas[kind]],
            );
            return childActions(api, section, string(parent.id), kind).save(
              version,
              filtered,
              summary,
              item ? string(item.id) : undefined,
            );
          }, onClose);
        }}
      >
        <Fields
          schema={childSchemas[kind]}
          value={filtered}
          onChange={setDraft}
        />
        <label>
          {t({ en: "Change summary", ar: "ملخص التغيير" })}
          <input value={summary} onChange={(e) => setSummary(e.target.value)} />
        </label>
        {action.feedback}
        <Button type="submit" disabled={action.busy}>
          {t({ en: "Save child draft", ar: "حفظ مسودة العنصر" })}
        </Button>
      </form>
    </Modal>
  );
}
export function ChildrenPanel({
  section,
  parent,
  canEdit,
}: {
  section: PublicationSection;
  parent: Record<string, unknown>;
  canEdit: boolean;
}) {
  const { api } = usePublicationConnection(),
    { t, locale } = useLocale(),
    action = usePublicationAction(),
    [editing, setEditing] = useState<{
      kind: ChildKind;
      item?: Record<string, unknown>;
      parent: Record<string, unknown>;
    } | null>(null),
    [deleting, setDeleting] = useState<{
      kind: ChildKind;
      id: string;
      label: string;
      version: string;
    } | null>(null);
  const kinds: ChildKind[] = [
    "assets",
    "links",
    ...(section === "conferences"
      ? (["speakers", "scheduleItems", "sponsors"] as ChildKind[])
      : section === "executive-bodies"
        ? (["members"] as ChildKind[])
        : section === "albums"
          ? (["items"] as ChildKind[])
          : []),
  ];
  return (
    <>
      <div className="publication-child-panels">
        {kinds.map((kind) => (
          <Panel key={kind} title={t(names[kind])}>
            {canEdit && (
              <Button
                variant="outline"
                onClick={() =>
                  setEditing({ kind, parent: structuredClone(parent) })
                }
              >
                {t({ en: "Add", ar: "إضافة" })}
              </Button>
            )}
            {rows(record(parent.document)[kind]).length ? (
              rows(record(parent.document)[kind]).map((item) => (
                <div key={string(item.id)} className="publication-row">
                  <div>
                    <strong>
                      {publicationTitle(item, locale) ||
                        string(item.role) ||
                        string(item.assetId) ||
                        string(item.id)}
                    </strong>
                    {!!item.url && <p>{string(item.url)}</p>}
                  </div>
                  {canEdit && (
                    <div className="student-connected-actions">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setEditing({
                            kind,
                            item: structuredClone(item),
                            parent: structuredClone(parent),
                          })
                        }
                      >
                        {t({ en: "Edit", ar: "تعديل" })}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setDeleting({
                            kind,
                            id: string(item.id),
                            label:
                              publicationTitle(item, locale) || string(item.id),
                            version: publicationVersion(parent.version),
                          })
                        }
                      >
                        {t({ en: "Remove", ar: "إزالة" })}
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="muted">
                {t({ en: "No linked items.", ar: "لا توجد عناصر مرتبطة." })}
              </p>
            )}
          </Panel>
        ))}
      </div>
      {action.feedback}
      {editing && (
        <ChildEditor
          section={section}
          {...editing}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <Confirm
          busy={action.busy}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            void action.run(
              () =>
                childActions(
                  api,
                  section,
                  string(parent.id),
                  deleting.kind,
                ).remove(deleting.version, deleting.id),
              () => setDeleting(null),
            )
          }
        >
          {t({ en: "Remove from the draft", ar: "إزالة من المسودة" })}:{" "}
          {deleting.label}?
        </Confirm>
      )}
    </>
  );
}
