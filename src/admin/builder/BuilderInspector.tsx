import { useEffect, useState } from "react";
import {
  Box,
  Copy,
  FileClock,
  ImageUp,
  Settings2,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Button } from "../../components/ui/button";
import type {
  BuilderBlock,
  BuilderPageDocument,
  BuilderVersion,
} from "../../types/builder";
import type { Locale, Text } from "../../types/content";
import { builderAudienceKey, builderBlockKey } from "./builder-format";

type InspectorTab = "block" | "page" | "versions";

export function BuilderInspector({
  page,
  block,
  versions,
  onPageChange,
  onBlockChange,
  onDelete,
  onDuplicate,
  onSaveTemplate,
  onRestore,
}: {
  page: BuilderPageDocument;
  block: BuilderBlock | null;
  versions: BuilderVersion[];
  onPageChange: (page: BuilderPageDocument) => void;
  onBlockChange: (block: BuilderBlock) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSaveTemplate: (block: BuilderBlock) => Promise<void>;
  onRestore: (versionId: string) => Promise<void>;
}) {
  const { label, t } = useLocale();
  const [tab, setTab] = useState<InspectorTab>(block ? "block" : "page");
  useEffect(() => {
    if (block) setTab("block");
  }, [block?.id]);

  return (
    <aside className="builder-inspector" aria-label={label("builderInspector")}>
      <div
        className="builder-inspector-tabs"
        role="tablist"
        aria-label={label("builderInspector")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "block"}
          disabled={!block}
          onClick={() => setTab("block")}
        >
          <SlidersHorizontal size={16} /> {label("builderContent")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "page"}
          onClick={() => setTab("page")}
        >
          <Settings2 size={16} /> {label("builderPageSettings")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "versions"}
          onClick={() => setTab("versions")}
        >
          <FileClock size={16} /> {label("builderVersions")}
        </button>
      </div>
      <div className="builder-inspector-scroll">
        {tab === "block" && block ? (
          <BlockFields
            block={block}
            onChange={onBlockChange}
            onDelete={() => onDelete(block.id)}
            onDuplicate={() => onDuplicate(block.id)}
            onSaveTemplate={() => onSaveTemplate(block)}
          />
        ) : tab === "page" ? (
          <PageFields page={page} onChange={onPageChange} />
        ) : tab === "versions" ? (
          <section className="builder-version-panel">
            <div className="builder-panel-heading compact">
              <span>
                <FileClock size={17} />
              </span>
              <div>
                <h2>{label("builderVersions")}</h2>
                <p>{label("builderVersionsBody")}</p>
              </div>
            </div>
            {versions.length ? (
              <ol>
                {versions.map((version) => (
                  <li key={version.id}>
                    <span>V{version.versionNumber}</span>
                    <div>
                      <strong>{t(version.reason)}</strong>
                      <small>
                        {version.createdAt.slice(0, 16).replace("T", " · ")}
                      </small>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void onRestore(version.id)}
                    >
                      {label("builderRestore")}
                    </Button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="builder-inspector-empty">
                {label("builderNoVersions")}
              </p>
            )}
          </section>
        ) : (
          <p className="builder-inspector-empty">
            {label("builderInspectorEmpty")}
          </p>
        )}
      </div>
    </aside>
  );
}

function BlockFields({
  block,
  onChange,
  onDelete,
  onDuplicate,
  onSaveTemplate,
}: {
  block: BuilderBlock;
  onChange: (block: BuilderBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSaveTemplate: () => Promise<void>;
}) {
  const { label } = useLocale();
  const data = block.data;
  const patch = (value: Partial<BuilderBlock>) =>
    onChange({ ...block, ...value });
  const patchData = (value: Partial<BuilderBlock["data"]>) =>
    patch({ data: { ...data, ...value } });
  const supportsText = block.type !== "spacer";
  const supportsAction = ["hero", "announcement", "call-to-action"].includes(
    block.type,
  );
  const supportsColumns = [
    "quick-links",
    "course-grid",
    "metrics",
    "group",
  ].includes(block.type);

  const upload = (file?: File) => {
    if (!file) return;
    if (file.size > 1_500_000) {
      toast.error(label("builderUploadTooLarge"));
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      patchData({ imageUrl: String(reader.result || "") }),
    );
    reader.readAsDataURL(file);
  };

  return (
    <div className="builder-fields">
      <div className="builder-inspector-title">
        <span>
          <Box size={17} />
        </span>
        <div>
          <small>{label(builderBlockKey(block.type))}</small>
          <h2>{label("builderContent")}</h2>
        </div>
      </div>
      <TextPairField
        label={label("builderBlockName")}
        value={block.name}
        onChange={(name) => patch({ name })}
      />
      {supportsText && data.eyebrow && (
        <TextPairField
          label={label("builderEyebrowField")}
          value={data.eyebrow}
          onChange={(eyebrow) => patchData({ eyebrow })}
        />
      )}
      {supportsText && data.title && (
        <TextPairField
          label={label("builderHeadingField")}
          value={data.title}
          onChange={(title) => patchData({ title })}
        />
      )}
      {supportsText && data.body && (
        <TextPairField
          multiline
          label={label("builderBodyField")}
          value={data.body}
          onChange={(body) => patchData({ body })}
        />
      )}
      {supportsAction && data.primaryLabel && (
        <TextPairField
          label={label("builderPrimaryLabel")}
          value={data.primaryLabel}
          onChange={(primaryLabel) => patchData({ primaryLabel })}
        />
      )}
      {supportsAction && (
        <Field label={label("builderPrimaryHref")}>
          <input
            value={data.primaryHref || ""}
            onChange={(event) => patchData({ primaryHref: event.target.value })}
          />
        </Field>
      )}
      {block.type === "course-grid" && (
        <Field label={label("builderDynamicSource")}>
          <select
            value={data.source}
            onChange={(event) =>
              patchData({
                source: event.target.value as NonNullable<typeof data.source>,
              })
            }
          >
            <option value="current-courses">
              {label("builderSourceCourses")}
            </option>
            <option value="latest-resources">
              {label("builderSourceResources")}
            </option>
            <option value="upcoming-events">
              {label("builderSourceEvents")}
            </option>
          </select>
        </Field>
      )}
      {supportsColumns && (
        <Field label={label("builderBlocks")}>
          <select
            value={data.columns || 2}
            onChange={(event) =>
              patchData({ columns: Number(event.target.value) as 1 | 2 | 3 })
            }
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </Field>
      )}
      {block.type === "media" && (
        <>
          <Field label={label("builderImageUrl")}>
            <input
              value={data.imageUrl || ""}
              onChange={(event) => patchData({ imageUrl: event.target.value })}
            />
          </Field>
          <TextPairField
            label={label("builderImageAlt")}
            value={data.imageAlt || { en: "", ar: "" }}
            onChange={(imageAlt) => patchData({ imageAlt })}
          />
          <label className="builder-upload-field">
            <ImageUp size={18} />
            <span>
              <strong>{label("builderUploadImage")}</strong>
              <small>{label("builderUploadLimit")}</small>
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => upload(event.target.files?.[0])}
            />
          </label>
          <p className="builder-field-note">{label("builderMediaBoundary")}</p>
        </>
      )}
      {block.type === "spacer" && (
        <Field label={label("builderBlockSpacer")}>
          <select
            value={data.height || "medium"}
            onChange={(event) =>
              patchData({
                height: event.target.value as "small" | "medium" | "large",
              })
            }
          >
            <option value="small">S</option>
            <option value="medium">M</option>
            <option value="large">L</option>
          </select>
        </Field>
      )}

      <div className="builder-field-section">
        <h3>{label("builderRules")}</h3>
        <label className="builder-check-field">
          <input
            type="checkbox"
            checked={block.enabled}
            onChange={(event) => patch({ enabled: event.target.checked })}
          />
          <span>{label("builderEnabled")}</span>
        </label>
        <Field label={label("builderAudience")}>
          <select
            value={block.visibility.audience}
            onChange={(event) =>
              patch({
                visibility: {
                  ...block.visibility,
                  audience: event.target
                    .value as BuilderBlock["visibility"]["audience"],
                },
              })
            }
          >
            {(["public", "students", "members"] as const).map((value) => (
              <option value={value} key={value}>
                {label(builderAudienceKey(value))}
              </option>
            ))}
          </select>
        </Field>
        <Field label={label("builderLocaleTarget")}>
          <select
            value={block.visibility.locale}
            onChange={(event) =>
              patch({
                visibility: {
                  ...block.visibility,
                  locale: event.target
                    .value as BuilderBlock["visibility"]["locale"],
                },
              })
            }
          >
            <option value="all">{label("builderLocaleAll")}</option>
            <option value="en">{label("builderLocaleEnglish")}</option>
            <option value="ar">{label("builderLocaleArabic")}</option>
          </select>
        </Field>
        <div className="builder-schedule-fields">
          <Field label={label("builderStartsAt")}>
            <input
              type="datetime-local"
              value={toLocalDate(block.schedule.startsAt)}
              onChange={(event) =>
                patch({
                  schedule: {
                    ...block.schedule,
                    startsAt: event.target.value || undefined,
                  },
                })
              }
            />
          </Field>
          <Field label={label("builderEndsAt")}>
            <input
              type="datetime-local"
              value={toLocalDate(block.schedule.endsAt)}
              onChange={(event) =>
                patch({
                  schedule: {
                    ...block.schedule,
                    endsAt: event.target.value || undefined,
                  },
                })
              }
            />
          </Field>
        </div>
      </div>
      <div className="builder-inspector-actions">
        <Button
          type="button"
          variant="outline"
          onClick={() => void onSaveTemplate()}
        >
          <Box />
          {label("builderSaveReusable")}
        </Button>
        <Button type="button" variant="outline" onClick={onDuplicate}>
          <Copy />
          {label("builderDuplicateBlock")}
        </Button>
        <Button type="button" variant="destructive" onClick={onDelete}>
          <Trash2 />
          {label("builderDeleteBlock")}
        </Button>
      </div>
    </div>
  );
}

function PageFields({
  page,
  onChange,
}: {
  page: BuilderPageDocument;
  onChange: (page: BuilderPageDocument) => void;
}) {
  const { label } = useLocale();
  return (
    <div className="builder-fields">
      <div className="builder-inspector-title">
        <span>
          <Settings2 size={17} />
        </span>
        <div>
          <small>{page.slug}</small>
          <h2>{label("builderPageSettings")}</h2>
        </div>
      </div>
      <TextPairField
        label={label("builderPageTitle")}
        value={page.title}
        onChange={(title) => onChange({ ...page, title })}
      />
      <Field label={label("builderPath")} hint={label("builderPathHint")}>
        <input
          value={page.slug}
          onChange={(event) => onChange({ ...page, slug: event.target.value })}
        />
      </Field>
      <Field label={label("builderAudience")}>
        <select
          value={page.audience}
          onChange={(event) =>
            onChange({
              ...page,
              audience: event.target.value as BuilderPageDocument["audience"],
            })
          }
        >
          {(["public", "students", "members"] as const).map((value) => (
            <option value={value} key={value}>
              {label(builderAudienceKey(value))}
            </option>
          ))}
        </select>
      </Field>
      <Field label={label("builderTheme")}>
        <select
          value={page.theme}
          onChange={(event) =>
            onChange({
              ...page,
              theme: event.target.value as BuilderPageDocument["theme"],
            })
          }
        >
          <option value="pulse">{label("builderThemePulse")}</option>
          <option value="warm">{label("builderThemeWarm")}</option>
          <option value="clinical">{label("builderThemeClinical")}</option>
        </select>
      </Field>
      <div className="builder-field-section">
        <h3>{label("builderSeo")}</h3>
        <TextPairField
          multiline
          label={label("builderSeoDescription")}
          value={page.seo.description}
          onChange={(description) =>
            onChange({ ...page, seo: { ...page.seo, description } })
          }
        />
        <label className="builder-check-field">
          <input
            type="checkbox"
            checked={page.seo.noIndex}
            onChange={(event) =>
              onChange({
                ...page,
                seo: { ...page.seo, noIndex: event.target.checked },
              })
            }
          />
          <span>{label("builderNoIndex")}</span>
        </label>
      </div>
    </div>
  );
}

function TextPairField({
  label: fieldLabel,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: Text;
  onChange: (value: Text) => void;
  multiline?: boolean;
}) {
  const { label } = useLocale();
  return (
    <fieldset className="builder-text-pair">
      <legend>{fieldLabel}</legend>
      {(["en", "ar"] as Locale[]).map((locale) => (
        <label key={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
          <span>
            {label(locale === "en" ? "builderEnglish" : "builderArabic")}
          </span>
          {multiline ? (
            <textarea
              rows={4}
              value={value[locale]}
              onChange={(event) =>
                onChange({ ...value, [locale]: event.target.value })
              }
            />
          ) : (
            <input
              value={value[locale]}
              onChange={(event) =>
                onChange({ ...value, [locale]: event.target.value })
              }
            />
          )}
        </label>
      ))}
    </fieldset>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="builder-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function toLocalDate(value?: string) {
  return value ? value.slice(0, 16) : "";
}
