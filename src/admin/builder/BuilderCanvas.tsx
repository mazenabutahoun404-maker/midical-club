import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  EyeOff,
  GripVertical,
  Layers3,
  Trash2,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { BuilderBlock, BuilderDevice } from "../../types/builder";
import { BuilderBlockPreview } from "./BuilderBlockPreview";
import { builderBlockKey } from "./builder-format";

export function BuilderCanvas({
  blocks,
  selectedId,
  device,
  onSelect,
  onMove,
  onDuplicate,
  onDelete,
}: {
  blocks: BuilderBlock[];
  selectedId: string | null;
  device: BuilderDevice;
  onSelect: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { label, t } = useLocale();
  const [dragging, setDragging] = useState<number | null>(null);
  if (!blocks.length)
    return (
      <section className="builder-canvas-shell" data-device={device}>
        <div className="builder-canvas-empty">
          <span>
            <Layers3 size={26} />
          </span>
          <h2>{label("builderCanvasEmpty")}</h2>
          <p>{label("builderCanvasEmptyBody")}</p>
        </div>
      </section>
    );
  return (
    <section
      className="builder-canvas-shell"
      data-device={device}
      aria-label={label("builderCanvas")}
    >
      <div className="builder-canvas-browser" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>medclub.jo</span>
      </div>
      <div className="builder-canvas-page">
        {blocks.map((block, index) => (
          <article
            key={block.id}
            className="builder-canvas-block"
            data-selected={selectedId === block.id || undefined}
            data-disabled={!block.enabled || undefined}
            data-dragging={dragging === index || undefined}
            onClick={() => onSelect(block.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (dragging !== null && dragging !== index)
                onMove(dragging, index);
              setDragging(null);
            }}
          >
            <header className="builder-block-toolbar">
              <button
                type="button"
                draggable
                className="builder-drag-handle"
                aria-label={label("builderDragBlock")}
                onDragStart={(event) => {
                  event.stopPropagation();
                  setDragging(index);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", block.id);
                }}
                onDragEnd={() => setDragging(null)}
              >
                <GripVertical size={16} />
              </button>
              <span>
                <small>{label(builderBlockKey(block.type))}</small>
                <strong>{t(block.name)}</strong>
              </span>
              {!block.enabled && (
                <EyeOff size={15} aria-label={label("builderEnabled")} />
              )}
              <div>
                <button
                  type="button"
                  aria-label={label("builderMoveUp")}
                  disabled={index === 0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onMove(index, index - 1);
                  }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label={label("builderMoveDown")}
                  disabled={index === blocks.length - 1}
                  onClick={(event) => {
                    event.stopPropagation();
                    onMove(index, index + 1);
                  }}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  aria-label={label("builderDuplicateBlock")}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDuplicate(block.id);
                  }}
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  aria-label={label("builderDeleteBlock")}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(block.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </header>
            <div className="builder-block-stage">
              <BuilderBlockPreview block={block} />
              <div className="builder-block-rules">
                <span>
                  {label(builderAudienceLabel(block.visibility.audience))}
                </span>
                {block.visibility.locale !== "all" && (
                  <span>{block.visibility.locale.toUpperCase()}</span>
                )}
                {(block.schedule.startsAt || block.schedule.endsAt) && (
                  <span>{label("builderSchedule")}</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function builderAudienceLabel(value: BuilderBlock["visibility"]["audience"]) {
  if (value === "students") return "builderAudienceStudents" as const;
  if (value === "members") return "builderAudienceMembers" as const;
  return "builderAudiencePublic" as const;
}
