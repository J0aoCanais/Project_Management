import type { Lead } from "../../api/leadsApi";
import { formatDate } from "../../lib/format";
import Table, { type TableColumn } from "../ui/Table";
import LeadStatusPill from "./LeadStatusPill";

interface Props {
  leads: Lead[];
  onRowClick: (lead: Lead) => void;
}

function LeadsTable({ leads, onRowClick }: Props) {
  const columns: TableColumn<Lead>[] = [
    { key: "name", header: "Nome", render: (lead) => lead.contactName },
    { key: "referredBy", header: "Referenciado por", render: (lead) => lead.referredBy },
    { key: "zone", header: "Zona", render: (lead) => lead.zone },
    { key: "phone", header: "Telemóvel", render: (lead) => lead.phone },
    { key: "source", header: "Origem", render: (lead) => lead.source },
    { key: "status", header: "Estado", render: (lead) => <LeadStatusPill status={lead.status} /> },
    { key: "date", header: "Data", render: (lead) => formatDate(new Date(lead.createdAt)) },
  ];
  return <Table columns={columns} rows={leads} getRowKey={(lead) => lead.id} onRowClick={onRowClick} />;
}

export default LeadsTable;
