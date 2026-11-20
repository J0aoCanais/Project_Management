import type { FinanceValues } from "../../api/opportunitiesApi";
import type { FinanceResult } from "../../lib/finance";
import { investorKindLabel } from "../../lib/investorRules";
import { netReturn } from "../../lib/taxRules";
import NetReturnTable from "../investors/NetReturnTable";
import type { ReportAudience } from "./ReportAudienceDialog";

interface Props {
  values: FinanceValues;
  result: FinanceResult;
  audience: ReportAudience;
  className: string;
}

/**
 * Retorno líquido no relatório. Com a percentagem do investidor ativo, o lucro é a parte dele; sem ela, a margem toda.
 * O cash-on-cash é calculado sobre o investimento total da operação, como na folha do cliente.
 */
function ReportNetReturn({ values, result, audience, className }: Props) {
  const grossProfit = values.investorSharePercent > 0 ? result.investorProfit : result.margin;
  const net = netReturn({ grossProfit, investedCapital: result.cost, termMonths: values.termMonths, kind: audience.kind, caep: audience.caep });
  return (
    <section className="mt-[22px] break-inside-avoid">
      <h2 className={className}>Retorno líquido para o investidor{audience.investorName ? ` · ${audience.investorName}` : ""}</h2>
      <NetReturnTable
        grossProfit={grossProfit}
        result={net}
        structure={investorKindLabel({ investorKind: audience.kind, caepTerm: audience.caep })}
        hasTerm={values.termMonths > 0}
      />
    </section>
  );
}

export default ReportNetReturn;
