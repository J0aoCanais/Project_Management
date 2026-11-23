import type { Movement } from "../../api/financeApi";
import { movementTotals } from "../../lib/financeRules";
import { formatMoney } from "../../lib/format";
import Panel from "../ui/Panel";
import StatCard from "../ui/StatCard";

interface Props {
  /** Movimentos já filtrados: os totais seguem os filtros. */
  movements: Movement[];
}

const borderClasses = [
  "border-r border-b border-line min-[1051px]:border-b-0",
  "border-b border-line min-[1051px]:border-r min-[1051px]:border-b-0",
  "border-r border-line",
  "",
];

function FinanceStats({ movements }: Props) {
  const totals = movementTotals(movements);
  const cards = [
    { label: "Total de entradas", value: formatMoney(totals.inflow), meta: "Realizadas" },
    { label: "Total de saídas", value: formatMoney(totals.outflow), meta: "Realizadas" },
    { label: "Saldo", value: formatMoney(totals.balance), meta: "Entradas − saídas", negative: totals.balance < 0 },
    {
      label: "Previsto por realizar",
      value: formatMoney(totals.pending),
      meta: `${totals.pendingCount} ${totals.pendingCount === 1 ? "movimento" : "movimentos"} por realizar`,
      negative: totals.pending < 0,
    },
  ];
  return (
    <Panel className="mb-3.5">
      <div className="grid grid-cols-2 min-[1051px]:grid-cols-4">
        {cards.map((card, index) => (
          <div key={card.label} className={borderClasses[index]}>
            <StatCard label={card.label} value={card.value} meta={card.meta} negative={card.negative} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default FinanceStats;
