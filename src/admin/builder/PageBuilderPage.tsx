import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronDown,
  Cloud,
  CloudOff,
  Eye,
  Monitor,
  Redo2,
  Save,
  Send,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { AppLink } from "../../components/navigation/AppLink";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import type {
  BuilderBlock,
  BuilderBlockType,
  BuilderDevice,
  BuilderPageDocument,
  BuilderTemplate,
} from "../../types/builder";
import { BuilderCanvas } from "./BuilderCanvas";
import { BuilderInspector } from "./BuilderInspector";
import { BuilderPalette } from "./BuilderPalette";
import { BuilderPreviewModal } from "./BuilderPreviewModal";
import { createBuilderBlock } from "./builder-blocks";
import { builderStatusKey } from "./builder-format";
import { useBuilderEditor } from "./useBuilderEditor";
import {
  useBuilderActions,
  useBuilderPage,
  useBuilderTemplates,
  useBuilderVersions,
} from "./useBuilder";

export default function PageBuilderPage() {
  const { pageId } = useParams();
  const { label, t } = useLocale();
  const query = useBuilderPage(pageId);
  const templatesQuery = useBuilderTemplates();
  const versionsQuery = useBuilderVersions(pageId);
  const actions = useBuilderActions();
  const editor = useBuilderEditor(query.data);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<BuilderDevice>("desktop");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("2026-09-20T08:00");
  const page = editor.page;
  const selected = useMemo(
    () => page?.blocks.find((block) => block.id === selectedId) || null,
    [page?.blocks, selectedId],
  );

  useEffect(() => {
    if (!page || selectedId) return;
    setSelectedId(page.blocks[0]?.id || null);
  }, [page, selectedId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLocaleLowerCase() === "s") {
        event.preventDefault();
        void editor
          .saveNow()
          .catch(() => toast.error(label("builderSaveFailed")));
      }
      if (event.key.toLocaleLowerCase() === "z" && event.shiftKey) {
        event.preventDefault();
        editor.redo();
      } else if (event.key.toLocaleLowerCase() === "z") {
        event.preventDefault();
        editor.undo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editor.redo, editor.saveNow, editor.undo, label]);

  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  if (!query.data)
    return (
      <div className="container admin-page builder-not-found">
        <h1>{label("builderNotFound")}</h1>
        <Button asChild variant="outline">
          <AppLink href="/admin/builder">{label("builderBackPages")}</AppLink>
        </Button>
      </div>
    );
  if (!page) return <LoadingState />;

  const changePage = (next: BuilderPageDocument) => editor.change(() => next);
  const changeBlock = (next: BuilderBlock) =>
    editor.change((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === next.id ? next : block,
      ),
    }));
  const addBlock = (type: BuilderBlockType) => {
    const block = createBuilderBlock(
      type,
      page.blocks.length + page.revision + 1,
    );
    editor.change((current) => ({
      ...current,
      blocks: [...current.blocks, block],
    }));
    setSelectedId(block.id);
  };
  const addTemplate = (template: BuilderTemplate) => {
    const block = {
      ...structuredClone(template.block),
      id: `builder-block-template-${page.blocks.length + page.revision + 1}`,
    };
    editor.change((current) => ({
      ...current,
      blocks: [...current.blocks, block],
    }));
    setSelectedId(block.id);
  };
  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= page.blocks.length) return;
    editor.change((current) => {
      const blocks = [...current.blocks];
      const [block] = blocks.splice(from, 1);
      blocks.splice(to, 0, block);
      return { ...current, blocks };
    });
  };
  const duplicateBlock = (id: string) => {
    editor.change((current) => {
      const index = current.blocks.findIndex((block) => block.id === id);
      if (index < 0) return current;
      const block = {
        ...structuredClone(current.blocks[index]),
        id: `builder-block-copy-${current.blocks.length + current.revision + 1}`,
      };
      const blocks = [...current.blocks];
      blocks.splice(index + 1, 0, block);
      window.setTimeout(() => setSelectedId(block.id), 0);
      return { ...current, blocks };
    });
  };
  const deleteBlock = (id: string) => {
    editor.change((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== id),
    }));
    setSelectedId(null);
  };
  const saveTemplate = async (block: BuilderBlock) => {
    await actions.saveTemplate({
      name: block.name,
      description: {
        en: `Reusable ${t(block.name)} section`,
        ar: `قسم ${block.name.ar} قابل لإعادة الاستخدام`,
      },
      block,
    });
    toast.success(label("builderTemplateSaved"));
  };
  const publish = async () => {
    try {
      const saved = await editor.saveNow();
      if (!saved) return;
      const published = await actions.publish(saved.id);
      editor.acceptServerPage(published);
      setPublishOpen(false);
      toast.success(label("builderPublishedMessage"));
    } catch {
      toast.error(label("builderPublishFailed"));
    }
  };
  const schedule = async () => {
    if (!scheduledAt) {
      toast.error(label("builderScheduleRequired"));
      return;
    }
    try {
      const saved = await editor.saveNow();
      if (!saved) return;
      const scheduled = await actions.schedule({
        pageId: saved.id,
        value: { startsAt: scheduledAt },
      });
      editor.acceptServerPage(scheduled);
      setScheduleOpen(false);
      toast.success(label("builderScheduleSaved"));
    } catch {
      toast.error(label("builderPublishFailed"));
    }
  };
  const restore = async (versionId: string) => {
    try {
      const restored = await actions.restore({ pageId: page.id, versionId });
      editor.acceptServerPage(restored);
      setSelectedId(restored.blocks[0]?.id || null);
      toast.success(label("builderRestored"));
    } catch {
      toast.error(label("builderRestoreFailed"));
    }
  };

  return (
    <div className="builder-editor-page">
      <header className="builder-editor-toolbar">
        <div className="builder-editor-identity">
          <AppLink href="/admin/builder" aria-label={label("builderBackPages")}>
            <ArrowLeft className="directional" />
          </AppLink>
          <div>
            <small>{page.slug}</small>
            <h1>{t(page.title)}</h1>
          </div>
          <span className="builder-page-status" data-status={page.status}>
            {label(builderStatusKey(page.status))}
          </span>
        </div>
        <div className="builder-editor-history">
          <button
            type="button"
            aria-label={label("builderUndo")}
            disabled={!editor.canUndo}
            onClick={editor.undo}
          >
            <Undo2 />
          </button>
          <button
            type="button"
            aria-label={label("builderRedo")}
            disabled={!editor.canRedo}
            onClick={editor.redo}
          >
            <Redo2 />
          </button>
          <SaveSignal state={editor.saveState} />
        </div>
        <DeviceSwitcher value={device} onChange={setDevice} />
        <div className="builder-editor-actions">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye />
            {label("builderPreview")}
          </Button>
          <Button variant="outline" onClick={() => setScheduleOpen(true)}>
            <CalendarClock />
            {label("builderSchedule")}
          </Button>
          <Button
            className="button button-primary"
            onClick={() => setPublishOpen(true)}
          >
            <Send />
            {label("builderPublish")}
          </Button>
        </div>
      </header>
      <div className="builder-editor-mobile-status">
        <SaveSignal state={editor.saveState} />
        <span>
          {label("builderRevision")} {page.revision}
        </span>
      </div>
      <div className="builder-workbench">
        <BuilderPalette
          templates={templatesQuery.data || []}
          onAdd={addBlock}
          onAddTemplate={addTemplate}
        />
        <section className="builder-canvas-column">
          <div className="builder-canvas-heading">
            <div>
              <small>{label("builderEditor")}</small>
              <strong>{label("builderCanvas")}</strong>
            </div>
            <button
              type="button"
              onClick={() =>
                void editor
                  .saveNow()
                  .catch(() => toast.error(label("builderSaveFailed")))
              }
            >
              <Save size={15} />
              {label("builderSaveNow")}
            </button>
          </div>
          <BuilderCanvas
            blocks={page.blocks}
            selectedId={selectedId}
            device={device}
            onSelect={setSelectedId}
            onMove={moveBlock}
            onDuplicate={duplicateBlock}
            onDelete={deleteBlock}
          />
        </section>
        <BuilderInspector
          page={page}
          block={selected}
          versions={versionsQuery.data || []}
          onPageChange={changePage}
          onBlockChange={changeBlock}
          onDelete={deleteBlock}
          onDuplicate={duplicateBlock}
          onSaveTemplate={saveTemplate}
          onRestore={restore}
        />
      </div>
      <BuilderPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        page={page}
        device={device}
        onDeviceChange={setDevice}
      />
      <Modal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title={label("builderConfirmPublish")}
        description={label("builderConfirmPublishBody")}
        className="builder-confirm-modal"
      >
        <div className="builder-confirm-panel">
          <span>
            <Send />
          </span>
          <p>{label("builderDeviceNotice")}</p>
          <div>
            <Button variant="outline" onClick={() => setPublishOpen(false)}>
              {label("builderCancel")}
            </Button>
            <Button
              className="button button-primary"
              onClick={() => void publish()}
            >
              {label("builderConfirmPublishAction")}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title={label("builderSchedulePage")}
        description={label("builderScheduleBody")}
        className="builder-confirm-modal"
      >
        <div className="builder-confirm-panel">
          <label className="builder-field">
            <span>{label("builderStartsAt")}</span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
          </label>
          <div>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              {label("builderCancel")}
            </Button>
            <Button
              className="button button-primary"
              onClick={() => void schedule()}
            >
              {label("builderSchedule")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DeviceSwitcher({
  value,
  onChange,
}: {
  value: BuilderDevice;
  onChange: (value: BuilderDevice) => void;
}) {
  const { label } = useLocale();
  const items = [
    { id: "desktop", label: "builderDesktop", icon: Monitor },
    { id: "tablet", label: "builderTablet", icon: Tablet },
    { id: "phone", label: "builderPhone", icon: Smartphone },
  ] as const;
  return (
    <div
      className="builder-device-switcher"
      role="group"
      aria-label={label("builderPreview")}
    >
      {items.map(({ id, label: key, icon: Icon }) => (
        <button
          type="button"
          key={id}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          <Icon />
          <span>{label(key)}</span>
        </button>
      ))}
    </div>
  );
}

function SaveSignal({
  state,
}: {
  state: ReturnType<typeof useBuilderEditor>["saveState"];
}) {
  const { label } = useLocale();
  const content =
    state === "saving"
      ? [Cloud, "builderSaving"]
      : state === "dirty"
        ? [CloudOff, "builderUnsaved"]
        : state === "error"
          ? [CloudOff, "builderSaveFailed"]
          : [Check, "builderSaved"];
  const Icon = content[0] as typeof Check;
  return (
    <span className="builder-save-state" data-state={state}>
      <Icon size={15} />
      {label(content[1] as "builderSaved")}
    </span>
  );
}
