import { useState, type InputHTMLAttributes } from "react";

import { parseDecimal } from "../../lib/format";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "min" | "max"> {
  value: number;
  onChange: (value: number) => void;
  /** Unidade à direita: "€", "%", "meses". */
  suffix?: string;
  /** Com `min` igual ou maior que 0 não se aceita o sinal "-". */
  min?: number;
  /** Valor máximo: o que passe disto não chega a ser escrito. */
  max?: number;
  /** Casas decimais permitidas; 0 = só inteiros. */
  decimals?: number;
  /** Mensagem de erro: pinta a borda de vermelho (o texto vem do `FormField`). */
  invalid?: boolean;
}

const toText = (value: number) => String(value).replace(".", ",");

/** O texto pode ser um número (ainda a meio de ser escrito) com estas regras? */
function isAcceptable(text: string, decimals: number, allowNegative: boolean): boolean {
  const sign = allowNegative ? "-?" : "";
  const fraction = decimals > 0 ? `([.,]\\d{0,${decimals}})?` : "";
  if (new RegExp(`^${sign}\\d*${fraction}$`).test(text)) return true;
  // "220.000" como milhares, com vírgula para as casas decimais.
  if (decimals === 0) return false;
  return new RegExp(`^${sign}\\d{1,3}(\\.\\d{3})*(\\.\\d{0,3})?(,\\d{0,${decimals}})?$`).test(text);
}

/**
 * Campo numérico com unidade. O rótulo vem do `FormField` à volta.
 * É de texto porque um `type="number"` em português trata "5.5" como inválido e devolve vazio:
 * aqui aceitam-se vírgula e ponto, e "220.000" conta como milhares.
 * Letras, mais casas decimais do que as permitidas e valores acima de `max` são ignorados ao escrever.
 */
function NumberInput({ value, onChange, suffix, className = "", min, max, decimals = 2, invalid = false, onBlur, ...rest }: Props) {
  const [text, setText] = useState(() => toText(value));
  // O que se está a escrever mantém-se ("5," ou vazio); se o valor mudar por fora, mostra-se o novo.
  const shown = parseDecimal(text) === value ? text : toText(value);
  const allowNegative = min === undefined || min < 0;

  return (
    <div
      className={`flex h-[38px] items-center overflow-hidden rounded-control border bg-white ${invalid ? "border-danger" : "border-line focus-within:border-brand"} ${className}`}
    >
      <input
        type="text"
        inputMode={decimals > 0 ? "decimal" : "numeric"}
        autoComplete="off"
        maxLength={18}
        aria-invalid={invalid || undefined}
        value={shown}
        onChange={(e) => {
          const next = e.target.value.replace(/\s/g, "").replace(/^0+(?=\d)/, "");
          if (!isAcceptable(next, decimals, allowNegative)) return;
          const parsed = parseDecimal(next);
          if (max !== undefined && parsed > max) return;
          if (min !== undefined && parsed < min) return;
          setText(next);
          onChange(parsed);
        }}
        onBlur={(e) => {
          setText(toText(value));
          onBlur?.(e);
        }}
        className="h-full w-full min-w-0 border-0 px-2.5 text-xs tabular-nums outline-none"
        {...rest}
      />
      {suffix && <i className="grid h-full shrink-0 place-items-center border-l border-line bg-surface px-2.5 text-[11px] not-italic text-muted">{suffix}</i>}
    </div>
  );
}

export default NumberInput;
