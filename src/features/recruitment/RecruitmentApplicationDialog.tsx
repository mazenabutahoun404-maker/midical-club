import { useEffect, useState } from "react";
import { Send, Save } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import type {
  RecruitmentApplication,
  RecruitmentApplicationInput,
  RecruitmentPosition,
} from "../../types/recruitment";

const blank = (positionId: string): RecruitmentApplicationInput => ({
  positionId,
  motivation: "",
  experience: "",
  availability: "",
  consentConfirmed: false,
});

export function RecruitmentApplicationDialog({
  open,
  position,
  application,
  busy,
  onClose,
  onSave,
  onSubmit,
}: {
  open: boolean;
  position: RecruitmentPosition;
  application?: RecruitmentApplication;
  busy: boolean;
  onClose: () => void;
  onSave: (
    input: RecruitmentApplicationInput,
  ) => Promise<RecruitmentApplication>;
  onSubmit: (id: string) => Promise<RecruitmentApplication>;
}) {
  const { label, t } = useLocale();
  const [form, setForm] = useState<RecruitmentApplicationInput>(
    blank(position.id),
  );
  useEffect(() => {
    setForm(
      application
        ? {
            id: application.id,
            positionId: application.positionId,
            motivation: application.motivation,
            experience: application.experience,
            availability: application.availability,
            consentConfirmed: application.consentConfirmed,
          }
        : blank(position.id),
    );
  }, [application, open, position.id]);
  const set = <K extends keyof RecruitmentApplicationInput>(
    key: K,
    value: RecruitmentApplicationInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const errorLabel = (error: unknown) =>
    error instanceof Error && error.message === "recruitment-duplicate"
      ? label("duplicateApplication")
      : label("applicationFailed");
  async function saveDraft() {
    try {
      await onSave(form);
      toast.success(label("applicationSaved"));
      onClose();
    } catch (error) {
      toast.error(errorLabel(error));
    }
  }
  async function submit() {
    if (
      form.motivation.trim().length < 40 ||
      !form.experience.trim() ||
      !form.availability.trim() ||
      !form.consentConfirmed
    ) {
      toast.error(label("applicationIncomplete"));
      return;
    }
    try {
      const saved = await onSave(form);
      await onSubmit(saved.id);
      toast.success(label("applicationSubmitted"));
      onClose();
    } catch (error) {
      toast.error(errorLabel(error));
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={label("applicationEditorTitle")}
      description={label("applicationEditorBody")}
      className="recruitment-application-modal"
    >
      <form
        className="recruitment-application-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="application-position-chip">
          <span>{label("position")}</span>
          <strong>{t(position.title)}</strong>
        </div>
        <label htmlFor="recruitment-motivation">
          <span>{label("motivation")}</span>
          <textarea
            id="recruitment-motivation"
            aria-label={label("motivation")}
            rows={5}
            value={form.motivation}
            onChange={(event) => set("motivation", event.target.value)}
            placeholder={label("motivationHint")}
            autoFocus
          />
          <small>{form.motivation.trim().length} / 40+</small>
        </label>
        <label htmlFor="recruitment-experience">
          <span>{label("relevantExperience")}</span>
          <textarea
            id="recruitment-experience"
            aria-label={label("relevantExperience")}
            rows={4}
            value={form.experience}
            onChange={(event) => set("experience", event.target.value)}
            placeholder={label("experienceHint")}
          />
        </label>
        <label htmlFor="recruitment-availability">
          <span>{label("weeklyAvailability")}</span>
          <input
            id="recruitment-availability"
            aria-label={label("weeklyAvailability")}
            value={form.availability}
            onChange={(event) => set("availability", event.target.value)}
            placeholder={label("availabilityHint")}
          />
        </label>
        <label className="recruitment-consent" htmlFor="recruitment-consent">
          <input
            id="recruitment-consent"
            aria-label={label("applicationConsent")}
            type="checkbox"
            checked={form.consentConfirmed}
            onChange={(event) => set("consentConfirmed", event.target.checked)}
          />
          <span>
            <strong>{label("applicationConsent")}</strong>
            <small>{label("applicationConsentBody")}</small>
          </span>
        </label>
        <div className="workspace-form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            {label("cancel")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void saveDraft()}
          >
            <Save size={16} /> {label("saveApplicationDraft")}
          </Button>
          <Button
            type="button"
            className="button button-primary"
            disabled={busy}
            onClick={() => void submit()}
          >
            <Send size={16} /> {label("saveAndSubmit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
