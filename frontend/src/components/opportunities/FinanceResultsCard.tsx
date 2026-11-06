import type { FinanceValues } from "../../api/opportunitiesApi";
import type { FinanceResult } from "../../lib/finance";
import { formatMoney, formatPercent } from "../../lib/format";
import Pill from "../ui/Pill";

interface Props {
  values: FinanceValues;
  result: FinanceResult;
}

const ROI_TARGET = 15;

function FinanceResultsCard({ values, result }: Props) {
  const breakdown = [
    { label: "Compra", value: values.purchasePrice },
    { label: "IMT, selo e escritura", value: values.imt + values.stampDuty + values.deedCosts },
    { label: "Obra", value: values.workCost },
    { label: "Comissão imobiliária (c/ IVA)", value: result.commission },
    { label: "Outros custos", value: result.other },
  ];
  return (
    <aside className="rounded-panel bg-results p-[22px] text-white tabular-nums">
      <h2 className="text-sm font-semibold">Análise de rentabilidade</h2>
      <small className="text-[11px] text-results-muted">Atualizada em tempo real</small>

      <div className="mt-5">
        <span className="mb-1 block text-[11px] text-results-muted">Investimento total</span>
        <strong className="text-lg">{formatMoney(result.cost)}</strong>
      </div>
      <ul className="m-0 mt-3 grid list-none gap-1.5 border-t border-results-line p-0 pt-2.5">
        {breakdown.map((item) => (
          <li key={item.label} className="flex justify-between gap-2.5 text-[11px] text-results-muted">
            <span>{item.label}</span>
            <b className="font-semibold text-white">{formatMoney(item.value)}</b>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-panel border border-results-line bg-results-raised p-[15px]">
        <span className="mb-1 block text-[11px] text-results-muted">Margem estimada</span>
        <strong className="block text-[26px] leading-tight text-results-accent">{formatMoney(result.margin)}</strong>
        <small className="text-[11px] text-results-muted">
          {values.expectedSalePrice > 0 ? formatPercent(result.marginOnSale) : "—"} sobre a venda
        </small>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-[15px]">
        <div>
          <span className="mb-1 block text-[11px] text-results-muted">ROI</span>
          <strong className="text-lg">{result.cost > 0 ? formatPercent(result.roi) : "—"}</strong>
        </div>
        <div>
          <span className="mb-1 block text-[11px] text-results-muted">ROI anualizado</span>
          <strong className="text-lg">{result.cost > 0 && values.termMonths > 0 ? formatPercent(result.annualRoi) : "—"}</strong>
        </div>
      </div>

      <div className="mt-5">
        <Pill tone={result.roi > ROI_TARGET ? "green" : "amber"}>{result.roi > ROI_TARGET ? "Rentabilidade acima do objetivo" : "Rever pressupostos"}</Pill>
      </div>
    </aside>
  );
}

export default FinanceResultsCard;
