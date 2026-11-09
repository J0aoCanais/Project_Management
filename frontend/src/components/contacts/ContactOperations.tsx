import type { ContactOperation } from "../../api/contactsApi";
import Panel from "../ui/Panel";
import Table, { type TableColumn } from "../ui/Table";

interface Props {
  operations: ContactOperation[];
}

const columns: TableColumn<ContactOperation>[] = [
  { key: "code", header: "Operação", render: (operation) => operation.code },
  { key: "role", header: "Papel", render: (operation) => operation.role },
  { key: "phase", header: "Fase", render: (operation) => operation.phase },
];

function ContactOperations({ operations }: Props) {
  return (
    <Panel>
      <h2 className="border-b border-line px-3 py-2.5 text-xs font-bold">Operações em que participa</h2>
      {operations.length ? (
        <Table columns={columns} rows={operations} getRowKey={(operation) => `${operation.code}-${operation.role}`} />
      ) : (
        <p className="px-3 py-6 text-center text-xs text-muted">Ainda não participa em nenhuma operação.</p>
      )}
    </Panel>
  );
}

export default ContactOperations;
