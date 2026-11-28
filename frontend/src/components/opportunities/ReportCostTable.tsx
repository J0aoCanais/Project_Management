import type { ExtraCost, FinanceValues } from "../../api/opportunitiesApi";
import type { FinanceResult } from "../../lib/finance";
import { formatMoney, formatPercent } from "../../lib/format";
import { IRC_RATE } from "../../lib/taxRules";

interface Props {
  values: FinanceValues;
  extras: ExtraCost[];
  result: FinanceResult;
}

interface Row {
  label: string;
  value: number;
  /** Mostrado na lista mas fora da soma do investimento total. */
  outsideTotal?: boolean;
}

function ReportCostTable({ values, extras, result }: Props) {
  const commission = values.commissionPercent;
  const rows: Row[] = [
    { label: "Preço de compra", value: values.purchasePrice },
    { label: "IMT, selo e escritura", value: values.imt + values.stampDuty + values.deedCosts },
    { label: "Obra", value: values.workCost },
    { label: `Comissão imobiliária (${formatPercent(commission, Number.isInteger(commission) ? 0 : 2)} + IVA)`, value: result.commission },
    ...extras.filter((extra) => extra.value).map((extra) => ({ label: extra.label || "Outro custo", value: extra.value })),
    // O IRC vem logo a seguir aos outros custos, como na folha do cliente. É sobre o lucro, por isso não soma ao investimento.
    { label: `IRC (${IRC_RATE}% do lucro, fora do total)`, value: result.irc, outsideTotal: true },
  ];
  return (
    <dl className="m-0 mb-[18px] tabular-nums">
      {rows.map((row, index) => (
        <div key={index} className="flex justify-between gap-3 border-b border-line py-1.5 text-xs">
          <dt className={row.outsideTotal ? "text-muted italic" : "text-muted"}>{row.label}</dt>
          <dd className="m-0 text-right font-semibold">{formatMoney(row.value)}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-3 border-t-2 border-ink py-1.5 text-[13px]">
        <dt className="font-bold">Investimento total</dt>
        <dd className="m-0 text-right font-semibold">{formatMoney(result.cost)}</dd>
      </div>
    </dl>
  );
}

export default ReportCostTable;
