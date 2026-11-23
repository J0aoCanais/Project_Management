import type { FinanceValues } from "../../api/opportunitiesApi";
import type { FinanceResult } from "../../lib/finance";
import { formatMoney, formatPercent } from "../../lib/format";

interface Props {
  values: FinanceValues;
  result: FinanceResult;
}

function ReportKpis({ values, result }: Props) {
  const kpis = [
    { label: "Investimento total", value: formatMoney(result.cost) },
    { label: "Venda prevista", value: formatMoney(values.expectedSalePrice) },
    { label: "Margem estimada", value: formatMoney(result.margin) },
    { label: "ROI", value: result.cost > 0 ? formatPercent(result.roi) : "—" },
    { label: "ROI anualizado", value: result.cost > 0 && values.termMonths > 0 ? formatPercent(result.annualRoi) : "—" },
    { label: "Prazo", value: `${values.termMonths} ${values.termMonths === 1 ? "mês" : "meses"}` },
  ];
  return (
    <section className="grid grid-cols-2 border-t border-l border-line min-[721px]:grid-cols-3 print:grid-cols-3">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="border-r border-b border-line px-3.5 py-3">
          <span className="block text-[10px] text-muted">{kpi.label}</span>
          <strong className="text-[19px] tracking-[-0.3px] tabular-nums">{kpi.value}</strong>
        </div>
      ))}
    </section>
  );
}

export default ReportKpis;
