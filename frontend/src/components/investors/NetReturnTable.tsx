import { formatMoney, formatPercent } from "../../lib/format";
import type { NetReturn } from "../../lib/taxRules";

interface Props {
  /** Lucro antes do imposto sobre o lucro ("lucro estimado com impostos" na folha do cliente). */
  grossProfit: number;
  result: NetReturn;
  /** Ex.: "Empresa · CAEP menos de 1 ano". */
  structure: string;
  /** Sem prazo, o anualizado não faz sentido e aparece "—". */
  hasTerm: boolean;
}

/** Tabela do retorno líquido de um investidor (§1 da tarefa 09). Usada no investimento e no relatório. */
function NetReturnTable({ grossProfit, result, structure, hasTerm }: Props) {
  const rows = [
    { label: "Lucro estimado com impostos", value: formatMoney(grossProfit) },
    { label: `Imposto (${structure} · ${formatPercent(result.taxRate, 0)})`, value: formatMoney(-result.tax || 0) },
    { label: "Lucro líquido", value: formatMoney(result.netProfit), strong: true },
    { label: "Cash-on-cash", value: formatPercent(result.cashOnCash) },
    { label: "Anualizado", value: hasTerm ? formatPercent(result.annualized) : "—" },
  ];
  return (
    <dl className="m-0 tabular-nums">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-3 border-b border-line py-1.5 text-xs last:border-b-0">
          <dt className="text-muted">{row.label}</dt>
          <dd className={`m-0 shrink-0 text-right ${row.strong ? "font-bold text-ink" : "font-semibold"}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default NetReturnTable;
