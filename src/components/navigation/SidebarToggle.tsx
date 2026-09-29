import logo from "../../assets/brand/medclub-logo.png";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
export function SidebarToggle({ controls }: { controls: string }) {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppearance();
  const { label } = useLocale();
  const title = label(sidebarCollapsed ? "expandSidebar" : "collapseSidebar");
  return (
    <>
      <img
        className="sidebar-expanded-logo"
        src={logo}
        alt=""
        width={40}
        height={40}
      />
      <button
        className="sidebar-toggle"
        type="button"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-expanded={!sidebarCollapsed}
        aria-controls={controls}
        aria-label={title}
        title={title}
      >
        <img
          className="sidebar-brand-logo"
          src={logo}
          alt=""
          width={40}
          height={40}
        />
        {sidebarCollapsed ? (
          <PanelLeftOpen size={17} aria-hidden="true" />
        ) : (
          <PanelLeftClose size={17} aria-hidden="true" />
        )}
      </button>
    </>
  );
}
