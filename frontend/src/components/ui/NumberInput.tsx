import type { InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  /** Unidade à direita: "€", "%", "meses". */
  suffix?: string;
}

/** Campo numérico com unidade. O rótulo vem do `FormField` à volta. */
function NumberInput({ value, onChange, suffix, className = "", ...rest }: Props) {
  return (
    <div className={`flex h-[38px] items-center overflow-hidden rounded-control border border-line bg-white focus-within:border-brand ${className}`}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-full w-full min-w-0 border-0 px-2.5 text-xs tabular-nums outline-none"
        {...rest}
      />
      {suffix && <i className="grid h-full place-items-center border-l border-line bg-surface px-2.5 text-[11px] not-italic text-muted">{suffix}</i>}
    </div>
  );
}

export default NumberInput;
