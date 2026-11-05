import type { ReactNode } from "react";

import Button from "./Button";
import { useEscape } from "./useEscape";

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

/** Painel lateral. Em telemóvel ocupa o ecrã inteiro. Fecha com Esc e com clique fora. */
function Drawer({ title, subtitle, onClose, footer, children }: Props) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50 bg-backdrop" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-surface min-[721px]:w-[420px]"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-[18px]">
          <div>
            <h2 className="text-base font-bold">{title}</h2>
            {subtitle && <span className="text-[11px] text-muted">{subtitle}</span>}
          </div>
          <Button variant="icon" icon="x" aria-label="Fechar" onClick={onClose} />
        </header>
        <div className="grid flex-1 content-start gap-2.5 overflow-auto p-3.5">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line bg-white px-[18px] py-3">{footer}</footer>}
      </aside>
    </div>
  );
}

export default Drawer;
