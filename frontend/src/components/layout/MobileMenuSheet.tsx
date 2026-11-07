import { useEffect } from "react";
import { NavLink } from "react-router-dom";

import Icon from "../ui/Icon";
import type { NavItem } from "./navigation";

interface Props {
  items: NavItem[];
  onClose: () => void;
}

/** Folha inferior com as áreas que não cabem na barra de navegação em telemóvel. */
function MobileMenuSheet({ items, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 min-[721px]:hidden" role="dialog" aria-modal="true" aria-label="Mais áreas">
      <div className="absolute inset-0 bg-[rgba(12,30,30,.4)]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 grid rounded-t-2xl bg-white px-[18px] pt-4 pb-[26px] shadow-[0_-20px_60px_rgba(0,0,0,.18)]">
        <div className="mb-2 flex items-center justify-between">
          <strong>Mais áreas</strong>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-[34px] place-items-center rounded-control hover:bg-surface">
            <Icon name="x" />
          </button>
        </div>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 border-b border-line px-1 py-3 ${isActive ? "font-semibold text-brand" : ""}`
            }
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default MobileMenuSheet;
