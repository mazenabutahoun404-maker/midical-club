import { LockKeyhole, type LucideIcon } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useServices } from "../../app/providers/ServicesProvider";
import { needsSignIn } from "../../lib/access-policy";

export interface AliveTab<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
  count?: number;
  locked?: boolean;
  lockLabel?: string;
}

export function AliveTabs<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: AliveTab<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const auth = useAuth(),
    { t } = useLocale(),
    live = useServices().contentSnapshot?.kind === "live";
  return (
    <div className="alive-tabs" role="group" aria-label={label}>
      {items.map(
        ({
          id,
          label: tabLabel,
          icon: Icon,
          count,
          locked: explicitLock,
          lockLabel: suppliedLockLabel,
        }) => {
          const locked =
            explicitLock ||
            (auth.snapshot.status !== "authenticated" && needsSignIn(id, live));
          const lockLabel =
            auth.snapshot.status === "verification-required"
              ? t({ en: "Verify your email", ar: "يتطلب تأكيد البريد" })
              : suppliedLockLabel ||
                t({
                  en: auth.isPending ? "Checking access" : "Sign in required",
                  ar: auth.isPending ? "جارٍ التحقق" : "يتطلب تسجيل الدخول",
                });
          return (
            <button
              key={id}
              aria-label={
                locked
                  ? `${tabLabel} · ${lockLabel || "Sign in required"}`
                  : count === undefined
                    ? tabLabel
                    : `${tabLabel} · ${count}`
              }
              disabled={locked}
              data-auth-locked={locked || undefined}
              aria-pressed={value === id}
              onClick={() => onChange(id)}
            >
              <Icon aria-hidden="true" size={18} className="tab-icon" />
              <span>{tabLabel}</span>
              {count !== undefined && <b>{count}</b>}
              {locked && <LockKeyhole size={14} aria-hidden="true" />}
            </button>
          );
        },
      )}
    </div>
  );
}
