import type { ReactNode } from "react";

import Button from "./Button";
import { useEscape } from "./useEscape";

interface Props {
  title: string;
  description?: ReactNode;
  /** Largura maior para conteúdo com tabelas, como a importação. */
  wide?: boolean;
  onClose: () => void;
  footer?: ReactNode;
  children?: ReactNode;
}

/** Modal centrado. Fecha com Esc, com clique fora e no botão de fechar. */
function Dialog({ title, description, wide = false, onClose, footer, children }: Props) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-backdrop p-3.5" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        className={`flex max-h-[90vh] w-full flex-col rounded-panel border border-line bg-white ${wide ? "max-w-[980px]" : "max-w-[420px]"}`}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 className="text-base font-bold">{title}</h2>
            {description && <div className="mt-1 text-xs text-muted">{description}</div>}
          </div>
          <Button variant="icon" icon="x" aria-label="Fechar" onClick={onClose} />
        </header>
        {children && <div className="grid gap-3 overflow-auto p-4">{children}</div>}
        {footer && <footer className="flex justify-end gap-2 border-t border-line px-4 py-3">{footer}</footer>}
      </div>
    </div>
  );
}

export default Dialog;
