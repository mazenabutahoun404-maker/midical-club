import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import type {
  Mentor,
  MentorshipFormat,
  MentorshipRequestInput,
} from "../../types/content";

export function MentorRequestDialog({
  mentor,
  busy,
  onClose,
  onSubmit,
}: {
  mentor: Mentor | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: MentorshipRequestInput) => Promise<unknown>;
}) {
  const { t, label } = useLocale();
  const [area, setArea] = useState("");
  const [note, setNote] = useState("");
  const [format, setFormat] = useState<MentorshipFormat>("hybrid");
  useEffect(() => {
    setArea(mentor?.areas[0]?.en || "");
    setFormat(mentor?.format || "hybrid");
    setNote("");
  }, [mentor]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!mentor || !area || !note.trim()) {
      toast.error(label("requestFailed"));
      return;
    }
    try {
      await onSubmit({
        mentorId: mentor.id,
        area,
        note,
        preferredFormat: format,
      });
      toast.success(label("requestSent"));
      onClose();
    } catch {
      toast.error(label("requestFailed"));
    }
  }
  return (
    <Modal
      open={!!mentor}
      onClose={onClose}
      title={label("requestMentorship")}
      description={label("requestMentorshipBody")}
      className="mentor-request-modal"
    >
      {mentor && (
        <form className="mentor-request-form" onSubmit={submit}>
          <div className="request-mentor-identity">
            <span>{t(mentor.initials)}</span>
            <div>
              <strong>{t(mentor.name)}</strong>
              <small>{t(mentor.specialty)}</small>
            </div>
          </div>
          <label>
            <span>{label("mentorshipArea")}</span>
            <select
              value={area}
              onChange={(event) => setArea(event.target.value)}
            >
              {mentor.areas.map((item) => (
                <option value={item.en} key={item.en}>
                  {t(item)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{label("preferredFormat")}</span>
            <select
              value={format}
              onChange={(event) =>
                setFormat(event.target.value as MentorshipFormat)
              }
            >
              {(["onsite", "online", "hybrid"] as const).map((value) => (
                <option value={value} key={value}>
                  {label(value)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{label("noteForMentor")}</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              required
            />
          </label>
          <div className="workspace-form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              {label("cancel")}
            </Button>
            <Button
              className="button button-primary"
              disabled={busy || !note.trim()}
            >
              {label("sendRequest")}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
