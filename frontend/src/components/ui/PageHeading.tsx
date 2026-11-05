import type { ReactNode } from "react";

interface Props {
  title: string;
  actions?: ReactNode;
}

function PageHeading({ title, actions }: Props) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
      <h1 className="text-[22px] font-bold tracking-[-0.35px]">{title}</h1>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export default PageHeading;
