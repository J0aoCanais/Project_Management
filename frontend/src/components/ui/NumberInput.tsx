import { useState, type InputHTMLAttributes } from "react";

import { parseDecimal } from "../../lib/format";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  /** Unidade à direita: "€", "%", "meses". */
  suffix?: string;
}

const toText = (value: number) => String(value).replace(".", ",");

/**
 * Campo numérico com unidade. O rótulo vem do `FormField` à volta.
 * É de texto porque um `type="number"` em português trata "5.5" como inválido e devolve vazio:
 * aqui aceitam-se vírgula e ponto, e "220.000" conta como milhares.
 */
function NumberInput({ value, onChange, suffix, className = "", min, onBlur, ...rest }: Props) {
  const [text, setText] = useState(() => toText(value));
  // O que se está a escrever mantém-se ("5," ou vazio); se o valor mudar por fora, mostra-se o novo.
  const shown = parseDecimal(text) === value ? text : toText(value);
  const notAllowed = min !== undefined && Number(min) >= 0 ? /[^\d.,]/g : /[^\d.,-]/g;

  return (
    <div className={`flex h-[38px] items-center overflow-hidden rounded-control border border-line bg-white focus-within:border-brand ${className}`}>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={shown}
        onChange={(e) => {
          const next = e.target.value.replace(notAllowed, "").replace(/^0+(?=\d)/, "");
          setText(next);
          onChange(parseDecimal(next));
        }}
        onBlur={(e) => {
          setText(toText(value));
          onBlur?.(e);
        }}
        className="h-full w-full min-w-0 border-0 px-2.5 text-xs tabular-nums outline-none"
        {...rest}
      />
      {suffix && <i className="grid h-full place-items-center border-l border-line bg-surface px-2.5 text-[11px] not-italic text-muted">{suffix}</i>}
    </div>
  );
}

export default NumberInput;
