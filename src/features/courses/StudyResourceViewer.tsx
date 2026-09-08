import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  FileText,
  X,
} from "lucide-react";
import type { Resource } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { SaveButton } from "../../components/cards/SaveButton";
import { formatDate } from "../../lib/dates";
import { useStudyCopy } from "./study-copy";
import { safeResourceUrl, timeLabel, type StudyPosition } from "./study-state";

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

export function ResourceProvenance({ item }: { item: Resource }) {
  const { t, label, locale } = useLocale();
  const s = useStudyCopy();
  return (
    <details className="study-provenance">
      <summary>{s("provenance")}</summary>
      <dl>
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
    </details>
  );
}

export function StudyResourceViewer({
  item,
  position,
  onPosition,
  onClose,
  companion = false,
}: {
  item: Resource;
  position?: StudyPosition;
  onPosition: (position: Partial<StudyPosition>) => void;
  onClose?: () => void;
  companion?: boolean;
}) {
  const { t, label } = useLocale();
  const s = useStudyCopy();
  const { state, send, isPending } = useWorkspace();
  const pane = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLMediaElement | null>(null);
  const pageInput = useId();
  const titleId = useId();
  const initial = useRef(position);
  const save = useRef(onPosition);
  save.current = onPosition;
  const [page, setPage] = useState(position?.page || 1);
  const [error, setError] = useState(false);
  const url = safeResourceUrl(item.fileUrl);
  const type = resourceMediaType(item);
  const maxPage = Math.max(1, item.pages);
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
      aria-labelledby={titleId}
    >
      <header className="study-reader-heading">
        <div>
          <span>{label(item.kind)}</span>
          <h3 id={titleId}>{t(item.title)}</h3>
        </div>
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
              <>
                <label className="study-page-control" htmlFor={pageInput}>
                  <span>{s("page")}</span>
                  <input
                    id={pageInput}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={maxPage}
                    value={page}
                    onChange={(event) => {
                      const value = Math.min(
                        maxPage,
                        Math.max(
                          1,
                          Math.floor(Number(event.target.value) || 1),
                        ),
                      );
                      setPage(value);
                      onPosition({ page: value });
                    }}
                  />
                  <span>/ {maxPage}</span>
                </label>
                <p className="study-reader-hint">{s("pageHelp")}</p>
                <object
                  className="study-pdf"
                  data={`${url.split("#")[0]}#page=${page}`}
                  type="application/pdf"
                  aria-label={t(item.title)}
                >
                  <p>{s("unpreviewable")}</p>
                </object>
              </>
            )}
            {type === "external" && (
              <p className="study-file-notice">
                <FileText size={20} />
                {s("unpreviewable")}
              </p>
            )}
            <a
              className="study-source-link"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s("openFile")}
              <ArrowUpRight size={16} className="directional" />
            </a>
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
        <div className="study-resource-text">
          <h4>{s(item.preview?.excerpt ? "excerpt" : "description")}</h4>
          <p>{t(item.preview?.excerpt || item.description)}</p>
        </div>
        <ResourceProvenance item={item} />
      </div>
      <footer className="study-reader-actions">
        <SaveButton id={item.id} title={t(item.title)} />
        <button
          type="button"
          className="notebook-button notebook-button-quiet"
          disabled={isPending}
          aria-pressed={state.reviewedResourceIds.includes(item.id)}
          onClick={() => void send({ type: "toggle-reviewed", id: item.id })}
        >
          <CheckCircle2 size={17} />
          {label(
            state.reviewedResourceIds.includes(item.id)
              ? "unmarkReviewed"
              : "markReviewed",
          )}
        </button>
      </footer>
    </section>
  );
}
