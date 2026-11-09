import { contactType, type Contact } from "../../api/contactsApi";
import Pill from "../ui/Pill";
import Table, { type TableColumn } from "../ui/Table";

interface Props {
  contacts: Contact[];
  onRowClick: (contact: Contact) => void;
}

const columns: TableColumn<Contact>[] = [
  { key: "name", header: "Nome", truncate: true, render: (contact) => contact.name },
  { key: "company", header: "Empresa", truncate: true, render: (contact) => contact.company || "—" },
  { key: "email", header: "Email", truncate: true, render: (contact) => contact.email || "—" },
  { key: "phone", header: "Telemóvel", render: (contact) => contact.phone || "—" },
  { key: "zone", header: "Zona", render: (contact) => contact.zone || "—" },
  { key: "type", header: "Tipo", render: (contact) => <Pill>{contactType(contact)}</Pill> },
];

function ContactsTable({ contacts, onRowClick }: Props) {
  return <Table columns={columns} rows={contacts} getRowKey={(contact) => contact.id} onRowClick={onRowClick} />;
}

export default ContactsTable;
