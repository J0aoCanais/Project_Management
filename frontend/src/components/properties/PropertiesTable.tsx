import { useLocation, useNavigate } from "react-router-dom";

import type { PropertySummary } from "../../api/propertiesApi";
import { formatIsoDate, formatMoney } from "../../lib/format";
import Table, { type TableColumn } from "../ui/Table";

interface Props {
  properties: PropertySummary[];
}

const columns: TableColumn<PropertySummary>[] = [
  {
    key: "address",
    header: "Morada / Zona",
    render: (property) => (
      <span className="block max-w-[320px] wrap-anywhere whitespace-normal">
        {property.address} · {property.zone}
      </span>
    ),
  },
  { key: "typology", header: "Tipologia", render: (property) => `${property.typology} · ${property.propertyType}` },
  { key: "area", header: "Área (m²)", align: "right", render: (property) => property.areaM2.toLocaleString("pt-PT") },
  { key: "asking", header: "Preço pedido", align: "right", render: (property) => formatMoney(property.askingPrice) },
  { key: "vvr", header: "VVR", align: "right", render: (property) => formatMoney(property.vvr) },
  { key: "visit", header: "Visita", render: (property) => (property.visitDate ? formatIsoDate(property.visitDate) : "—") },
  {
    key: "profit",
    header: "Lucro estimado",
    align: "right",
    render: (property) => <span className={property.estimatedProfit < 0 ? "text-danger" : ""}>{formatMoney(property.estimatedProfit)}</span>,
  },
];

function PropertiesTable({ properties }: Props) {
  const navigate = useNavigate();
  const { search } = useLocation();
  return (
    <Table
      columns={columns}
      rows={properties}
      getRowKey={(property) => property.id}
      onRowClick={(property) => navigate(`/imoveis/${property.id}`, { state: { listSearch: search } })}
    />
  );
}

export default PropertiesTable;
