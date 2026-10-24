import { ArrowUpRight, UserRoundCog } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";

export function AccountSettingsButton() {
  const { t } = useLocale();
  return (
    <AppLink
      href="/my/profile"
      className="account-settings-button"
      aria-label={t({ en: "Account settings", ar: "إعدادات الحساب" })}
    >
      <span className="account-settings-mark" aria-hidden="true">
        <UserRoundCog size={18} />
      </span>
      <span>{t({ en: "Settings", ar: "الإعدادات" })}</span>
      <ArrowUpRight size={13} className="directional" aria-hidden="true" />
    </AppLink>
  );
}
