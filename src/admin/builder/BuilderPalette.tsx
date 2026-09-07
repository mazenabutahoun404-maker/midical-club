import {
  AlignLeft,
  BarChart3,
  BookOpenCheck,
  Box,
  GalleryHorizontalEnd,
  Image,
  LayoutGrid,
  Megaphone,
  MousePointerClick,
  PanelTop,
  Plus,
  Rows3,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { BuilderBlockType, BuilderTemplate } from "../../types/builder";
import { builderBlockKey } from "./builder-format";
import { builderBlockTypes } from "./builder-blocks";

const icons = {
  hero: PanelTop,
  announcement: Megaphone,
  "rich-text": AlignLeft,
  "quick-links": LayoutGrid,
  "course-grid": BookOpenCheck,
  metrics: BarChart3,
  media: Image,
  "call-to-action": MousePointerClick,
  group: Rows3,
  spacer: GalleryHorizontalEnd,
};

export function BuilderPalette({
  templates,
  onAdd,
  onAddTemplate,
}: {
  templates: BuilderTemplate[];
  onAdd: (type: BuilderBlockType) => void;
  onAddTemplate: (template: BuilderTemplate) => void;
}) {
  const { label, t } = useLocale();
  return (
    <aside className="builder-palette" aria-label={label("builderPalette")}>
      <div className="builder-panel-heading">
        <span>
          <Box size={17} />
        </span>
        <div>
          <h2>{label("builderPalette")}</h2>
          <p>{label("builderPaletteBody")}</p>
        </div>
      </div>
      <section>
        <h3>{label("builderStandardBlocks")}</h3>
        <div className="builder-palette-grid">
          {builderBlockTypes.map((type) => {
            const Icon = icons[type];
            return (
              <button type="button" onClick={() => onAdd(type)} key={type}>
                <span className="builder-palette-icon" aria-hidden="true">
                  <Icon size={18} />
                  <i />
                </span>
                <strong>{label(builderBlockKey(type))}</strong>
                <Plus size={14} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </section>
      <section className="builder-template-library">
        <h3>{label("builderReusableBlocks")}</h3>
        {templates.length ? (
          templates.map((template) => (
            <button
              type="button"
              key={template.id}
              onClick={() => onAddTemplate(template)}
            >
              <span>
                <Box size={16} />
              </span>
              <span>
                <strong>{t(template.name)}</strong>
                <small>{t(template.description)}</small>
              </span>
              <Plus size={14} />
            </button>
          ))
        ) : (
          <p className="builder-template-empty">
            {label("builderNoTemplates")}
          </p>
        )}
      </section>
    </aside>
  );
}
