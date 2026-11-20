import { useState, type ChangeEvent } from "react";

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
  /** Mostra uma caixa de pesquisa por cima, para listas longas (ex.: contactos). A opção escolhida nunca é escondida. */
  searchable?: boolean;
}

const toOption = (option: string | SelectOption): SelectOption => (typeof option === "string" ? { value: option, label: option } : option);

function Select({ value, onChange, options, placeholder, label, className = "", autoFocus, disabled, invalid = false, searchable = false }: Props) {
  const [query, setQuery] = useState("");
  const text = query.trim().toLowerCase();
  const visible = options.map(toOption).filter((option) => !text || option.value === value || option.label.toLowerCase().includes(text));

  const select = (
    <select
      aria-label={label}
      aria-invalid={invalid || undefined}
      autoFocus={autoFocus && !searchable}
      disabled={disabled}
      className={`${inputClasses} disabled:bg-surface disabled:text-muted ${invalid ? "border-danger" : ""} ${className}`}
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {visible.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (!searchable) return select;

  return (
    <div className="grid gap-1.5">
      <input
        type="search"
        aria-label={label ? `Pesquisar ${label.toLowerCase()}` : "Pesquisar"}
        placeholder="Pesquisar…"
        autoFocus={autoFocus}
        disabled={disabled}
        className={inputClasses}
        value={query}
        maxLength={80}
        onChange={(e) => setQuery(e.target.value)}
      />
      {select}
    </div>
  );
}

export default Select;
