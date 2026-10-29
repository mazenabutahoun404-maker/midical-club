import { useState } from "react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import {
  useOperationsConnection,
  useOperationsQuery,
  useOperationsAction,
  Panel,
  QueryStatus,
} from "./shared";
import { Facts, Table } from "./UI";
import { OperationsEditor } from "./Forms";
import { savedJson, settingPayload } from "./model";
import { ApiHealth } from "./ApiHealth";
import { record, string } from "../../services/api/mapping";
type Entry = Record<string, unknown>;
export function System() {
  const { api } = useOperationsConnection(),
    { t } = useLocale(),
    [edit, setEdit] = useState<{
      key: string;
      saved: Entry;
      definition: Entry;
    } | null>(null),
    [open, setOpen] = useState(false),
    [page, setPage] = useState(1),
    [result, setResult] = useState<unknown>(null);
  const settings = useOperationsQuery(
      "settings",
      (signal) => api.get_api_v1_admin_system_settings({ signal }),
      "",
      true,
      true,
    ),
    health = useOperationsQuery(
      "health",
      (signal) => api.get_api_v1_admin_health_details({ signal }),
      "",
      true,
      true,
    ),
    backups = useOperationsQuery(
      "backups",
      (signal) => api.get_api_v1_admin_operations_backups({ signal }),
      "",
      true,
      true,
    ),
    checks = useOperationsQuery(
      "restore-verifications",
      (signal) =>
        api.get_api_v1_admin_operations_restore_verifications({
          query: { page },
          signal,
        }),
      page,
      true,
      true,
    );
  return (
    <>
      <ApiHealth />
      <Panel title={t({ en: "System health", ar: "صحة النظام" })}>
        <QueryStatus query={health} />
        {health.data && (
          <>
            <Facts value={health.data} />
            <Table value={health.data.heartbeats} />
          </>
        )}
      </Panel>
      <Panel title={t({ en: "System settings", ar: "إعدادات النظام" })}>
        <QueryStatus query={settings} />
        {settings.data && (
          <>
            {[
              ...new Set([
                ...settings.data.definitions.map((v) => v.key),
                ...settings.data.values.map((v) => v.settingKey),
              ]),
            ].map((key) => {
              const definition =
                  settings.data.definitions.find((v) => v.key === key) || {},
                saved =
                  settings.data.values.find((v) => v.settingKey === key) || {};
              return (
                <article className="operations-card" key={key}>
                  <h3>{key}</h3>
                  <Facts value={definition} />
                  {Object.keys(saved).length > 0 && <Facts value={saved} />}
                  <Button
                    variant="outline"
                    onClick={() => setEdit({ key, saved, definition })}
                  >
                    {t({ en: "Edit setting", ar: "تعديل الإعداد" })} {key}
                  </Button>
                </article>
              );
            })}
          </>
        )}
        {edit && (
          <SettingForm
            key={edit.key}
            settingKey={edit.key}
            saved={edit.saved}
            definition={edit.definition}
            onClose={() => setEdit(null)}
          />
        )}
      </Panel>
      <Panel title={t({ en: "Backup evidence", ar: "أدلة النسخ الاحتياطي" })}>
        <QueryStatus query={backups} />
        {backups.data && (
          <>
            <Facts value={{ scheduler: backups.data.scheduler }} />
            <Table value={backups.data.evidence} />
          </>
        )}
        <p>
          {t({
            en: "Scheduler state and recorded evidence do not establish that a database restore succeeded.",
            ar: "حالة المجدول والأدلة المسجلة لا تثبت نجاح استعادة قاعدة البيانات.",
          })}
        </p>
      </Panel>
      <Panel
        title={t({
          en: "Restore verification requests",
          ar: "طلبات التحقق من الاستعادة",
        })}
      >
        <Button onClick={() => setOpen(true)}>
          {t({ en: "Request verification", ar: "طلب التحقق" })}
        </Button>
        {result != null && <Facts value={result} />}
        <QueryStatus query={checks} />
        {checks.data && (
          <>
            <Table value={checks.data} />
            <div className="operations-toolbar">
              <Button
                disabled={page === 1}
                variant="outline"
                onClick={() => setPage(page - 1)}
              >
                {t({ en: "Previous", ar: "السابق" })}
              </Button>
              <span>{page}</span>
              <Button
                disabled={!checks.data.length}
                variant="outline"
                onClick={() => setPage(page + 1)}
              >
                {t({ en: "Next", ar: "التالي" })}
              </Button>
            </div>
          </>
        )}
        {open && (
          <OperationsEditor
            operation="post_api_v1_admin_operations_restore_verifications"
            title={t({
              en: "Request restore verification",
              ar: "طلب التحقق من الاستعادة",
            })}
            description={t({
              en: "This submits a verification request. The returned status and executor are evidence of the request, not a completed restore.",
              ar: "يرسل هذا الإجراء طلب تحقق. الحالة والمنفذ دليل على الطلب ولا يعنيان اكتمال الاستعادة.",
            })}
            requireFields={["backupIdentifier"]}
            onSaved={setResult}
            onClose={() => setOpen(false)}
          />
        )}
      </Panel>
    </>
  );
}
function SettingForm({
  saved,
  definition,
  onClose,
  settingKey,
}: {
  saved: Entry;
  definition: Entry;
  onClose: () => void;
  settingKey?: string;
}) {
  const { api } = useOperationsConnection(),
    { t } = useLocale(),
    action = useOperationsAction(),
    [raw, setRaw] = useState(() => {
      try {
        return (
          JSON.stringify(
            saved.valueJson === undefined
              ? definition.defaultValue
              : savedJson(saved.valueJson),
            null,
            2,
          ) ?? ""
        );
      } catch {
        return string(saved.valueJson);
      }
    }),
    key = settingKey || string(saved.settingKey) || string(definition.key);
  return (
    <Modal
      open
      title={t({ en: "Edit system setting", ar: "تعديل إعداد النظام" })}
      description={key}
      className="engagement-modal operations-editor"
      onClose={() => {
        if (!action.busy) onClose();
      }}
    >
      <form
        className="engagement-form"
        onSubmit={(e) => {
          e.preventDefault();
          void action.run(
            () =>
              api.put_api_v1_admin_system_settings_by_key({
                path: { key },
                body: settingPayload(raw, saved, definition),
              }),
            onClose,
          );
        }}
      >
        <label>
          {t({ en: "Setting value (JSON)", ar: "قيمة الإعداد (JSON)" })}
          <textarea
            rows={6}
            dir="ltr"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
        </label>
        <Facts value={definition} />
        <p>
          {t({
            en: "Save uses the version captured when this editor opened. A conflict keeps your draft.",
            ar: "يستخدم الحفظ النسخة الملتقطة عند فتح المحرر. يحتفظ التعارض بمسودتك.",
          })}
        </p>
        {action.feedback}
        <Button disabled={action.busy}>
          {t({ en: "Save setting", ar: "حفظ الإعداد" })}
        </Button>
      </form>
    </Modal>
  );
}
