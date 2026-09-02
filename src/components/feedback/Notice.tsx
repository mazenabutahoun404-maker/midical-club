import { Info } from "lucide-react";
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="demo-note">
      <Info size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
