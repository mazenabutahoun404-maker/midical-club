import {
  BadgeCheck,
  ClipboardPenLine,
  ContactRound,
  MessagesSquare,
  ScanSearch,
  UserRoundCheck,
} from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { applicationStage } from "../../lib/recruitment";
import type { RecruitmentApplicationStatus } from "../../types/recruitment";

const stages = [
  { key: "applyStage", icon: ClipboardPenLine },
  { key: "screeningStage", icon: ScanSearch },
  { key: "interviewStage", icon: MessagesSquare },
  { key: "decisionStage", icon: BadgeCheck },
  { key: "onboardingStage", icon: UserRoundCheck },
  { key: "memberStage", icon: ContactRound },
] as const;

export function RecruitmentPipeline({
  status,
  compact = false,
}: {
  status?: RecruitmentApplicationStatus;
  compact?: boolean;
}) {
  const { label } = useLocale();
  const active = status ? applicationStage(status) : -1;
  const stopped = status === "rejected" || status === "withdrawn";
  return (
    <ol
      className={`recruitment-pipeline ${compact ? "recruitment-pipeline-compact" : ""}`}
      aria-label={label("recruitmentPathTitle")}
      data-stopped={stopped || undefined}
    >
      {stages.map(({ key, icon: Icon }, index) => (
        <li
          key={key}
          data-state={
            active < 0
              ? "future"
              : index < active
                ? "complete"
                : index === active
                  ? "active"
                  : "future"
          }
        >
          <span aria-hidden="true">
            <Icon size={compact ? 16 : 19} />
            <i />
          </span>
          <strong>{label(key)}</strong>
        </li>
      ))}
    </ol>
  );
}
