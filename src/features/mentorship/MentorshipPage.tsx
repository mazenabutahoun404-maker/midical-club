import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HeartHandshake, Search, ShieldCheck, Stethoscope } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { MentorCard } from "../../components/cards/MentorCard";
import { EmptyState } from "../../components/feedback/EmptyState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { LoadingState } from "../../components/feedback/LoadingState";
import { MentorshipNavigation } from "../../components/navigation/MentorshipNavigation";
import { useMentors, useMentorshipWorkspace } from "../../hooks/useContent";
import type { Mentor } from "../../types/content";
import { MentorRequestDialog } from "./MentorRequestDialog";

export default function MentorshipPage() {
  const { t, label } = useLocale();
  const mentors = useMentors();
  const workspace = useMentorshipWorkspace();
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [format, setFormat] = useState("");
  const [available, setAvailable] = useState(false);
  const [selected, setSelected] = useState<Mentor | null>(null);
  const rows = mentors.data || [];
  useEffect(() => {
    const slug = params.get("mentor");
    const requested = rows.find((item) => item.slug === slug);
    if (requested) setSearch(t(requested.name));
  }, [params, rows, t]);
  const specialties = [
    ...new Map(
      rows.map((item) => [item.specialty.en, item.specialty]),
    ).values(),
  ];
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return rows.filter(
      (mentor) =>
        (!needle ||
          [
            t(mentor.name),
            t(mentor.specialty),
            t(mentor.bio),
            ...mentor.areas.map(t),
          ].some((value) => value.toLocaleLowerCase().includes(needle))) &&
        (!specialty || mentor.specialty.en === specialty) &&
        (!format || mentor.format === format) &&
        (!available || mentor.activeMentees < mentor.capacity),
    );
  }, [available, format, rows, search, specialty, t]);
  if (mentors.isPending || workspace.isPending) return <LoadingState />;
  if (mentors.isError || workspace.isError)
    return (
      <ErrorState
        retry={() => {
          void mentors.refetch();
          workspace.retry();
        }}
      />
    );
  return (
    <div className="mentorship-v6 mentorship-page container">
      <MentorshipNavigation />
      <header className="mentorship-hero">
        <div>
          <span className="eyebrow">{label("mentorshipEyebrow")}</span>
          <h1 tabIndex={-1} data-page-heading>
            {label("mentorshipTitle")}
          </h1>
          <p>{label("mentorshipBody")}</p>
        </div>
        <div className="conversation-signal" aria-hidden="true">
          <span>
            <Stethoscope size={26} />
          </span>
          <i />
          <b />
          <small>
            <ShieldCheck size={16} /> VERIFIED PATH
          </small>
        </div>
      </header>
      <section className="mentor-controls" aria-label={label("mentorFilters")}>
        <label className="mentor-search">
          <Search size={18} />
          <span className="sr-only">{label("mentorSearch")}</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={label("mentorSearch")}
          />
        </label>
        <label>
          <span>{label("allSpecialties")}</span>
          <select
            value={specialty}
            onChange={(event) => setSpecialty(event.target.value)}
          >
            <option value="">{label("allSpecialties")}</option>
            {specialties.map((item) => (
              <option key={item.en} value={item.en}>
                {t(item)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{label("preferredFormat")}</span>
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value)}
          >
            <option value="">{label("allFormats")}</option>
            {(["onsite", "online", "hybrid"] as const).map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="available-toggle">
          <input
            type="checkbox"
            checked={available}
            onChange={(event) => setAvailable(event.target.checked)}
          />
          <span>
            <HeartHandshake size={17} />
            {label("availableOnly")}
          </span>
        </label>
      </section>
      <p className="community-results" role="status">
        <strong>{filtered.length}</strong> {label("results")}
      </p>
      {filtered.length ? (
        <div className="mentor-grid">
          {filtered.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              request={workspace.requests.find(
                (item) => item.mentorId === mentor.id,
              )}
              onRequest={setSelected}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      <p className="v6-boundary-note">
        <ShieldCheck size={17} /> {label("mentorPreviewNotice")}
      </p>
      <MentorRequestDialog
        mentor={selected}
        busy={workspace.isMutating}
        onClose={() => setSelected(null)}
        onSubmit={workspace.request}
      />
    </div>
  );
}
