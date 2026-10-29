import { useServices } from "../../app/providers/ServicesProvider";
import { ContentRollbackPanel } from "../content-live/ContentReviewPanel";
import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Clock3,
  FileClock,
  History,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { formatDate } from "../../lib/dates";
import type { AdminContentVersion } from "../../types/admin";
import { adminStatusKey } from "../admin-format";
import {
  useAdminActions,
  useAdminContent,
  useAdminVersions,
} from "../useAdmin";

export default function AdminVersionsPage() {
  return useServices().contentApi ? (
    <div className="container academic-admin">
      <ContentRollbackPanel />
    </div>
  ) : (
    <PreviewAdminVersionsPage />
  );
}
function PreviewAdminVersionsPage() {
  const { label, t, locale } = useLocale();
  const content = useAdminContent();
  const [itemId, setItemId] = useState<string>();
  const resolvedItemId = itemId || content.data?.[0]?.id;
  const versions = useAdminVersions(resolvedItemId);
  const actions = useAdminActions();
  const [selectedId, setSelectedId] = useState<string>();
  const [restoreTarget, setRestoreTarget] =
    useState<AdminContentVersion | null>(null);
  useEffect(() => {
    if (!itemId && content.data?.length) setItemId(content.data[0].id);
  }, [content.data, itemId]);
  useEffect(() => {
    if (
      versions.data?.length &&
      !versions.data.some((item) => item.id === selectedId)
    )
      setSelectedId(versions.data[0].id);
  }, [selectedId, versions.data]);
  if (content.isPending || versions.isPending) return <LoadingState />;
  if (content.isError || versions.isError)
    return (
      <ErrorState
        retry={() => {
          void content.refetch();
          void versions.refetch();
        }}
      />
    );
  const item = content.data.find((entry) => entry.id === resolvedItemId);
  const selected =
    versions.data.find((entry) => entry.id === selectedId) || null;
  const restore = async () => {
    if (!restoreTarget || !resolvedItemId) return;
    try {
      await actions.restore({
        itemId: resolvedItemId,
        versionId: restoreTarget.id,
      });
      setRestoreTarget(null);
      toast.success(label("adminRestored"));
    } catch {
      toast.error(label("adminRestoreFailed"));
    }
  };
  return (
    <div className="container admin-page admin-versions-page">
      <PageIntro
        eyebrow={label("adminVersionsEyebrow")}
        title={label("adminVersionsTitle")}
        description={label("adminVersionsBody")}
      />
      <div className="admin-version-picker">
        <label htmlFor="version-content">{label("adminChooseContent")}</label>
        <select
          id="version-content"
          value={resolvedItemId || ""}
          onChange={(event) => {
            setItemId(event.target.value);
            setSelectedId(undefined);
          }}
        >
          {content.data.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {t(entry.title)}
            </option>
          ))}
        </select>
        {item && (
          <span className="admin-current-version">
            <ShieldCheck size={16} />
            {label("adminCurrentVersion")} · {item.versionNumber}
          </span>
        )}
      </div>
      {versions.data.length ? (
        <div className="admin-version-workbench">
          <ol className="admin-version-timeline">
            {versions.data.map((version) => {
              const current = version.versionNumber === item?.versionNumber;
              return (
                <li key={version.id} data-current={current || undefined}>
                  <button
                    type="button"
                    data-active={selected?.id === version.id || undefined}
                    onClick={() => setSelectedId(version.id)}
                  >
                    <span className="admin-version-node">
                      <FileClock size={17} />
                    </span>
                    <span>
                      <strong>
                        {label("adminVersion")} {version.versionNumber}
                      </strong>
                      <small>{t(version.reason)}</small>
                      <time>
                        {formatDate(version.createdAt, locale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </span>
                    {current && <b>{label("adminCurrent")}</b>}
                  </button>
                </li>
              );
            })}
          </ol>
          {selected && item && (
            <section className="admin-version-compare">
              <header>
                <ArrowRightLeft size={20} />
                <span>{label("adminCompare")}</span>
              </header>
              <div className="admin-snapshot-grid">
                <article>
                  <span>{label("adminCurrent")}</span>
                  <b>
                    {label("adminVersion")} {item.versionNumber}
                  </b>
                  <h2>{t(item.title)}</h2>
                  <p className="admin-status" data-status={item.status}>
                    {label(adminStatusKey(item.status))}
                  </p>
                  <small>
                    {item.reviewerNote
                      ? t(item.reviewerNote)
                      : label("adminUnassigned")}
                  </small>
                </article>
                <i className="admin-compare-pulse">
                  <ArrowRightLeft size={18} />
                </i>
                <article data-old="true">
                  <span>{formatDate(selected.createdAt, locale)}</span>
                  <b>
                    {label("adminVersion")} {selected.versionNumber}
                  </b>
                  <h2>{t(selected.snapshot.title)}</h2>
                  <p
                    className="admin-status"
                    data-status={selected.snapshot.status}
                  >
                    {label(adminStatusKey(selected.snapshot.status))}
                  </p>
                  <small>
                    {selected.snapshot.reviewerNote
                      ? t(selected.snapshot.reviewerNote)
                      : t(selected.reason)}
                  </small>
                </article>
              </div>
              <Button
                variant="outline"
                disabled={
                  selected.versionNumber === item.versionNumber ||
                  actions.isMutating
                }
                onClick={() => setRestoreTarget(selected)}
              >
                <RotateCcw size={17} /> {label("adminRestore")}
              </Button>
            </section>
          )}
        </div>
      ) : (
        <div className="admin-no-versions">
          <History size={31} />
          <p>{label("adminNoVersions")}</p>
        </div>
      )}
      <aside className="admin-boundary-panel admin-version-boundary">
        <Clock3 size={22} />
        <div>
          <strong>{label("adminPermissionsBoundary")}</strong>
          <p>{label("adminPermissionsBoundaryBody")}</p>
        </div>
      </aside>
      <Modal
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        title={label("adminRestoreTitle")}
        description={label("adminRestoreBody")}
        className="admin-confirm-dialog"
      >
        <div className="admin-confirm-mark">
          <RotateCcw size={29} />
        </div>
        <p>
          {restoreTarget
            ? `${label("adminVersion")} ${restoreTarget.versionNumber} · ${t(restoreTarget.snapshot.title)}`
            : ""}
        </p>
        <div className="admin-confirm-actions">
          <Button variant="outline" onClick={() => setRestoreTarget(null)}>
            {label("close")}
          </Button>
          <Button
            className="button button-primary"
            disabled={actions.isMutating}
            onClick={() => void restore()}
          >
            {label("adminRestoreConfirm")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
