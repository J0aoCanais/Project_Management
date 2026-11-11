import { formatIsoDate } from "../../lib/format";
import EmptyState from "../ui/EmptyState";
import Panel from "../ui/Panel";
import Table, { type TableColumn } from "../ui/Table";

export interface PhaseHistoryEntry {
  from: string;
  to: string;
  date: string;
  note?: string;
}

interface Props {
  history: PhaseHistoryEntry[];
}

const columns: TableColumn<PhaseHistoryEntry>[] = [
  { key: "from", header: "Fase anterior", render: (entry) => entry.from },
  { key: "to", header: "Nova fase", render: (entry) => entry.to },
  { key: "date", header: "Data", render: (entry) => formatIsoDate(entry.date) },
  { key: "note", header: "Nota", render: (entry) => entry.note ?? "—" },
];

function PhaseHistoryTable({ history }: Props) {
  return (
    <Panel className="overflow-hidden">
      {history.length ? (
        <Table columns={columns} rows={history} getRowKey={(_entry, index) => index} />
      ) : (
        <EmptyState message="Ainda não houve mudanças de fase." />
      )}
    </Panel>
  );
}

export default PhaseHistoryTable;
