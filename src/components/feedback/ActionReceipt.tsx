import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, Trash2 } from "lucide-react";
export type ActionKind = "saved" | "reviewed" | "unreviewed" | "deleted";
export function useActionReceipt() {
  const [receipt, setReceipt] = useState<{
    kind: ActionKind;
    token: number;
  } | null>(null);
  const token = useRef(0),
    alive = useRef(true),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  const flash = (kind: ActionKind) => {
    if (!alive.current) return;
    clearTimeout(timer.current);
    setReceipt({ kind, token: ++token.current });
    timer.current = setTimeout(() => setReceipt(null), 700);
  };
  return { receipt, flash };
}
export function ActionReceipt({
  receipt,
}: {
  receipt: ReturnType<typeof useActionReceipt>["receipt"];
}) {
  if (!receipt) return null;
  const Icon =
    receipt.kind === "deleted"
      ? Trash2
      : receipt.kind === "saved"
        ? CheckCircle2
        : Check;
  return (
    <span
      key={receipt.token}
      className="action-receipt-mark"
      data-action={receipt.kind}
      aria-hidden="true"
    >
      <Icon size={17} />
    </span>
  );
}
