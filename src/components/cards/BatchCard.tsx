import gate from "../../assets/section-art/batch-gate-1280.webp";
import gateSmall from "../../assets/section-art/batch-gate-640.webp";
import { usePageArtwork } from "../data-display/HeroArtwork";
import type { CSSProperties } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { Batch } from "../../types/content";
import { batchPath } from "../../constants/routes";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "../navigation/AppLink";

export function BatchCard({ batch, index }: { batch: Batch; index: number }) {
  const { t, label } = useLocale();
  const artwork = usePageArtwork("batch-gate");
  const current = batch.terms.find((term) => term.current);
  return (
    <AppLink
      href={batchPath(batch.slug)}
      data-batch-tone={batch.accent}
      className={`batch-passport batch-gate batch-${batch.accent}`}
      style={
        {
          "--batch-index": index,
          "--batch-progress": `${batch.progress * 3.6}deg`,
        } as CSSProperties
      }
    >
      <picture className="batch-gate-image" aria-hidden="true">
        {!artwork.data && (
          <source
            srcSet={gateSmall + " 640w, " + gate + " 1280w"}
            sizes="(max-width:767px) 90vw, 30vw"
          />
        )}
        <img
          src={artwork.data?.dataUrl || gate}
          alt=""
          width={1280}
          height={853}
          loading="lazy"
          decoding="async"
        />
      </picture>
      <span className="batch-gate-architecture" aria-hidden="true">
        <i />
        <i />
        <b />
      </span>
      <span className="passport-index" aria-hidden="true">
        0{index + 1}
      </span>
      <span className="passport-stamp" aria-hidden="true">
        <span>
          {batch.progressAvailable === false ? "—" : `${batch.progress}%`}
        </span>
      </span>
      <span className="passport-copy">
        <span className="academic-kicker">{t(batch.classLabel)}</span>
        <strong>{t(batch.name)}</strong>
        <em>{t(batch.tagline)}</em>
        <span>{t(batch.description)}</span>
      </span>
      <span className="passport-term">
        <CalendarDays size={16} />
        <span>
          <small>{label("currentSemester")}</small>
          <b>{current ? t(current.label) : "—"}</b>
        </span>
      </span>
      <span className="passport-route-meta">
        <span>
          {label("year")} <b>{batch.studyYear || "—"}</b>
        </span>
        <span>
          {label("graduation")} <b>{batch.graduationYear || "—"}</b>
        </span>
      </span>
      <span className="passport-action">
        {label("exploreBatch")}
        <ArrowUpRight size={18} className="directional" />
      </span>
    </AppLink>
  );
}
