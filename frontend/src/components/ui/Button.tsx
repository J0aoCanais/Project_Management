import type { ButtonHTMLAttributes } from "react";

import Icon, { type IconName } from "./Icon";
import { buttonClasses, type ButtonVariant } from "./buttonClasses";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: IconName;
}

/** Botão de ação. Com `variant="icon"` não tem texto e precisa de `aria-label`. */
function Button({ variant = "secondary", icon, type = "button", className = "", children, ...rest }: Props) {
  return (
    <button type={type} className={`${buttonClasses(variant)} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={variant === "text" ? 14 : 16} />}
      {children}
    </button>
  );
}

export default Button;
