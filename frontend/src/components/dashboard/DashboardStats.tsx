import Panel from "../ui/Panel";
import StatCard from "../ui/StatCard";
import { formatMoney } from "../../lib/format";
import type { DashboardSummary } from "../../api/dashboardApi";

interface Props {
  stats: DashboardSummary["stats"];
}

const borderClasses = [
  "border-r border-b border-line min-[1051px]:border-b-0",
  "border-b border-line min-[1051px]:border-r min-[1051px]:border-b-0",
  "border-r border-line min-[1051px]:border-r",
  "",
];

function DashboardStats({ stats }: Props) {
  const cards = [
    {
      label: "Oportunidades abertas",
      value: String(stats.openOpportunities.value),
      meta: stats.openOpportunities.meta,
      positive: true,
    },
    {
      label: "Operações ativas",
      value: String(stats.activeOperations.value),
      meta: stats.activeOperations.meta,
      positive: false,
    },
    {
      label: "Vendas do ano",
      value: formatMoney(stats.yearSales.value),
      meta: stats.yearSales.meta,
      positive: true,
    },
    {
      label: "Margem realizada",
      value: formatMoney(stats.realizedMargin.value),
      meta: stats.realizedMargin.meta,
      positive: true,
    },
  ];

  return (
    <Panel>
      <div className="grid grid-cols-2 min-[1051px]:grid-cols-4">
        {cards.map((card, index) => (
          <div key={card.label} className={borderClasses[index]}>
            <StatCard
              label={card.label}
              value={card.value}
              meta={card.meta}
              positive={card.positive}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default DashboardStats;
