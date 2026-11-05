import type { ReactNode } from "react";

interface Props {
  label: string;
  error?: string;
  className?: string;
  /** O controlo (input, select, textarea…) fica dentro do `<label>`. */
  children: ReactNode;
}

function FormField({ label, error, className = "", children }: Props) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1 block text-[11px] text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[11px] text-danger">{error}</span>}
    </label>
  );
}

export default FormField;
