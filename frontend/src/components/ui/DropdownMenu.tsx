import { useEffect, useRef, useState } from "react";

import Button from "./Button";
import { useEscape } from "./useEscape";

interface Item {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}

interface Props {
  /** Nome acessível do botão ⋯. */
  label: string;
  items: Item[];
}

/** Menu ⋯. Fecha com Esc, com clique fora e ao escolher uma opção. */
function DropdownMenu({ label, items }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEscape(() => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={root} className="relative" onClick={(e) => e.stopPropagation()}>
      <Button variant="icon" icon="more" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} />
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-1 grid min-w-[180px] rounded-panel border border-line bg-white py-1">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className="px-3 py-2 text-left text-xs enabled:hover:bg-surface disabled:text-muted"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;
