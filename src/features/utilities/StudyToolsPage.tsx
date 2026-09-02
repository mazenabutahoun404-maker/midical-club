import { LoadingState } from "../../components/feedback/LoadingState";
import { ErrorState } from "../../components/feedback/ErrorState";
import { useEffect, useState, useRef } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { toast } from "sonner";
import { useSiteContent } from "../../hooks/useContent";
import { useLocale } from "../../app/providers/LocaleProvider";
import { PageIntro } from "../../components/data-display/PageIntro";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
export default function StudyToolsPage({
  durationSeconds,
}: {
  durationSeconds?: number;
}) {
  const query = useSiteContent();
  const { data } = query;
  const { t, label } = useLocale();
  const duration = durationSeconds || data?.study.durationSeconds || 1500;
  const [seconds, setSeconds] = useState(duration);
  const [running, setRunning] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);
  const end = useRef(0);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((end.current - Date.now()) / 1000));
      setSeconds(left);
      if (left === 0) {
        setRunning(false);
        toast(label("focusComplete"), { description: label("break") });
      }
    }, 250);
    return () => clearInterval(timer);
  }, [running, label]);
  useEffect(() => {
    setRunning(false);
    setSeconds(duration);
  }, [duration]);
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  if (!data) return null;
  function toggle() {
    if (running) setRunning(false);
    else {
      end.current = Date.now() + (seconds || duration) * 1000;
      setSeconds(seconds || duration);
      setRunning(true);
    }
  }
  return (
    <div className="container">
      <PageIntro
        title={t(data.study.title)}
        description={`${t(data.study.description)} ${label("timerNote")}`}
        eyebrow={label("tools")}
      />
      <div className="utilities-grid">
        <section className="utility-card">
          <Timer size={28} />
          <h2>{label("focus")}</h2>
          <p>{label("focusBody")}</p>
          <div
            role="timer"
            aria-label={label("remaining")}
            className="timer"
            dir="ltr"
          >
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </div>
          <div className="utility-actions">
            <Button className="button button-primary" onClick={toggle}>
              {running ? <Pause size={17} /> : <Play size={17} />}{" "}
              {label(running ? "pause" : "start")}
            </Button>
            <Button
              className="button button-outline"
              variant="outline"
              onClick={() => {
                setRunning(false);
                setSeconds(duration);
              }}
            >
              <RotateCcw size={17} />
              {label("reset")}
            </Button>
          </div>
        </section>
        <section className="utility-card">
          <h2>{label("before")}</h2>
          <p>{label("checklistNote")}</p>
          <div className="study-checklist">
            {data.study.checklist.map((item, i) => (
              <label key={i}>
                <Checkbox
                  checked={checked.includes(i)}
                  onCheckedChange={(value) =>
                    setChecked((current) =>
                      value === true
                        ? [...current, i]
                        : current.filter((n) => n !== i),
                    )
                  }
                />
                <span className={checked.includes(i) ? "completed-task" : ""}>
                  {t(item)}
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
