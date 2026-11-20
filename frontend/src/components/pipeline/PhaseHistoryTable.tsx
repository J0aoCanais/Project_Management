import { formatIsoDate } from "../../lib/format";
import Button from "../ui/Button";
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
  /** Com esta função, cada linha tem o botão "Adicionar nota" / "Editar nota". `index` 0 = a mudança mais recente. */
  onEditNote?: (index: number) => void;
}

type Row = PhaseHistoryEntry & { index: number };

const baseColumns: TableColumn<Row>[] = [
  { key: "from", header: "Fase anterior", render: (entry) => entry.from },
  { key: "to", header: "Nova fase", render: (entry) => entry.to },
  { key: "date", header: "Data", render: (entry) => formatIsoDate(entry.date) },
  { key: "note", header: "Nota", render: (entry) => <span className="wrap-anywhere whitespace-pre-line">{entry.note || "—"}</span> },
];

function PhaseHistoryTable({ history, onEditNote }: Props) {
  const rows = history.map((entry, index) => ({ ...entry, index }));
  const columns: TableColumn<Row>[] = onEditNote
    ? [
        ...baseColumns,
        {
          key: "actions",
          header: "",
          align: "right",
          render: (entry) => (
            <Button variant="text" icon={entry.note ? undefined : "plus"} onClick={() => onEditNote(entry.index)}>
              {entry.note ? "Editar nota" : "Adicionar nota"}
            </Button>
          ),
        },
      ]
    : baseColumns;

  return (
    <Panel className="overflow-hidden">
      {rows.length ? <Table columns={columns} rows={rows} getRowKey={(entry) => entry.index} /> : <EmptyState message="Ainda não houve mudanças de fase." />}
    </Panel>
  );
}

export default PhaseHistoryTable;
