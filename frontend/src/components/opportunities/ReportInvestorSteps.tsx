import type { FinanceValues } from "../../api/opportunitiesApi";
import type { FinanceResult } from "../../lib/finance";
import { formatMoney, formatPercent } from "../../lib/format";
import { investorKindLabel } from "../../lib/investorRules";
import { IRC_RATE, netReturn } from "../../lib/taxRules";
import type { ReportAudience } from "./ReportAudienceDialog";

interface Props {
  values: FinanceValues;
  result: FinanceResult;
  audience: ReportAudience;
  className: string;
}

interface Step {
  label: string;
  detail?: string;
  value: string;
  strong?: boolean;
}

/**
 * Os passos das contas na ótica do investidor (§1 da tarefa 09): o que se fatura, menos IRC, a parte dele,
 * menos os impostos da estrutura, quanto vai receber, cash-on-cash e ROI anualizado.
 * O cash-on-cash é calculado sobre o investimento total da operação, como na folha do cliente.
 */
function ReportInvestorSteps({ values, result, audience, className }: Props) {
  const net = netReturn({ grossProfit: result.investorProfit, investedCapital: result.cost, termMonths: values.termMonths, kind: audience.kind, caep: audience.caep });
  const structure = investorKindLabel({ investorKind: audience.kind, caepTerm: audience.caep });
  const share = values.investorSharePercent;
  const steps: Step[] = [
    { label: "O que se fatura", detail: `Venda prevista de ${formatMoney(values.expectedSalePrice)} menos ${formatMoney(result.cost)} de custos`, value: formatMoney(result.margin) },
    { label: `Menos IRC da operação (${IRC_RATE}%)`, value: formatMoney(-result.irc || 0) },
    { label: `A sua parte (${formatPercent(share, 0)})`, detail: `Do lucro depois de IRC, ${formatMoney(result.marginAfterTax)}`, value: formatMoney(result.investorProfit) },
    { label: `Menos impostos da estrutura (${formatPercent(net.taxRate, 0)})`, detail: structure, value: formatMoney(-net.tax || 0) },
    { label: "Quanto vai receber", value: formatMoney(net.netProfit), strong: true },
    {
      label: "Cash-on-cash · ROI anualizado",
      detail: values.termMonths > 0 ? `Num prazo de ${values.termMonths} ${values.termMonths === 1 ? "mês" : "meses"}` : undefined,
      value: `${result.cost > 0 ? formatPercent(net.cashOnCash) : "—"} · ${result.cost > 0 && values.termMonths > 0 ? formatPercent(net.annualized) : "—"}`,
    },
  ];
  return (
    <section className="mt-[22px] break-inside-avoid">
      <h2 className={className}>O seu retorno{audience.investorName ? ` · ${audience.investorName}` : ""}</h2>
      {share <= 0 && <p className="mb-2 text-xs text-muted">A percentagem do investidor ativo ainda não foi definida na análise financeira.</p>}
      <ol className="m-0 list-none p-0 tabular-nums">
        {steps.map((step, index) => (
          <li key={step.label} className={`flex items-start justify-between gap-3 py-1.5 text-xs ${step.strong ? "border-y-2 border-ink" : "border-b border-line"}`}>
            <span className="flex gap-2">
              <span className="w-4 shrink-0 font-semibold text-brand">{index + 1}.</span>
              <span>
                <span className={step.strong ? "font-bold" : "text-muted"}>{step.label}</span>
                {step.detail && <small className="block text-[10px] text-muted">{step.detail}</small>}
              </span>
            </span>
            <span className={`shrink-0 text-right ${step.strong ? "text-[13px] font-bold" : "font-semibold"}`}>{step.value}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default ReportInvestorSteps;
