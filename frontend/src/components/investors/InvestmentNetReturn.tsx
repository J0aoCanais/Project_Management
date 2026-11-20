import { useState } from "react";

import type { InvestmentInput, InvestorProfile } from "../../api/investorsApi";
import { useOperations } from "../../hooks/useOperations";
import { investmentGrossProfit, investorKindLabel, TERM_MONTHS } from "../../lib/investorRules";
import { netReturn } from "../../lib/taxRules";
import FormField from "../ui/FormField";
import NumberInput from "../ui/NumberInput";
import NetReturnTable from "./NetReturnTable";

interface Props {
  investment: InvestmentInput;
  profile: InvestorProfile;
}

/** Simulação do retorno líquido de um investimento novo, com o imposto da estrutura do investidor. */
function InvestmentNetReturn({ investment, profile }: Props) {
  const operations = useOperations();
  // Só para a simulação: o investimento não guarda prazo (o anualizado precisa dele).
  const [termMonths, setTermMonths] = useState(12);
  const operationMargin = operations.data?.find((operation) => operation.code === investment.operationCode)?.expectedMargin ?? 0;

  if (!profile.investorKind) {
    return <p className="text-[11px] text-muted">Indique no perfil se o investidor é particular ou empresa para ver o retorno líquido.</p>;
  }
  if (!investment.returnType || investment.committedValue <= 0) {
    return <p className="text-[11px] text-muted">Preencha o valor comprometido, o tipo de retorno e a taxa para ver o retorno líquido.</p>;
  }

  const grossProfit = investmentGrossProfit(investment, operationMargin);
  const result = netReturn({ grossProfit, investedCapital: investment.committedValue, termMonths, kind: profile.investorKind, caep: profile.caepTerm });

  return (
    <section className="grid gap-2 border-t border-line pt-3">
      <h3 className="text-xs font-bold">Retorno líquido estimado</h3>
      <FormField label="Prazo previsto (meses, só para a simulação)">
        <NumberInput min={TERM_MONTHS.min} max={TERM_MONTHS.max} decimals={TERM_MONTHS.decimals} value={termMonths} onChange={setTermMonths} />
      </FormField>
      {investment.returnType === "Participação nos lucros" && !operationMargin && (
        <p className="text-[11px] text-muted">Escolha a operação: a participação é calculada sobre a margem prevista.</p>
      )}
      <NetReturnTable grossProfit={grossProfit} result={result} structure={investorKindLabel(profile)} hasTerm={termMonths > 0} />
    </section>
  );
}

export default InvestmentNetReturn;
