import { useNavigate } from "react-router-dom";

import type { PropertyRelatedRecord } from "../../api/propertiesApi";
import { entityPath } from "../../lib/links";
import EmptyState from "../ui/EmptyState";
import Panel from "../ui/Panel";
import Pill from "../ui/Pill";
import Table, { type TableColumn } from "../ui/Table";

interface Props {
  records: PropertyRelatedRecord[];
}

const kindLabels = { opportunity: "Oportunidade", operation: "Operação" };

const columns: TableColumn<PropertyRelatedRecord>[] = [
  { key: "name", header: "Registo", render: (record) => record.name },
  { key: "kind", header: "Tipo", render: (record) => kindLabels[record.kind] },
  {
    key: "phase",
    header: "Fase",
    render: (record) => <Pill tone={record.phase === "Rejeitada/perdida" ? "red" : record.kind === "operation" ? "green" : "neutral"}>{record.phase}</Pill>,
  },
];

/** Oportunidades e operações sobre o imóvel. */
function PropertyRelated({ records }: Props) {
  const navigate = useNavigate();
  return (
    <Panel className="overflow-hidden">
      {records.length ? (
        <Table columns={columns} rows={records} getRowKey={(record) => `${record.kind}-${record.id}`} onRowClick={(record) => navigate(entityPath(record))} />
      ) : (
        <EmptyState message="Este imóvel ainda não tem oportunidades nem operações. Use “Criar oportunidade” para começar a análise." />
      )}
    </Panel>
  );
}

export default PropertyRelated;
