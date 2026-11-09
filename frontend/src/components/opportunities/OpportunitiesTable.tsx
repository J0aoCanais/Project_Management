import { useLocation, useNavigate } from "react-router-dom";

import type { OpportunityCard } from "../../api/opportunitiesApi";
import { formatMoney } from "../../lib/format";
import { isStalled, OPPORTUNITY_PHASES } from "../../lib/phases";
import Table, { type TableColumn } from "../ui/Table";

interface Props {
  cards: OpportunityCard[];
}

const columns: TableColumn<OpportunityCard>[] = [
  { key: "property", header: "Imóvel / Zona", render: (card) => (
      <span className="block max-w-[320px] wrap-anywhere whitespace-normal">
        {card.title} · {card.zone}
      </span>
    ),
  },
  { key: "typology", header: "Tipologia", render: (card) => card.typology },
  { key: "asking", header: "Preço pedido", align: "right", render: (card) => formatMoney(card.askingPrice) },
  { key: "vvr", header: "VVR", align: "right", render: (card) => formatMoney(card.vvr) },
  { key: "profit", header: "Lucro estimado", align: "right", render: (card) => formatMoney(card.estimatedProfit) },
  { key: "phase", header: "Fase", render: (card) => OPPORTUNITY_PHASES[card.phaseIndex].name },
  {
    key: "days",
    header: "Dias",
    render: (card) => (
      <span className={isStalled(OPPORTUNITY_PHASES[card.phaseIndex], card.daysInPhase) ? "font-semibold text-danger" : ""}>{card.daysInPhase}</span>
    ),
  },
];

function OpportunitiesTable({ cards }: Props) {
  const navigate = useNavigate();
  const { search } = useLocation();
  return (
    <Table
      columns={columns}
      rows={cards}
      getRowKey={(card) => card.id}
      onRowClick={(card) => navigate(`/oportunidades/${card.id}`, { state: { listSearch: search } })}
    />
  );
}

export default OpportunitiesTable;
