import { ArrowLeft, Radio, UserRound } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { AppLink } from "./AppLink";
import { LanguageMenu } from "./LanguageMenu";
import { AppearanceSettings } from "./AppearanceSettings";

export function AdminHeader() {
  const { label, t } = useLocale();
  const auth = useAuth();
  return (
    <header className="admin-header container">
      <AppLink className="admin-back space-portal-link" href="/">
        <ArrowLeft size={17} className="directional" aria-hidden="true" />
        <span>{label("adminBackHome")}</span>
      </AppLink>
      <span className="admin-live-chip">
        <Radio size={15} />
        {label("adminSignalLive")}
      </span>
      <div className="admin-header-actions">
        <LanguageMenu />
        <AppearanceSettings compact />
        <AppLink href="/my/profile" className="admin-operator space-portal-link">
          <UserRound size={18} aria-hidden="true" />
          <span>
            {auth.snapshot.user
              ? t(auth.snapshot.user.profile.name)
              : label("myProfile")}
          </span>
        </AppLink>
      </div>
    </header>
  );
}
