import { useState, type InputHTMLAttributes } from "react";

import Icon from "./Icon";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}

/** Campo de palavra-passe com botão para mostrar ou esconder o que se escreveu. */
function PasswordInput({ value, onChange, invalid = false, className = "", ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={`flex h-[38px] items-center overflow-hidden rounded-control border bg-white ${invalid ? "border-danger" : "border-line focus-within:border-brand"} ${className}`}>
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        className="h-full w-full min-w-0 border-0 px-2.5 text-xs outline-none"
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
        aria-pressed={visible}
        className="grid h-full shrink-0 place-items-center px-2.5 text-muted hover:text-ink"
      >
        <Icon name={visible ? "eyeOff" : "eye"} size={16} />
      </button>
    </div>
  );
}

export default PasswordInput;
