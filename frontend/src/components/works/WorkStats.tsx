import type { WorkStatsSummary } from "../../api/worksApi";
import { formatMoney, formatPercent } from "../../lib/format";
import StatCard from "../ui/StatCard";

interface Props {
  stats: WorkStatsSummary;
}

function WorkStats({ stats }: Props) {
  return (
    <div className="mb-3 grid grid-cols-2 divide-x divide-line rounded-panel border border-line bg-white min-[721px]:grid-cols-4">
      <StatCard label="Obras em curso" value={String(stats.activeCount)} />
      <StatCard label="Orçamento total" value={formatMoney(stats.totalBudget)} />
      <StatCard label="Executado" value={formatPercent(stats.executedPercent)} />
      <StatCard label="Pago" value={formatMoney(stats.totalPaid)} />
    </div>
  );
}

export default WorkStats;
