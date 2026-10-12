import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Clock3,
  FileText,
  Trash2,
} from "lucide-react";
import { throwToTrash } from "../../components/feedback/action-flight";
import type { Course, Resource } from "../../types/content";
import { useLocale } from "../../app/providers/LocaleProvider";
import { SaveButton } from "../../components/cards/SaveButton";
import { useStudyCopy } from "./study-copy";
import { safeResourceUrl, timeLabel } from "./study-state";
import { ResourceFacts } from "./StudyResourceViewer";
import { ResourceReviewButton } from "./ResourceReviewButton";

export function NotebookResourceCard({
  resource,
  onOpen,
  seconds,
  onRemove,
}: {
  resource: Resource;
  course: Course;
  onOpen: () => void;
  seconds?: number;
  onRemove?: () => void | Promise<void>;
}) {
  const { t, label } = useLocale(),
    s = useStudyCopy(),
    detailsId = useId();
  const [details, setDetails] = useState(false),
    [removing, setRemoving] = useState(false),
    [error, setError] = useState(false);
  const row = useRef<HTMLElement>(null);
  const alive = useRef(true),
    busy = useRef(false);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  async function remove() {
    if (!onRemove || busy.current) return;
    busy.current = true;
    setError(false);
    setRemoving(true);
    const flight = throwToTrash(row.current, t(resource.title));
    try {
      if (flight.animated) await flight.finished;
      await onRemove();
    } catch {
      flight.cancel();
      if (alive.current) {
        setRemoving(false);
        setError(true);
      }
    } finally {
      busy.current = false;
    }
  }
  return (
    <article
      ref={row}
      className="notebook-material notebook-file-row"
      data-removing={removing || undefined}
    >
      <div className="notebook-file-row-main">
        <button
          type="button"
          className="notebook-file-open"
          onClick={onOpen}
          disabled={removing}
          aria-label={s("open") + ": " + t(resource.title)}
        >
          <FileText size={24} aria-hidden="true" />
          <span>
            <strong>{t(resource.title)}</strong>
            <small>
              {resource.localFile
                ? "PDF · " +
                  (resource.localFile.sizeBytes / 1024 / 1024).toFixed(1) +
                  " MB"
                : safeResourceUrl(resource.fileUrl)
                  ? resource.pages + " " + label("pages")
                  : s("previewOnly")}
              {seconds ? (
                <>
                  <Clock3 size={12} />
                  <bdi>{timeLabel(seconds)}</bdi>
                </>
              ) : null}
            </small>
          </span>
          <ArrowUpRight size={18} className="directional" aria-hidden="true" />
        </button>
        <div className="notebook-file-actions">
          <SaveButton id={resource.id} title={t(resource.title)} />
          <button
            type="button"
            className="notebook-icon-button notebook-file-disclosure"
            aria-expanded={details}
            aria-controls={detailsId}
            aria-label={
              t({
                en: "File details and review",
                ar: "تفاصيل الملف والمراجعة",
              }) +
              ": " +
              t(resource.title)
            }
            onClick={() => setDetails((value) => !value)}
            disabled={removing}
          >
            <ChevronDown size={17} aria-hidden="true" />
          </button>
          {resource.localFile && onRemove && (
            <span className="notebook-delete-slot">
              <span className="notebook-file-badge" aria-hidden="true">
                <FileText size={17} />
                <small>PDF</small>
              </span>
              <button
                type="button"
                className="notebook-icon-button notebook-remove-local"
                disabled={removing}
                title={s("removeLocal")}
                aria-label={s("removeLocal") + ": " + t(resource.title)}
                onClick={() => void remove()}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </span>
          )}
        </div>
      </div>
      {details && (
        <div
          id={detailsId}
          className="notebook-file-details"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setDetails(false);
              event.currentTarget
                .closest("article")
                ?.querySelector<HTMLButtonElement>(".notebook-file-disclosure")
                ?.focus({ preventScroll: true });
            }
          }}
        >
          <p>{t(resource.description)}</p>
          <ResourceFacts item={resource} />
          <ResourceReviewButton id={resource.id} />
        </div>
      )}
      {error && (
        <p role="alert">
          {t({
            en: "Could not remove this PDF. Try again.",
            ar: "تعذّر حذف الملف. حاول مجددًا.",
          })}
        </p>
      )}
    </article>
  );
}
