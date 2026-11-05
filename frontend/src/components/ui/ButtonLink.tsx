import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import Icon, { type IconName } from "./Icon";
import { buttonClasses, type ButtonVariant } from "./buttonClasses";

interface Props {
  to: string;
  variant?: ButtonVariant;
  icon?: IconName;
  /** Ícone depois do texto, como a seta de "Ver todas". */
  trailingIcon?: IconName;
  className?: string;
  children?: ReactNode;
}

/** Navegação com o aspeto de um `Button`. */
function ButtonLink({ to, variant = "secondary", icon, trailingIcon, className = "", children }: Props) {
  const size = variant === "text" ? 14 : 16;
  return (
    <Link to={to} className={`${buttonClasses(variant)} ${className}`}>
      {icon && <Icon name={icon} size={size} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={size} />}
    </Link>
  );
}

export default ButtonLink;
