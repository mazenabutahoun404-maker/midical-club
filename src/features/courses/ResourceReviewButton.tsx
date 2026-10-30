import { useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import {
  ActionReceipt,
  useActionReceipt,
} from "../../components/feedback/ActionReceipt";
export function ResourceReviewButton({ id }: { id: string }) {
  const { state, send, isPending } = useWorkspace(),
    { label } = useLocale();
  const feedback = useActionReceipt(),
    busy = useRef(false),
    [working, setWorking] = useState(false);
  const reviewed = state.reviewedResourceIds.includes(id);
  return (
    <button
      type="button"
      className="notebook-button notebook-button-quiet study-review-button"
      aria-pressed={reviewed}
      aria-label={label(reviewed ? "unmarkReviewed" : "markReviewed")}
      disabled={isPending || working}
      onClick={async () => {
        if (busy.current) return;
        busy.current = true;
        setWorking(true);
        try {
          if (await send({ type: "toggle-reviewed", id }))
            feedback.flash(reviewed ? "unreviewed" : "reviewed");
        } finally {
          busy.current = false;
          setWorking(false);
        }
      }}
    >
      <CheckCircle2 size={17} />
      <span>{label(reviewed ? "unmarkReviewed" : "markReviewed")}</span>
      <ActionReceipt receipt={feedback.receipt} />
    </button>
  );
}
