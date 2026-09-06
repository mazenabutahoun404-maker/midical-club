import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { useCourses } from "../../hooks/useContent";
import type {
  ContributionInput,
  StudentContribution,
} from "../../types/content";

const empty: ContributionInput = {
  kind: "resource",
  title: "",
  topic: "",
  summary: "",
  courseId: undefined,
  sourceUrl: "",
  assetName: "",
  rightsConfirmed: false,
  references: [""],
};
export function ContributionEditor({
  open,
  contribution,
  busy,
  onClose,
  onSave,
}: {
  open: boolean;
  contribution: StudentContribution | null;
  busy: boolean;
  onClose: () => void;
  onSave: (input: ContributionInput) => Promise<unknown>;
}) {
  const { t, label } = useLocale();
  const courses = useCourses();
  const [form, setForm] = useState<ContributionInput>(empty);
  const [references, setReferences] = useState("");
  useEffect(() => {
    const value = contribution
      ? {
          id: contribution.id,
          kind: contribution.kind,
          title: contribution.title,
          topic: contribution.topic,
          summary: contribution.summary,
          courseId: contribution.courseId,
          sourceUrl: contribution.sourceUrl,
          assetName: contribution.assetName,
          rightsConfirmed: contribution.rightsConfirmed,
          references: contribution.references,
        }
      : empty;
    setForm(value);
    setReferences(value.references.join("\n"));
  }, [contribution, open]);
  const set = <K extends keyof ContributionInput>(
    key: K,
    value: ContributionInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  async function save(event: React.FormEvent) {
    event.preventDefault();
    const input = {
      ...form,
      references: references
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    if (
      !input.title.trim() ||
      !input.topic.trim() ||
      !input.summary.trim() ||
      !input.references.length ||
      !input.rightsConfirmed
    ) {
      toast.error(label("contributionIncomplete"));
      return;
    }
    try {
      await onSave(input);
      toast.success(label("draftSaved"));
      onClose();
    } catch {
      toast.error(label("contributionFailed"));
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={label(contribution ? "editContribution" : "newContribution")}
      description={label("contributionPreviewNotice")}
      className="contribution-editor-modal"
    >
      <form className="contribution-editor" onSubmit={save}>
        <div className="editor-two-column">
          <label>
            <span>{label("contributionKind")}</span>
            <select
              value={form.kind}
              onChange={(event) =>
                set("kind", event.target.value as ContributionInput["kind"])
              }
            >
              <option value="resource">{label("resourceContribution")}</option>
              <option value="article">{label("articleContribution")}</option>
            </select>
          </label>
          <label>
            <span>{label("relatedCourse")}</span>
            <select
              value={form.courseId || ""}
              onChange={(event) =>
                set("courseId", event.target.value || undefined)
              }
            >
              <option value="">{label("noCourse")}</option>
              {courses.data?.map((course) => (
                <option value={course.id} key={course.id}>
                  {t(course.title)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          <span>{label("contributionTitle")}</span>
          <input
            value={form.title}
            onChange={(event) => set("title", event.target.value)}
            required
          />
        </label>
        <label>
          <span>{label("contributionTopic")}</span>
          <input
            value={form.topic}
            onChange={(event) => set("topic", event.target.value)}
            required
          />
        </label>
        <label>
          <span>{label("contributionSummary")}</span>
          <textarea
            value={form.summary}
            onChange={(event) => set("summary", event.target.value)}
            rows={4}
            required
          />
        </label>
        <div className="editor-two-column">
          <label>
            <span>{label("sourceUrl")}</span>
            <input
              type="url"
              value={form.sourceUrl}
              onChange={(event) => set("sourceUrl", event.target.value)}
            />
          </label>
          <label>
            <span>{label("assetName")}</span>
            <input
              value={form.assetName}
              onChange={(event) => set("assetName", event.target.value)}
            />
          </label>
        </div>
        <label>
          <span>{label("references")}</span>
          <textarea
            value={references}
            onChange={(event) => setReferences(event.target.value)}
            rows={3}
            placeholder={label("referencePlaceholder")}
            required
          />
        </label>
        <label className="rights-confirmation">
          <input
            type="checkbox"
            checked={form.rightsConfirmed}
            onChange={(event) => set("rightsConfirmed", event.target.checked)}
          />
          <span>
            <strong>{label("rightsConfirmed")}</strong>
            <small>{label("rightsBody")}</small>
          </span>
        </label>
        <div className="workspace-form-actions">
          <Button type="button" variant="outline" onClick={onClose}>
            {label("cancel")}
          </Button>
          <Button className="button button-primary" disabled={busy}>
            {label("saveDraft")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
