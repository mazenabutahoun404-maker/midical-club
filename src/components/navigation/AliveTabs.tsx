import type { LucideIcon } from "lucide-react";
import { MorphIcon } from "../ui/MorphIcon";

export interface AliveTab<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
  count?: number;
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
  return (
    <div className="alive-tabs" role="group" aria-label={label}>
      {items.map(({ id, label: tabLabel, icon: Icon, count }) => (
        <button
          key={id}
          aria-label={count === undefined ? tabLabel : `${tabLabel} · ${count}`}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          <MorphIcon icon={Icon} size={18} className="tab-icon" />
          <span>{tabLabel}</span>
          {count !== undefined && <b>{count}</b>}
        </button>
      ))}
    </div>
  );
}
