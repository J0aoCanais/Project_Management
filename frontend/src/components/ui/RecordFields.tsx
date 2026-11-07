import type { ReactNode } from "react";

import Panel from "./Panel";

interface Props {
  title?: string;
  fields: { label: string; value: ReactNode }[];
}

function RecordFields({ title = "Dados do registo", fields }: Props) {
  return (
    <Panel>
      <h2 className="border-b border-line px-3 py-2.5 text-xs font-bold">{title}</h2>
      <div className="grid grid-cols-2 min-[721px]:grid-cols-3">
        {fields.map((field) => (
          <dl key={field.label} className="m-0 border-r border-b border-line px-3 py-2.5">
            <dt className="text-[11px] text-muted">{field.label}</dt>
            <dd className="m-0 mt-[3px] text-xs font-semibold">{field.value}</dd>
          </dl>
        ))}
      </div>
    </Panel>
  );
}

export default RecordFields;
