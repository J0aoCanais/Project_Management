import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
  const [above, setAbove] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEscape(() => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Abre para cima quando em baixo ficaria cortado pelo ecrã ou por um contentor com scroll, como o quadro.
  useLayoutEffect(() => {
    if (!open || !menu.current || !root.current) {
      setAbove(false);
      return;
    }
    const rect = menu.current.getBoundingClientRect();
    let top = 0;
    let bottom = window.innerHeight;
    for (let parent = root.current.parentElement; parent; parent = parent.parentElement) {
      if (getComputedStyle(parent).overflowY === "visible") continue;
      const box = parent.getBoundingClientRect();
      top = Math.max(top, box.top);
      bottom = Math.min(bottom, box.bottom);
    }
    setAbove(rect.bottom > bottom && root.current.getBoundingClientRect().top - rect.height >= top);
  }, [open]);

  return (
    <div ref={root} className="relative" onClick={(e) => e.stopPropagation()}>
      <Button variant="icon" icon="more" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} />
      {open && (
        <div ref={menu} role="menu" className={`absolute right-0 z-20 grid min-w-[180px] rounded-panel border border-line bg-white py-1 ${above ? "bottom-full mb-1" : "mt-1"}`}>
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
