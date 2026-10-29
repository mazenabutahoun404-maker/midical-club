import { Palette, Languages, PanelLeft } from "lucide-react";
import { useLocale } from "../../app/providers/LocaleProvider";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { AppearanceSettings } from "../../components/navigation/AppearanceSettings";
import { PageIntro } from "../../components/data-display/PageIntro";
import { AccountSecurity } from "./AccountSecurity";
import { AccountAccessRequests } from "./AccountAccessRequests";
export default function SettingsPage() {
  const { label, locale } = useLocale();
  const { navigation, sidebarCollapsed, setSidebarCollapsed, persisted } =
    useAppearance();
  return (
    <div className="container personal-settings">
      <PageIntro
        title={label("personalSettings")}
        eyebrow={label("makeItYours")}
        description={label("personalSettingsBody")}
      />
      <section className="personal-setting-row">
        <span className="setting-row-icon">
          <Palette size={23} />
        </span>
        <div>
          <h2>{label("desktopNavigation")}</h2>
          <p>
            {label(navigation)} · {label("chooseLayout")}
          </p>
        </div>
        <AppearanceSettings />
      </section>
      <section className="personal-setting-row">
        <span className="setting-row-icon">
          <PanelLeft size={23} />
        </span>
        <div>
          <h2>{label("sidebarSize")}</h2>
          <p>{label("sidebarSizeBody")}</p>
        </div>
        <button
          className="sidebar-setting-switch"
          role="switch"
          aria-checked={sidebarCollapsed}
          aria-label={label("compactSidebar")}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <span />
        </button>
      </section>
      <section className="personal-setting-row">
        <span className="setting-row-icon">
          <Languages size={23} />
        </span>
        <div>
          <h2>{label("language")}</h2>
          <p>
            {locale === "en"
              ? "English · Change language in Appearance"
              : "العربية · غيّر اللغة من المظهر"}
          </p>
        </div>
      </section>
      <p className="personal-setting-notice" role="status">
        {label(persisted ? "preferencesSaved" : "sessionOnly")}
      </p>
      <AccountSecurity />
      <AccountAccessRequests />
    </div>
  );
}
