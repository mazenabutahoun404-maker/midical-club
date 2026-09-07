import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  HeartPulse,
  Microscope,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import type { BuilderBlock } from "../../types/builder";

const itemIcons = {
  heart: HeartPulse,
  book: BookOpen,
  calendar: CalendarDays,
  research: Microscope,
};

export function BuilderBlockPreview({
  block,
  compact = false,
}: {
  block: BuilderBlock;
  compact?: boolean;
}) {
  const { t } = useLocale();
  const data = block.data;
  const eyebrow = data.eyebrow ? t(data.eyebrow) : "";
  const title = data.title ? t(data.title) : "";
  const body = data.body ? t(data.body) : "";

  if (block.type === "spacer")
    return (
      <div
        className="builder-render-spacer"
        data-height={data.height || "medium"}
        aria-hidden="true"
      />
    );

  if (block.type === "hero")
    return (
      <section
        className="builder-render builder-render-hero"
        data-tone={data.tone}
        data-align={data.align}
      >
        <span className="builder-render-orbit" aria-hidden="true">
          <HeartPulse />
          <i />
        </span>
        <div>
          {eyebrow && <small>{eyebrow}</small>}
          <h2>{title}</h2>
          <p>{body}</p>
          <div className="builder-render-actions">
            {data.primaryLabel && <span>{t(data.primaryLabel)}</span>}
            {data.secondaryLabel && <span>{t(data.secondaryLabel)}</span>}
          </div>
        </div>
      </section>
    );

  if (block.type === "announcement")
    return (
      <section
        className="builder-render builder-render-announcement"
        data-tone={data.tone}
      >
        <span className="builder-render-signal" aria-hidden="true" />
        <div>
          {eyebrow && <small>{eyebrow}</small>}
          <h3>{title}</h3>
          <p>{body}</p>
        </div>
        {data.primaryLabel && (
          <span className="builder-render-link">
            {t(data.primaryLabel)} <ArrowUpRight size={15} />
          </span>
        )}
      </section>
    );

  if (block.type === "quick-links")
    return (
      <section className="builder-render builder-render-section">
        {eyebrow && <small>{eyebrow}</small>}
        <h3>{title}</h3>
        <div className="builder-render-links" data-columns={data.columns || 3}>
          {(data.items || []).map((item) => {
            const Icon = itemIcons[item.icon || "book"];
            return (
              <div key={item.id}>
                <Icon size={18} />
                <strong>{t(item.title)}</strong>
                {item.body && <span>{t(item.body)}</span>}
              </div>
            );
          })}
        </div>
      </section>
    );

  if (block.type === "course-grid")
    return (
      <section className="builder-render builder-render-section">
        {eyebrow && <small>{eyebrow}</small>}
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="builder-render-courses">
          {[
            "Cardiovascular Physiology",
            "Human Anatomy",
            "General Pathology",
          ].map((course, index) => (
            <div key={course}>
              <span>0{index + 1}</span>
              <strong>{course}</strong>
              <i />
            </div>
          ))}
        </div>
      </section>
    );

  if (block.type === "metrics")
    return (
      <section
        className="builder-render builder-render-metrics"
        data-tone={data.tone}
      >
        <div>
          {eyebrow && <small>{eyebrow}</small>}
          <h3>{title}</h3>
        </div>
        <div className="builder-render-metric-grid">
          {(data.items || []).map((item) => (
            <div key={item.id}>
              <strong>{item.value}</strong>
              <span>{t(item.title)}</span>
            </div>
          ))}
        </div>
      </section>
    );

  if (block.type === "media")
    return (
      <section className="builder-render builder-render-media">
        <div className="builder-render-media-frame">
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt={data.imageAlt ? t(data.imageAlt) : ""}
            />
          ) : (
            <span aria-hidden="true">
              <HeartPulse />
              <i />
            </span>
          )}
        </div>
        <div>
          <h3>{title}</h3>
          <p>{body}</p>
        </div>
      </section>
    );

  if (block.type === "call-to-action")
    return (
      <section
        className="builder-render builder-render-cta"
        data-tone={data.tone}
        data-align={data.align}
      >
        {eyebrow && <small>{eyebrow}</small>}
        <h3>{title}</h3>
        <p>{body}</p>
        {data.primaryLabel && <span>{t(data.primaryLabel)}</span>}
      </section>
    );

  if (block.type === "group")
    return (
      <section className="builder-render builder-render-group">
        <h3>{title}</h3>
        <div data-columns={data.columns || 2}>
          {(data.children || []).map((child) => (
            <BuilderBlockPreview key={child.id} block={child} compact />
          ))}
        </div>
      </section>
    );

  return (
    <section
      className="builder-render builder-render-rich"
      data-compact={compact || undefined}
    >
      {eyebrow && <small>{eyebrow}</small>}
      <h3>{title}</h3>
      <p>{body}</p>
    </section>
  );
}
