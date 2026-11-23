import type { ReactNode } from "react";

import Panel from "./Panel";

interface Props {
  title?: string;
  /** `wide` ocupa a linha inteira (para textos longos, como mensagens). */
  fields: { label: string; value: ReactNode; wide?: boolean }[];
  /** Conteúdo por baixo dos campos, como as observações. */
  children?: ReactNode;
}

function RecordFields({ title = "Dados do registo", fields, children }: Props) {
  return (
    <Panel>
      <h2 className="border-b border-line px-3 py-2.5 text-xs font-bold">{title}</h2>
      <div className="grid grid-cols-2 min-[721px]:grid-cols-3">
        {fields.map((field) => (
          <dl key={field.label} className={`m-0 min-w-0 border-r border-b border-line px-3 py-2.5 ${field.wide ? "col-span-full" : ""}`}>
            <dt className="text-[11px] text-muted">{field.label}</dt>
            <dd className="m-0 mt-[3px] text-xs font-semibold wrap-anywhere whitespace-pre-line">{field.value}</dd>
          </dl>
        ))}
      </div>
      {children}
    </Panel>
  );
}

export default RecordFields;
