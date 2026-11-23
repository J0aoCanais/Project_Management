import { useState } from "react";

import type { LeadContactEntry } from "../../api/leadsApi";
import { formatDate } from "../../lib/format";
import Button from "../ui/Button";
import Panel from "../ui/Panel";
import Table, { type TableColumn } from "../ui/Table";
import RegisterContactDialog from "./RegisterContactDialog";

interface Props {
  leadId: number;
  entries: LeadContactEntry[];
}

const columns: TableColumn<LeadContactEntry>[] = [
  { key: "date", header: "Data", render: (entry) => formatDate(new Date(entry.date)) },
  { key: "channel", header: "Canal", render: (entry) => entry.channel },
  { key: "owner", header: "Responsável", render: (entry) => entry.owner },
  { key: "result", header: "Resultado", render: (entry) => entry.result },
  { key: "note", header: "Nota", render: (entry) => entry.note },
];

function LeadContactHistory({ leadId, entries }: Props) {
  const [registering, setRegistering] = useState(false);

  return (
    <>
      <Panel>
        <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
          <h2 className="text-xs font-bold">Histórico de contactos</h2>
          <Button icon="plus" onClick={() => setRegistering(true)}>
            Registar contacto
          </Button>
        </div>
        {entries.length ? (
          <Table columns={columns} rows={entries} getRowKey={(entry) => entry.id} />
        ) : (
          <p className="px-3 py-6 text-center text-xs text-muted">Ainda não existem contactos registados.</p>
        )}
      </Panel>
      {registering && <RegisterContactDialog leadId={leadId} onClose={() => setRegistering(false)} />}
    </>
  );
}

export default LeadContactHistory;
