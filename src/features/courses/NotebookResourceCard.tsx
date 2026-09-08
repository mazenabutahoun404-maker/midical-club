import { BookOpen, Clock3, FileText } from "lucide-react";
import type { Course, Resource } from "../../types/content";
import { ResourceCard } from "../../components/cards/ResourceCard";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useStudyCopy } from "./study-copy";
import { ResourceProvenance } from "./StudyResourceViewer";
import { safeResourceUrl, timeLabel } from "./study-state";

export function NotebookResourceCard({
  resource,
  course,
  onOpen,
  seconds,
}: {
  resource: Resource;
  course: Course;
  onOpen: () => void;
  seconds?: number;
}) {
  const { t } = useLocale();
  const s = useStudyCopy();
  const thumbnail = safeResourceUrl(resource.preview?.thumbnailUrl);
  return (
    <div className="notebook-material">
      {thumbnail && (
        <img
          src={thumbnail}
          alt={t(resource.title)}
          className="study-resource-thumbnail"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      )}
      <ResourceCard resource={resource} course={course} />
      <div className="notebook-material-preview">
        <span className="study-availability">
          <FileText size={14} />
          {s(safeResourceUrl(resource.fileUrl) ? "fileReady" : "previewOnly")}
        </span>
        <p>{t(resource.preview?.excerpt || resource.description)}</p>
        {!!resource.preview?.chapters?.length && (
          <ul>
            {resource.preview.chapters.slice(0, 3).map((chapter, index) => (
              <li key={index}>{t(chapter.title)}</li>
            ))}
          </ul>
        )}
        <ResourceProvenance item={resource} />
        <button
          type="button"
          className="notebook-button notebook-button-primary"
          onClick={onOpen}
        >
          <BookOpen size={17} />
          {s("open")}
          {seconds ? (
            <span>
              <Clock3 size={13} />
              <bdi>{timeLabel(seconds)}</bdi>
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
