import type { ReactNode } from "react";

interface Props {
  message: string;
  /** Ação opcional, como limpar filtros ou voltar à lista. */
  action?: ReactNode;
}

function EmptyState({ message, action }: Props) {
  return (
    <div className="grid justify-items-center gap-3 px-5 py-12 text-center text-muted">
      <p>{message}</p>
      {action}
    </div>
  );
}

export default EmptyState;
