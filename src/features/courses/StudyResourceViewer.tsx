import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowUpRight, BookOpen, FileText, X } from "lucide-react";
import type { Resource } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { ResourceReviewButton } from "./ResourceReviewButton";
import { SaveButton } from "../../components/cards/SaveButton";
import { formatDate } from "../../lib/dates";
import { useStudyCopy } from "./study-copy";
import { safeResourceUrl, timeLabel, type StudyPosition } from "./study-state";
import { PdfBook } from "./PdfBook";
import { useStudyChrome } from "../../app/providers/StudyChromeProvider";
import { useStudyTools } from "./StudyTools";
import type { TurnDirection } from "./page-turn";

export function resourceMediaType(item: Resource) {
  if (item.mediaType) return item.mediaType;
  const url = safeResourceUrl(item.fileUrl);
  const path = url ? new URL(url).pathname.toLowerCase() : "";
  if (/\.(mp4|webm|ogg)$/.test(path)) return "video";
  if (/\.(mp3|m4a|wav|oga)$/.test(path)) return "audio";
  if (/\.pdf$/.test(path)) return "pdf";
  if (/\.(png|jpe?g|webp|avif)$/.test(path)) return "image";
  return "external";
}

export function ResourceFacts({ item }: { item: Resource }) {
  const { t, label, locale } = useLocale(),
    s = useStudyCopy();
  return (
    <div className="resource-facts">
      <dl>
        <div>
          <dt>{label("materials")}</dt>
          <dd>
            {label(item.kind)} ·{" "}
            {item.localFile
              ? `${(item.localFile.sizeBytes / 1024 / 1024).toFixed(1)} MB`
              : `${item.pages} ${label("pages")}`}
          </dd>
        </div>
        <div>
          <dt>{label("batch")}</dt>
          <dd>
            {label(
              item.audience === "shared" ? "sharedResource" : "batchResource",
            )}
          </dd>
        </div>
        <div>
          <dt>{label("contributor")}</dt>
          <dd>{t(item.contributor)}</dd>
        </div>
        <div>
          <dt>{s("reviewer")}</dt>
          <dd>{item.reviewer ? t(item.reviewer) : s("noReviewer")}</dd>
        </div>
        <div>
          <dt>{s("updated")}</dt>
          <dd>{formatDate(item.updatedAt, locale)}</dd>
        </div>
      </dl>
      <strong>{s("references")}</strong>
      {item.references?.length ? (
        <ul>
          {item.references.map((reference, index) => {
            const url = safeResourceUrl(reference.url);
            return (
              <li key={index}>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {t(reference.title)}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                ) : (
                  t(reference.title)
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>{s("noReferences")}</p>
      )}
    </div>
  );
}
export function ResourceProvenance({ item }: { item: Resource }) {
  const s = useStudyCopy();
  return (
    <details className="study-provenance">
      <summary>{s("provenance")}</summary>
      <ResourceFacts item={item} />
    </details>
  );
}

export function StudyResourceViewer({
  item,
  position,
  onPosition,
  onClose,
  companion = false,
  onBoundary,
  canBoundary,
  boundaryPreview,
}: {
  item: Resource;
  position?: StudyPosition;
  onPosition: (position: Partial<StudyPosition>) => void;
  onClose?: () => void;
  companion?: boolean;
  onBoundary?: (direction: TurnDirection) => void;
  canBoundary?: (direction: TurnDirection) => boolean;
  boundaryPreview?: (direction: TurnDirection) => ReactNode;
}) {
  const { t } = useLocale();
  const s = useStudyCopy();
  const tools = useStudyTools();
  const { focus } = useStudyChrome();
  const pane = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLMediaElement | null>(null);
  const titleId = useId();
  const initial = useRef(position);
  const save = useRef(onPosition);
  save.current = onPosition;
  const [page, setPage] = useState(position?.page || 1);
  const [error, setError] = useState(false);
  const url = safeResourceUrl(item.fileUrl);
  const type = resourceMediaType(item);
  const thumbnail = safeResourceUrl(item.preview?.thumbnailUrl);
  useLayoutEffect(() => {
    if (pane.current) pane.current.scrollTop = initial.current?.scroll || 0;
  }, []);
  useEffect(
    () => () => {
      const player = media.current;
      if (player && Number.isFinite(player.currentTime))
        save.current({ seconds: player.currentTime });
    },
    [],
  );
  useEffect(
    () => () => {
      if (!companion) tools?.setReader(null);
    },
    [item.id, companion, tools?.setReader],
  );
  function rememberMedia() {
    const player = media.current;
    if (player && Number.isFinite(player.currentTime))
      onPosition({ seconds: player.currentTime });
  }
  function restoreMedia() {
    const player = media.current;
    const seconds = initial.current?.seconds || 0;
    if (!player || !seconds) return;
    player.currentTime = Number.isFinite(player.duration)
      ? Math.min(seconds, Math.max(0, player.duration - 0.1))
      : seconds;
  }
  function seek(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0 || !media.current || error)
      return;
    media.current.currentTime = Number.isFinite(media.current.duration)
      ? Math.min(seconds, media.current.duration)
      : seconds;
    rememberMedia();
  }
  const mediaEvents = {
    onLoadedMetadata: restoreMedia,
    onTimeUpdate: rememberMedia,
    onPause: rememberMedia,
    onSeeked: rememberMedia,
    onError: () => setError(true),
  };
  return (
    <section
      className={`study-reader ${companion ? "study-reader-companion" : ""}`}
      data-media={type}
      aria-labelledby={titleId}
    >
      {focus && (
        <h3 id={titleId} className="sr-only">
          {t(item.title)}
        </h3>
      )}
      {!focus && (
        <header className="study-reader-heading">
          <div>
            <h3 id={titleId}>{t(item.title)}</h3>
          </div>
          {url && (
            <a
              className="notebook-icon-button study-original-file"
              href={type === "pdf" ? url.split("#")[0] + "#page=" + page : url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s("openFile")}
              title={s("openFile")}
            >
              <ArrowUpRight size={18} />
            </a>
          )}
          {onClose && (
            <button
              type="button"
              className="notebook-icon-button"
              onClick={onClose}
              aria-label={s("close")}
            >
              <X size={18} />
            </button>
          )}
        </header>
      )}
      <div
        ref={pane}
        className="study-reader-scroll"
        tabIndex={0}
        aria-label={`${s("reading")}: ${t(item.title)}`}
        onScroll={(event) =>
          onPosition({ scroll: event.currentTarget.scrollTop })
        }
      >
        {url && !error ? (
          <>
            {type === "video" && (
              <video
                ref={(node) => {
                  media.current = node;
                }}
                controls
                preload="metadata"
                playsInline
                poster={thumbnail}
                aria-label={t(item.title)}
                {...mediaEvents}
              >
                <source src={url} />
              </video>
            )}
            {type === "audio" && (
              <audio
                ref={(node) => {
                  media.current = node;
                }}
                controls
                preload="metadata"
                aria-label={t(item.title)}
                {...mediaEvents}
              >
                <source src={url} />
              </audio>
            )}
            {type === "image" && (
              <img
                className="study-document-image"
                src={url}
                alt={t(item.title)}
                onError={() => setError(true)}
              />
            )}
            {type === "pdf" && (
              <PdfBook
                item={item}
                url={url}
                initialPage={page}
                initialScroll={initial.current?.scroll || 0}
                onScroll={(scroll) => onPosition({ scroll })}
                companion={companion}
                onPage={(value) => {
                  setPage(value);
                  onPosition({ page: value });
                }}
                onBoundary={onBoundary}
                canBoundary={canBoundary}
                boundaryPreview={boundaryPreview}
              />
            )}
            {type === "external" && (
              <p className="study-file-notice">
                <FileText size={20} />
                {s("unpreviewable")}
              </p>
            )}
          </>
        ) : (
          <div className="study-file-notice">
            <BookOpen size={26} aria-hidden="true" />
            <p>{error ? s("fileError") : s("unavailable")}</p>
            {error && url && (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {s("openFile")}
              </a>
            )}
          </div>
        )}
        {position &&
          position.seconds > 0 &&
          (type === "video" || type === "audio") && (
            <p className="study-resume-time">
              {s("resumeAt")} <bdi>{timeLabel(position.seconds)}</bdi>
            </p>
          )}
        {!!item.preview?.chapters?.length && (
          <ol className="study-chapters">
            {item.preview.chapters
              .filter(
                (chapter) =>
                  Number.isFinite(chapter.seconds) && chapter.seconds >= 0,
              )
              .map((chapter, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => seek(chapter.seconds)}
                    disabled={
                      !url || error || !["video", "audio"].includes(type)
                    }
                  >
                    <bdi>{timeLabel(chapter.seconds)}</bdi>
                    {t(chapter.title)}
                  </button>
                </li>
              ))}
          </ol>
        )}
      </div>
      {!focus && type !== "pdf" && (
        <footer className="study-reader-actions">
          <details className="study-reader-details">
            <summary>{s("details")}</summary>
            <div className="study-resource-text">
              <h4>{s(item.preview?.excerpt ? "excerpt" : "description")}</h4>
              <p>{t(item.preview?.excerpt || item.description)}</p>
            </div>
            <ResourceProvenance item={item} />
          </details>
          <SaveButton id={item.id} title={t(item.title)} />
          <ResourceReviewButton id={item.id} />
        </footer>
      )}
    </section>
  );
}
