import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LogOut,
  PencilLine,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useStudentProfile } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAuth } from "../../app/providers/AuthProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { AppLink } from "../../components/navigation/AppLink";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { Button } from "../../components/ui/button";
import type { AuthProfileInput } from "../../types/auth";
import { routes } from "../../constants/routes";

export default function ProfilePage() {
  const profile = useStudentProfile();
  const auth = useAuth();
  const navigate = useNavigate();
  const { label, t } = useLocale();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AuthProfileInput | null>(null);

  if (profile.isPending) return <LoadingState />;
  if (profile.isError)
    return <ErrorState retry={() => void profile.refetch()} />;
  const student = profile.data;
  const beginEditing = () => {
    setForm({
      fullName: t(student.name),
      year: student.year,
      batch: t(student.batch),
      focusMinutes: student.focusMinutes,
      bio: t(student.bio),
    });
    setEditing(true);
  };
  const update = <Key extends keyof AuthProfileInput>(
    key: Key,
    value: AuthProfileInput[Key],
  ) => setForm((current) => (current ? { ...current, [key]: value } : current));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form?.fullName.trim() || !form.batch.trim() || !form.bio.trim())
      return;
    try {
      await auth.updateProfile(form);
      setEditing(false);
      toast.success(label("profileSaved"));
    } catch {
      toast.error(label("profileSaveFailed"));
    }
  };

  return (
    <div className="container">
      <PageIntro
        title={label("myProfile")}
        description={label("profileIntro")}
        eyebrow={label("ownCorner")}
      />
      <div className="profile-grid profile-grid-v08">
        <section className="profile-identity">
          <span className="personal-avatar">{t(student.initials)}</span>
          <h2>{t(student.name)}</h2>
          <span className="profile-sample profile-verified">
            <CheckCircle2 />
            {label("verifiedAccount")}
          </span>
          <p>{t(student.bio)}</p>
          <div className="profile-primary-actions">
            <Button
              type="button"
              className="button button-primary"
              onClick={beginEditing}
            >
              <PencilLine />
              {label("editProfile")}
            </Button>
            <AppLink href="/my/learning" className="text-link">
              {label("openMyLearning")}
              <ArrowUpRight size={17} className="directional" />
            </AppLink>
          </div>
        </section>
        <section className="profile-details">
          <h2>{label("academicProfile")}</h2>
          <dl>
            <div>
              <dt>
                <GraduationCap size={20} />
                {label("program")}
              </dt>
              <dd>{t(student.program)}</dd>
            </div>
            <div>
              <dt>
                <BookOpen size={20} />
                {label("studyYear")}
              </dt>
              <dd>
                {label("year")} {student.year}
              </dd>
            </div>
            <div>
              <dt>
                <UserRound size={20} />
                {label("batch")}
              </dt>
              <dd>{t(student.batch)}</dd>
            </div>
            <div>
              <dt>
                <ShieldCheck size={20} />
                {label("accountEmail")}
              </dt>
              <dd>{auth.snapshot.user?.email}</dd>
            </div>
          </dl>
        </section>
      </div>

      {editing && form && (
        <section className="profile-editor-card">
          <div>
            <p className="eyebrow">{label("makeItYours")}</p>
            <h2>{label("editProfile")}</h2>
          </div>
          <form className="profile-edit-form" onSubmit={submit}>
            <label>
              <span>{label("fullName")}</span>
              <input
                value={form.fullName}
                onChange={(event) => update("fullName", event.target.value)}
              />
            </label>
            <label>
              <span>{label("batchName")}</span>
              <input
                value={form.batch}
                onChange={(event) => update("batch", event.target.value)}
              />
            </label>
            <label>
              <span>{label("studyYear")}</span>
              <select
                value={form.year}
                onChange={(event) => update("year", Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((year) => (
                  <option key={year} value={year}>
                    {label("year")} {year}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{label("focusLength")}</span>
              <select
                value={form.focusMinutes}
                onChange={(event) =>
                  update("focusMinutes", Number(event.target.value))
                }
              >
                {[20, 25, 30, 40, 50].map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} {label("minutesValue")}
                  </option>
                ))}
              </select>
            </label>
            <label className="profile-bio-field">
              <span>{label("bio")}</span>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(event) => update("bio", event.target.value)}
              />
            </label>
            <div className="profile-editor-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(false)}
              >
                {label("cancelEditing")}
              </Button>
              <Button
                type="submit"
                disabled={auth.isPending}
                className="button button-primary"
              >
                {label("saveProfile")}
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="profile-security-card">
        <span>
          <ShieldCheck />
        </span>
        <div>
          <h2>{label("accountSecurityTitle")}</h2>
          <p>{label("accountSecurityBody")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            await auth.signOut();
            navigate(routes.signIn, { replace: true });
          }}
        >
          <LogOut />
          {label("signOut")}
        </Button>
      </section>
    </div>
  );
}
