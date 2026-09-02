import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAppearance } from "../../app/providers/AppearanceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
export function SidebarToggle({ controls }: { controls: string }) {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppearance();
  const { label } = useLocale();
  const title = label(sidebarCollapsed ? "expandSidebar" : "collapseSidebar");
  return (
    <button
      className="sidebar-toggle"
      type="button"
      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      aria-expanded={!sidebarCollapsed}
      aria-controls={controls}
      aria-label={title}
      title={title}
    >
      {sidebarCollapsed ? (
        <PanelLeftOpen size={17} />
      ) : (
        <PanelLeftClose size={17} />
      )}
    </button>
  );
}
