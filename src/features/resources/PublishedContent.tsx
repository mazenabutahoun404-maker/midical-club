import { ReadFeedback } from "../../components/feedback/ReadFeedback";
import { ContentPlaceholder } from "../../components/feedback/ContentPlaceholder";
import { useState, createElement, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "../../app/providers/AuthProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ApiActionError } from "../../components/feedback/ApiActionError";
import { LoadingState } from "../../components/feedback/LoadingState";
import { Button } from "../../components/ui/button";
import { AppLink } from "../../components/navigation/AppLink";
import { record, array, string } from "../../services/api/mapping";
import {
  contentValue,
  configValue,
  contentLink,
  trustedEmbed,
  publishedSections,
  nestedBlocks,
  snapshotBlocks,
  richTextValue,
} from "./content-model";
import "../../styles/content-experience.css";
function Inline({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
        .map((s, i) =>
          s.startsWith("**") && s.endsWith("**") ? (
            <strong key={i}>{s.slice(2, -2)}</strong>
          ) : s.startsWith("*") && s.endsWith("*") ? (
            <em key={i}>{s.slice(1, -1)}</em>
          ) : s.startsWith("`") && s.endsWith("`") ? (
            <code key={i}>{s.slice(1, -1)}</code>
          ) : (
            s
          ),
        )}
    </>
  );
}
export function RichText({ text }: { text: string }) {
  return (
    <div className="content-prose">
      {text.split(/\n\s*\n/).map((p, i) => {
        const lines = p.split("\n");
        return lines.every((l) => /^\s*[-*] /.test(l)) ? (
          <ul key={i}>
            {lines.map((l, j) => (
              <li key={j}>
                <Inline text={l.replace(/^\s*[-*] /, "")} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} style={{ whiteSpace: "pre-wrap" }}>
            <Inline text={p} />
          </p>
        );
      })}
    </div>
  );
}
export function RichDocument({
  value,
  depth = 0,
}: {
  value: unknown;
  depth?: number;
}) {
  const { locale } = useLocale();
  if (depth > 12) return null;
  if (typeof value === "string") return <RichText text={value} />;
  if (Array.isArray(value))
    return (
      <>
        {value.map((v, i) => (
          <RichDocument key={i} value={v} depth={depth + 1} />
        ))}
      </>
    );
  const v = record(value);
  if (v[locale] !== undefined || v.en !== undefined || v.ar !== undefined)
    return <RichDocument value={v[locale] ?? v.en ?? v.ar} depth={depth + 1} />;
  if (typeof v.text === "string") {
    let child: ReactNode = <Inline text={v.text} />;
    const marks = array(v.marks).map((m) =>
      typeof m === "string" ? m : string(record(m).type),
    );
    if (v.bold || marks.includes("bold")) child = <strong>{child}</strong>;
    if (v.italic || marks.includes("italic")) child = <em>{child}</em>;
    if (v.underline || marks.includes("underline")) child = <u>{child}</u>;
    if (v.code || marks.includes("code")) child = <code>{child}</code>;
    return <>{child}</>;
  }
  const children = (
    <RichDocument value={v.children ?? v.content} depth={depth + 1} />
  );
  switch (v.type) {
    case "paragraph":
      return <p>{children}</p>;
    case "heading":
      return <h3>{children}</h3>;
    case "bulletList":
    case "unordered-list":
    case "bulleted-list":
      return <ul>{children}</ul>;
    case "orderedList":
    case "numbered-list":
      return <ol>{children}</ol>;
    case "listItem":
    case "list-item":
      return <li>{children}</li>;
    case "link": {
      const href = contentLink(v.url ?? v.href);
      return href ? (
        <a
          href={href}
          target={href.startsWith("/") ? undefined : "_blank"}
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ) : (
        children
      );
    }
    case "break":
      return <br />;
    default:
      return children;
  }
}
export function ContentAsset({
  assetId,
  label,
  kind = "file",
}: {
  assetId: string;
  label: string;
  kind?: "file" | "image" | "video";
}) {
  const services = useServices(),
    { snapshot } = useAuth(),
    { t } = useLocale(),
    [opened, setOpened] = useState(kind !== "file");
  const q = useQuery({
    queryKey: [
      "content-asset",
      snapshot.user?.id,
      services.api?.session.get()?.sessionId,
      assetId,
    ],
    queryFn: () => services.assets!.preview(assetId),
    enabled: opened && !!assetId && !!services.assets,
    retry: false,
    staleTime: 0,
  });
  const url = contentLink(q.data?.url);
  return (
    <div className="content-asset">
      {kind === "file" && (
        <Button
          variant="outline"
          onClick={() => {
            setOpened(true);
            if (opened) void q.refetch();
          }}
        >
          {label || t({ en: "Open file", ar: "فتح الملف" })}
        </Button>
      )}
      {q.isFetching && (
        <p role="status">
          {t({ en: "Loading media…", ar: "جارٍ تحميل الوسائط…" })}
        </p>
      )}
      {url &&
        (kind === "image" ? (
          <img src={url} alt={label} loading="lazy" />
        ) : kind === "video" ? (
          <video controls preload="metadata" src={url} aria-label={label} />
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {t({ en: "Open authorized file", ar: "فتح الملف المصرّح به" })}
          </a>
        ))}
      {q.error && <ReadFeedback query={q} />}
    </div>
  );
}
export function SafeEmbed({ url, title }: { url: string; title: string }) {
  const { t } = useLocale(),
    [open, setOpen] = useState(false),
    src = trustedEmbed(url),
    link = contentLink(url);
  return (
    <div className="content-embed">
      {src && !open && (
        <Button variant="outline" onClick={() => setOpen(true)}>
          {t({ en: "Load interactive media", ar: "تحميل الوسائط التفاعلية" })}
        </Button>
      )}
      {src && open && (
        <iframe
          src={src}
          title={title || t({ en: "Interactive media", ar: "وسائط تفاعلية" })}
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
        />
      )}
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer">
          {t({ en: "Open original", ar: "فتح المصدر الأصلي" })}
        </a>
      )}
      {!src && (
        <p>
          {t({
            en: "This provider is available as a link.",
            ar: "هذا المصدر متاح كرابط.",
          })}
        </p>
      )}
    </div>
  );
}
export function ContentBlocks({
  blocks,
  depth = 0,
  trail = [],
}: {
  blocks: unknown;
  depth?: number;
  trail?: string[];
}) {
  const { locale, t } = useLocale();
  if (depth > 8)
    return (
      <p>
        {t({
          en: "Nested content is too deep to display.",
          ar: "تجاوز المحتوى المتداخل الحد المسموح للعرض.",
        })}
      </p>
    );
  return (
    <>
      {array(blocks)
        .map(record)
        .map((block, i) => {
          const c = record(block.configuration),
            id = string(block.id) || String(i),
            type = string(block.blockType),
            text = contentValue(
              configValue(c, "Text", "Content", "Title", "Label"),
              locale,
            ),
            url = contentLink(
              configValue(c, "Url", "Href", "ExternalUrl", "SourceUrl"),
            ),
            asset = string(configValue(c, "AssetId")),
            key = id + ":" + i;
          let child;
          if (type === "Text")
            child = (
              <div className="content-prose">
                <RichDocument value={configValue(c, "Content", "Text")} />
              </div>
            );
          else if (type === "Heading")
            child = createElement(
              "h" +
                Math.max(
                  2,
                  Math.min(6, Math.round(Number(configValue(c, "Level")) || 3)),
                ),
              null,
              text,
            );
          else if (type === "Divider") child = <hr />;
          else if (type === "Spacer")
            child = (
              <div
                aria-hidden="true"
                style={{
                  height: `${Math.max(0, Math.min(240, configValue(c, "Height", "heightPx") == null ? 16 : Number(configValue(c, "Height", "heightPx")) || 0))}px`,
                }}
              />
            );
          else if (type === "Group")
            child = (
              <div className="content-group">
                <ContentBlocks
                  blocks={nestedBlocks(c)}
                  depth={depth + 1}
                  trail={trail}
                />
              </div>
            );
          else if (type === "ReusableReference") {
            const ref =
                string(configValue(c, "ReusableBlockId", "ReferenceId")) || id,
              resolved = snapshotBlocks(c);
            child = trail.includes(ref) ? (
              <p>
                {t({
                  en: "Circular reusable content cannot be displayed.",
                  ar: "تعذّر عرض مرجع محتوى دائري.",
                })}
              </p>
            ) : resolved.length ? (
              <ContentBlocks
                blocks={resolved}
                depth={depth + 1}
                trail={[...trail, ref]}
              />
            ) : (
              <p role="status">
                {t({
                  en: "This reusable content has no resolved published snapshot yet.",
                  ar: "لا توجد نسخة منشورة مكتملة لهذا المحتوى القابل لإعادة الاستخدام.",
                })}
              </p>
            );
          } else if (asset && ["Image", "File", "Video"].includes(type))
            child = (
              <ContentAsset
                assetId={asset}
                label={
                  contentValue(
                    configValue(
                      c,
                      "Alt",
                      "AltText",
                      "Caption",
                      "Label",
                      "Text",
                    ),
                    locale,
                  ) || text
                }
                kind={
                  type === "Image"
                    ? "image"
                    : type === "Video"
                      ? "video"
                      : "file"
                }
              />
            );
          else if (type === "Image" && url)
            child = (
              <figure>
                <img
                  src={url}
                  alt={contentValue(configValue(c, "Alt"), locale)}
                  loading="lazy"
                />
                {text && <figcaption>{text}</figcaption>}
              </figure>
            );
          else if (type === "TrustedEmbed" && url)
            child = <SafeEmbed url={url} title={text} />;
          else if (type === "Video" && url)
            child = trustedEmbed(url) ? (
              <SafeEmbed url={url} title={text} />
            ) : (
              <video controls preload="metadata" src={url} aria-label={text} />
            );
          else if (["Button", "ExternalLink", "File"].includes(type) && url)
            child = url.startsWith("/") ? (
              <AppLink
                className={
                  type === "Button" ? "button button-primary" : "text-link"
                }
                href={url}
              >
                {text || t({ en: "Open", ar: "فتح" })}
              </AppLink>
            ) : (
              <a
                className={
                  type === "Button" ? "button button-primary" : "text-link"
                }
                href={url}
                target={
                  configValue(c, "OpenInNewTab") === false
                    ? undefined
                    : "_blank"
                }
                rel="noopener noreferrer"
              >
                {text || t({ en: "Open", ar: "فتح" })}
              </a>
            );
          else child = <RichText text={text} />;
          return (
            <div
              className={`content-block content-block-${type.toLowerCase()}`}
              key={key}
            >
              {child}
            </div>
          );
        })}
    </>
  );
}
export function PublishedContent({
  content,
  hideHeading = false,
}: {
  content: unknown;
  hideHeading?: boolean;
}) {
  const { locale, t } = useLocale(),
    doc = record(content);
  if (doc.visible !== true)
    return (
      <ContentPlaceholder
        icon="file"
        title={t({
          en: "This page is not available yet",
          ar: "هذه الصفحة غير متاحة بعد",
        })}
        description={t({
          en: "There is no published content available to display on this page right now.",
          ar: "لا يوجد محتوى منشور متاح للعرض في هذه الصفحة حالياً.",
        })}
      />
    );
  return (
    <article className="published-content">
      {!hideHeading && (
        <>
          <h1 data-page-heading tabIndex={-1}>
            {contentValue(doc.title, locale)}
          </h1>
          <RichText text={contentValue(doc.description, locale)} />
        </>
      )}
      {!publishedSections(doc).length && <ContentPlaceholder icon="file" />}
      {publishedSections(doc).length > 1 && (
        <nav
          className="student-connected-actions"
          aria-label={t({ en: "Content sections", ar: "أقسام المحتوى" })}
        >
          {publishedSections(doc)
            .filter((s) => string(s.id))
            .map((s) => (
              <a
                className="text-link"
                key={string(s.id)}
                href={"#content-" + s.id}
              >
                {contentValue(s.title, locale) ||
                  t({ en: "Section", ar: "قسم" })}
              </a>
            ))}
        </nav>
      )}
      {publishedSections(doc).map((s, i) => (
        <section
          className="content-published-section"
          key={string(s.id) || i}
          id={string(s.id) ? `content-${s.id}` : undefined}
        >
          <h2>{contentValue(s.title, locale)}</h2>
          {Array.isArray(s.blocks) && s.blocks.length ? (
            <ContentBlocks blocks={s.blocks} />
          ) : (
            <ContentPlaceholder compact icon="books" />
          )}
        </section>
      ))}
    </article>
  );
}
export default function PublishedPage() {
  const { slug } = useParams(),
    services = useServices(),
    { snapshot } = useAuth(),
    { locale } = useLocale();
  const q = useQuery({
    queryKey: [
      "public-page",
      snapshot.user?.id,
      services.api?.session.get()?.sessionId,
      slug,
      locale,
    ],
    queryFn: () =>
      services.contentApi!.get_api_v1_content_pages_by_slug({
        path: { slug: slug! },
        query: { locale },
      }),
    enabled: !!slug && !!services.contentApi,
    retry: false,
  });
  return (
    <div className="container section">
      {q.error && <ReadFeedback query={q} />}
      {q.isPending ? (
        <LoadingState />
      ) : (
        q.data && <PublishedContent content={q.data.content} />
      )}
    </div>
  );
}
