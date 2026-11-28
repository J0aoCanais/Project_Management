import type { FinanceValues } from "../../api/opportunitiesApi";
import type { FinanceResult } from "../../lib/finance";
import { formatMoney, formatPercent } from "../../lib/format";
import { investorKindLabel } from "../../lib/investorRules";
import { fromPassiveProfile, netReturn } from "../../lib/taxRules";
import ResultsLine from "./ResultsLine";

interface Props {
  values: FinanceValues;
  result: FinanceResult;
}

const listClasses = "m-0 mt-3 grid list-none gap-1.5 border-t border-results-line p-0 pt-2.5";

/**
 * Passos 3 a 5 da tarefa 09 no cartão de resultados: a margem depois de IRC dividida entre o investidor e a empresa,
 * e o retorno líquido do investidor com a estrutura escolhida (o imposto aplica-se só à parte dele).
 */
function FinanceSplitResults({ values, result }: Props) {
  const structure = fromPassiveProfile(values.investorProfile);
  const net = netReturn({ grossProfit: result.investorProfit, investedCapital: result.cost, termMonths: values.termMonths, ...structure });
  const share = values.investorSharePercent;
  return (
    <>
      <div className="mt-5">
        <span className="block text-[11px] text-results-muted">Margens das duas partes (depois de IRC)</span>
        <ul className={listClasses}>
          <ResultsLine label={`Investidor ativo (${formatPercent(share, 0)})`} value={formatMoney(result.investorProfit)} />
          <ResultsLine label={`Empresa (${formatPercent(100 - share, 0)})`} value={formatMoney(result.companyProfit)} />
        </ul>
      </div>
      <div className="mt-5">
        <span className="block text-[11px] text-results-muted">Retorno líquido do investidor · {investorKindLabel({ investorKind: structure.kind, caepTerm: structure.caep })}</span>
        {share > 0 ? (
          <ul className={listClasses}>
            <ResultsLine label={`Impostos da estrutura (${formatPercent(net.taxRate, 0)})`} value={formatMoney(-net.tax || 0)} />
            <ResultsLine label="Lucro líquido do investidor" value={formatMoney(net.netProfit)} strong />
            <ResultsLine label="Cash-on-cash" value={result.cost > 0 ? formatPercent(net.cashOnCash) : "—"} />
            <ResultsLine label="ROI anualizado do investidor" value={result.cost > 0 && values.termMonths > 0 ? formatPercent(net.annualized) : "—"} />
          </ul>
        ) : (
          <p className="mt-1.5 text-[11px] text-results-muted">Indique a percentagem do investidor ativo para ver o que ele recebe.</p>
        )}
      </div>
    </>
  );
}

export default FinanceSplitResults;
