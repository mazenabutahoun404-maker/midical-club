import { useState } from "react";
import { createRecordId } from "../../lib/record-id";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import type { LibraryCollection } from "../../types/workspace";
export type CollectionAction =
  | { kind: "create" }
  | { kind: "rename" | "delete"; collection: LibraryCollection };
export function CollectionDialog({
  action,
  close,
}: {
  action: CollectionAction;
  close: () => void;
}) {
  const { label } = useLocale();
  const { state, send } = useWorkspace();
  const [name, setName] = useState(
    action.kind === "create" ? "" : action.collection.name,
  );
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const deleting = action.kind === "delete";
  async function save() {
    const cleaned = name.trim();
    if (
      !deleting &&
      (!cleaned ||
        cleaned.length > 60 ||
        state.collections.some(
          (c) =>
            c.name.toLowerCase() === cleaned.toLowerCase() &&
            (action.kind === "create" || c.id !== action.collection.id),
        ))
    ) {
      setError(label("collectionInvalid"));
      return;
    }
    setBusy(true);
    const ok = await send(
      action.kind === "create"
        ? { type: "create-collection", id: createRecordId(), name: cleaned }
        : action.kind === "delete"
          ? { type: "delete-collection", id: action.collection.id }
          : {
              type: "rename-collection",
              id: action.collection.id,
              name: cleaned,
            },
    );
    setBusy(false);
    if (ok) close();
  }
  return (
    <Modal
      open
      onClose={close}
      title={label(
        deleting
          ? "deleteCollection"
          : action.kind === "create"
            ? "newCollection"
            : "renameCollection",
      )}
      description={label(deleting ? "deleteCollectionBody" : "collectionHelp")}
    >
      <form
        className="workspace-form"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        {!deleting && (
          <label className="workspace-field">
            <span>{label("collectionName")}</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              maxLength={60}
              required
            />
          </label>
        )}
        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
        <div className="workspace-form-actions">
          <Button type="button" variant="outline" onClick={close}>
            {label("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={busy}
            className="button button-primary"
          >
            {label(
              deleting
                ? "delete"
                : action.kind === "create"
                  ? "create"
                  : "saveChanges",
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function OrganizeDialog({
  itemId,
  title,
  close,
}: {
  itemId: string;
  title: string;
  close: () => void;
}) {
  const { label } = useLocale();
  const { state, send } = useWorkspace();
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open
      onClose={close}
      title={label("organizeItem")}
      description={label("organizeBody")}
    >
      <strong className="organize-title">{title}</strong>
      <div className="collection-choices">
        {state.collections.map((c) => (
          <label key={c.id}>
            <input
              type="checkbox"
              checked={c.itemIds.includes(itemId)}
              disabled={busy}
              onChange={async (e) => {
                setBusy(true);
                await send({
                  type: "collection-item",
                  collectionId: c.id,
                  itemId,
                  included: e.target.checked,
                });
                setBusy(false);
              }}
            />
            <span>{c.name}</span>
            <small>{c.itemIds.length}</small>
          </label>
        ))}
        {!state.collections.length && <p>{label("noCollections")}</p>}
      </div>
      <Button variant="outline" onClick={close}>
        {label("close")}
      </Button>
    </Modal>
  );
}
