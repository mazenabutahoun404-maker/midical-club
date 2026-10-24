import { useAppearance } from "../../app/providers/AppearanceProvider";
import { useLocale } from "../../app/providers/LocaleProvider";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
export function SidebarToggle({ controls }: { controls: string }) {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppearance();
  const { label, locale } = useLocale();
  const title = label(sidebarCollapsed ? "expandSidebar" : "collapseSidebar");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="sidebar-toggle rail-edge-toggle"
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-expanded={!sidebarCollapsed}
          aria-controls={controls}
          aria-label={title}
        >
          <span className="rail-edge-surface" aria-hidden="true" />
          <span className="rail-edge-grip" aria-hidden="true">
            <svg className="rail-edge-plane" viewBox="0 0 24 24" fill="none">
              <path d="M3 3 21 12 3 21l4-9-4-9Z" />
              <path d="M7 12h14M7 12 3 3" />
            </svg>
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side={locale === "ar" ? "left" : "right"} sideOffset={8}>
        {title}
      </TooltipContent>
    </Tooltip>
  );
}
