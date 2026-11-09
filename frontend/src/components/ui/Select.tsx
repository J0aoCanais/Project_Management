import type { ChangeEvent } from "react";

import { inputClasses } from "./inputClasses";

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: string[];
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
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

export default Select;
