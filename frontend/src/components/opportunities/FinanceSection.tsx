import type { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  children: ReactNode;
}

/** Bloco com título dentro do formulário da análise financeira (.form-section). */
function FinanceSection({ title, description, children }: Props) {
  return (
    <section className="mx-3.5 border-t border-line pt-4 pb-4">
      <h3 className="text-[13px] font-bold">{title}</h3>
      <p className="mt-0.5 text-[11px] text-muted">{description}</p>
      {children}
    </section>
  );
}

export default FinanceSection;
