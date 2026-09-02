import { Search } from "lucide-react";
import { Input } from "../ui/input";
export function SearchInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <label className="catalog-search">
      <Search size={18} aria-hidden="true" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        placeholder={label}
        className="border-0 shadow-none"
      />
    </label>
  );
}
