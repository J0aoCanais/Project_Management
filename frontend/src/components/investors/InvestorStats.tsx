import type { Investor } from "../../api/investorsApi";
import { formatMoney } from "../../lib/format";
import Panel from "../ui/Panel";
import StatCard from "../ui/StatCard";

interface Props {
  investors: Investor[];
}

const borderClasses = ["border-b border-line min-[721px]:border-r min-[721px]:border-b-0", "border-b border-line min-[721px]:border-r min-[721px]:border-b-0", ""];

/** Totais calculados sobre a lista completa (não sobre os filtros). */
function InvestorStats({ investors }: Props) {
  const available = investors.reduce((total, investor) => total + investor.profile.availableCapital, 0);
  const committed = investors.reduce((total, investor) => total + investor.committedCapital, 0);
  const active = investors.filter((investor) => investor.profile.relationStatus === "Ativo").length;
  const cards = [
    { label: "Capital disponível", value: formatMoney(available), meta: `${investors.length} investidores` },
    { label: "Capital comprometido", value: formatMoney(committed), meta: "Soma dos investimentos" },
    { label: "Investidores ativos", value: String(active), meta: `de ${investors.length}` },
  ];

  return (
    <Panel className="mb-3">
      <div className="grid min-[721px]:grid-cols-3">
        {cards.map((card, index) => (
          <div key={card.label} className={borderClasses[index]}>
            <StatCard label={card.label} value={card.value} meta={card.meta} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default InvestorStats;
