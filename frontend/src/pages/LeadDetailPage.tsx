import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useConvertLead, useLead, useUpdateLeadStatus } from "../hooks/useLeads";
import EntityHeader from "../components/ui/EntityHeader";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import RecordFields from "../components/ui/RecordFields";
import LeadActions from "../components/leads/LeadActions";
import LeadContactHistory from "../components/leads/LeadContactHistory";
import LeadStatusPill from "../components/leads/LeadStatusPill";
import { formatDate } from "../lib/format";

function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadId = Number(id);
  const query = useLead(leadId);
  const updateStatus = useUpdateLeadStatus(leadId);
  const convert = useConvertLead(leadId);
  const backTo = `/leads${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <EmptyState message="Lead não encontrada" action={<a className="text-brand underline" href="/leads">Voltar para leads</a>} />;
  const lead = query.data;
  return <div>
    <EntityHeader title={lead.contactName} type="Lead" backTo={backTo} meta={<LeadStatusPill status={lead.status} />} actions={<LeadActions leadId={leadId} status={lead.status} busy={updateStatus.isPending || convert.isPending} onStatusChange={(status) => updateStatus.mutate({ status })} onConvert={() => convert.mutate(undefined, { onSuccess: ({ opportunityId }) => navigate(`/oportunidades/${opportunityId}`) })} />} />
    <div className="grid gap-3">
      <RecordFields fields={[
        { label: "Referenciado por", value: lead.referredBy || "—" },
        { label: "Zona", value: lead.zone },
        { label: "Telemóvel", value: lead.phone },
        { label: "Origem", value: lead.source },
        { label: "Data", value: formatDate(new Date(lead.createdAt)) },
        { label: "Estado", value: <LeadStatusPill status={lead.status} /> },
        { label: "Mensagem", value: lead.message || "—" },
        ...(lead.discardReason ? [{ label: "Motivo do descarte", value: lead.discardReason }] : []),
      ]} />
      <LeadContactHistory leadId={leadId} entries={lead.contacts} />
    </div>
  </div>;
}

export default LeadDetailPage;
