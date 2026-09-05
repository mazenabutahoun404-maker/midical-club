import { useState } from "react";
import { createRecordId } from "../../lib/record-id";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { useCourses, useStudentProfile } from "../../hooks/useContent";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/button";
import { SelectField } from "../../components/forms/SelectField";
import { validStudyEntry } from "../../lib/workspace-state";
import type { StudyEntry } from "../../types/workspace";
export function StudyEditor({
  entry,
  day,
  close,
}: {
  entry?: StudyEntry;
  day: string;
  close: () => void;
}) {
  const { label, t } = useLocale();
  const { send } = useWorkspace();
  const courses = useCourses(),
    profile = useStudentProfile();
  const [form, setForm] = useState<StudyEntry>(
    () =>
      entry || {
        id: createRecordId(),
        title: "",
        date: day,
        time: "16:00",
        durationMinutes: 25,
        notes: "",
      },
  );
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [deleting, setDeleting] = useState(false);
  async function save() {
    if (!validStudyEntry(form)) {
      setError(label("entryInvalid"));
      return;
    }
    setBusy(true);
    const ok = await send({ type: "upsert-study", entry: form });
    setBusy(false);
    if (ok) close();
  }
  return (
    <Modal
      open
      onClose={close}
      title={label(deleting ? "deleteStudy" : entry ? "editStudy" : "addStudy")}
      description={label(deleting ? "deleteStudyBody" : "timezoneNote")}
    >
      {deleting ? (
        <div className="workspace-form-actions">
          <Button variant="outline" onClick={() => setDeleting(false)}>
            {label("cancel")}
          </Button>
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              if (await send({ type: "delete-study", id: form.id })) close();
              setBusy(false);
            }}
          >
            {label("delete")}
          </Button>
        </div>
      ) : (
        <form
          className="workspace-form"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label className="workspace-field">
            <span>{label("entryTitle")}</span>
            <input
              required
              maxLength={100}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <div className="form-pair">
            <label className="workspace-field">
              <span>{label("entryDate")}</span>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label className="workspace-field">
              <span>{label("entryTime")}</span>
              <input
                required
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </label>
          </div>
          <div className="form-pair">
            <label className="workspace-field">
              <span>{label("entryDuration")}</span>
              <input
                required
                type="number"
                min={5}
                max={480}
                step={1}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: Number(e.target.value) })
                }
              />
            </label>
            <SelectField
              label={label("courseOptional")}
              value={form.courseId || ""}
              onChange={(e) =>
                setForm({ ...form, courseId: e.target.value || undefined })
              }
            >
              <option value="">{label("noCourse")}</option>
              {courses.data
                ?.filter((c) => profile.data?.courseIds.includes(c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.title)}
                  </option>
                ))}
            </SelectField>
          </div>
          <label className="workspace-field">
            <span>{label("entryNotes")}</span>
            <textarea
              maxLength={500}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <div className="workspace-form-actions">
            {entry && (
              <button
                type="button"
                className="quiet-button danger-text"
                onClick={() => setDeleting(true)}
              >
                {label("delete")}
              </button>
            )}
            <Button variant="outline" type="button" onClick={close}>
              {label("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="button button-primary"
            >
              {label("saveChanges")}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
