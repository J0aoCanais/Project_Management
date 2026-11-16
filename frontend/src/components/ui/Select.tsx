import type { ChangeEvent } from "react";

import { inputClasses } from "./inputClasses";

/** Opção com valor diferente do texto, como um id e um nome. */
export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Texto simples (valor = texto) ou `{ value, label }`. */
  options: (string | SelectOption)[];
  placeholder?: string;
  label?: string;
  className?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}

const toOption = (option: string | SelectOption): SelectOption => (typeof option === "string" ? { value: option, label: option } : option);

function Select({ value, onChange, options, placeholder, label, className = "", autoFocus, disabled, invalid = false }: Props) {
  return (
    <select
      aria-label={label}
      aria-invalid={invalid || undefined}
      autoFocus={autoFocus}
      disabled={disabled}
      className={`${inputClasses} disabled:bg-surface disabled:text-muted ${invalid ? "border-danger" : ""} ${className}`}
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map(toOption).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
