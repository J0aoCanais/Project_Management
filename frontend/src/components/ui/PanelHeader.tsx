import type { ReactNode } from "react";

interface Props {
  title: string;
  action?: ReactNode;
}

function PanelHeader({ title, action }: Props) {
  return (
    <div className="flex items-start justify-between gap-3 px-3.5 pt-3">
      <h2 className="text-xs font-bold">{title}</h2>
      {action}
    </div>
  );
}

export default PanelHeader;
