import type { ChangeEvent } from "react";

import { inputClasses } from "./inputClasses";

/** Opção com valor diferente do texto, ex.: o id de um contacto e o nome. */
export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  label?: string;
  className?: string;
  autoFocus?: boolean;
}

function Select({ value, onChange, options, placeholder, label, className = "", autoFocus }: Props) {
  return (
    <select
      aria-label={label}
      autoFocus={autoFocus}
      className={`${inputClasses} ${className}`}
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((option) =>
        typeof option === "string" ? (
          <option key={option}>{option}</option>
        ) : (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ),
      )}
    </select>
  );
}

export default Select;
