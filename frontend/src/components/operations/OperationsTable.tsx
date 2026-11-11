import { useLocation, useNavigate } from "react-router-dom";

import type { OperationCard } from "../../api/operationsApi";
import { formatMoney } from "../../lib/format";
import { OPERATION_PHASES, type Phase } from "../../lib/phases";
import Table, { type TableColumn } from "../ui/Table";

interface Props {
  operations: OperationCard[];
  phases?: Phase[];
}

function OperationsTable({ operations, phases = OPERATION_PHASES }: Props) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const columns: TableColumn<OperationCard>[] = [
    { key: "code", header: "Código", render: (operation) => operation.code },
    { key: "property", header: "Imóvel / Zona", render: (operation) => `${operation.title} · ${operation.zone}` },
    { key: "purchase", header: "Preço de compra", align: "right", render: (operation) => formatMoney(operation.realPurchasePrice) },
    { key: "advertised", header: "Preço anunciado", align: "right", render: (operation) => formatMoney(operation.advertisedPrice) },
    { key: "final", header: "Preço final de venda", align: "right", render: (operation) => operation.finalSalePrice ? formatMoney(operation.finalSalePrice) : "—" },
    { key: "phase", header: "Fase", render: (operation) => phases[operation.phaseIndex]?.name ?? "—" },
    { key: "days", header: "Dias", render: (operation) => operation.daysInPhase },
  ];

  return (
    <Table
      columns={columns}
      rows={operations}
      getRowKey={(operation) => operation.id}
      onRowClick={(operation) => navigate(`/operacoes/${operation.id}`, { state: { listSearch: search } })}
    />
  );
}

export default OperationsTable;
