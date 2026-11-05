import type { ReactNode } from "react";

interface Props {
  className?: string;
  children: ReactNode;
}

/** Superfície branca e plana usada por quase todos os blocos. */
function Panel({ className = "", children }: Props) {
  return <div className={`min-w-0 rounded-panel border border-line bg-white ${className}`}>{children}</div>;
}

export default Panel;
