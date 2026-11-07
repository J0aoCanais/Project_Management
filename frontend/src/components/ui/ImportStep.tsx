import type { ReactNode } from "react";

interface Props {
  number: number;
  title: string;
  description: string;
  action: ReactNode;
}

function ImportStep({ number, title, description, action }: Props) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-control border border-line bg-white px-3 py-2.5">
      <b className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-[11px] text-white">{number}</b>
      <div className="min-w-0 flex-1">
        <strong className="block text-xs">{title}</strong>
        <span className="mt-0.5 block text-[11px] wrap-anywhere text-muted">{description}</span>
      </div>
      {action}
    </li>
  );
}

export default ImportStep;
