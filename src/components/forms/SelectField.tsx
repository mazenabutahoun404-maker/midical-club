import { useId, type SelectHTMLAttributes } from "react";
export function SelectField({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = useId();
  return (
    <label className="workspace-field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} {...props}>
        {children}
      </select>
    </label>
  );
}
