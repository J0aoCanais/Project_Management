import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useImportLeads, useLeadSources, useLeads } from "../hooks/useLeads";
import { leadImportSample } from "../temp";
import type { LeadStatus, NewLeadInput } from "../api/leadsApi";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import ImportExcel, { type ImportConfig } from "../components/ui/ImportExcel";
import LoadingState from "../components/ui/LoadingState";
import PageHeading from "../components/ui/PageHeading";
import Panel from "../components/ui/Panel";
import LeadFilters from "../components/leads/LeadFilters";
import LeadsTable from "../components/leads/LeadsTable";
import NewLeadDrawer from "../components/leads/NewLeadDrawer";

const importConfig: ImportConfig = {
  title: "Importar leads",
  templateName: "template_leads.csv",
  columns: ["Nome", "Referenciado por", "Zona", "Telemóvel", "Origem", "Estado", "Data"],
  sample: leadImportSample,
};

function parseDate(value: string) {
  const [day, month, year] = value.split("/");
  return day && month && year ? new Date(`${year}-${month}-${day}T12:00:00.000Z`).toISOString() : new Date().toISOString();
}

function rowToInput(row: string[]): NewLeadInput {
  return { contactName: row[0], referredBy: row[1], zone: row[2], phone: row[3], source: row[4], status: (row[5] || "Nova") as LeadStatus, createdAt: parseDate(row[6]) };
}

function LeadsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const leadsQuery = useLeads();
  const sourcesQuery = useLeadSources();
  const importMutation = useImportLeads();
  const query = params.get("q") ?? "";
  const status = params.get("estado") ?? "";
  const source = params.get("origem") ?? "";
  const zone = params.get("zona") ?? "";
  const updateFilter = (key: "q" | "estado" | "origem" | "zona", value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const filtered = useMemo(() => (leadsQuery.data ?? []).filter((lead) => {
    const text = query.toLowerCase();
    return (!text || [lead.contactName, lead.referredBy, lead.phone].some((value) => value.toLowerCase().includes(text))) &&
      (!status || lead.status === status) && (!source || lead.source === source) && (!zone || lead.zone === zone);
  }), [leadsQuery.data, query, status, source, zone]);
  const clearFilters = () => setParams({});
  const backTo = `/leads${params.toString() ? `?${params.toString()}` : ""}`;
  if (leadsQuery.isLoading) return <LoadingState />;
  if (leadsQuery.isError) return <ErrorState onRetry={() => void leadsQuery.refetch()} />;
  return <div>
    <PageHeading title="Leads" actions={<><Button onClick={() => setImportOpen(true)}>Importar de Excel</Button><Button variant="primary" icon="plus" onClick={() => setDrawerOpen(true)}>Nova lead</Button></>} />
    <LeadFilters query={query} status={status} source={source} zone={zone} sources={sourcesQuery.data ?? []} onChange={updateFilter} />
    <Panel className="overflow-hidden">{filtered.length ? <LeadsTable leads={filtered} onRowClick={(lead) => navigate(`/leads/${lead.id}${backTo.includes("?") ? `?${backTo.split("?")[1]}` : ""}`)} /> : <EmptyState message="Nenhuma lead corresponde aos filtros." action={<Button onClick={clearFilters}>Limpar filtros</Button>} />}</Panel>
    {drawerOpen && <NewLeadDrawer onClose={() => setDrawerOpen(false)} />}
    {importOpen && <ImportExcel config={importConfig} existingNames={(leadsQuery.data ?? []).map((lead) => lead.contactName)} onClose={() => setImportOpen(false)} onImport={(rows) => importMutation.mutate(rows.map(rowToInput))} />}
  </div>;
}

export default LeadsPage;
