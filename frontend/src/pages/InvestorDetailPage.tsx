import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { ApiError } from "../api/client";
import DocumentsTable from "../components/documents/DocumentsTable";
import InvestmentsTable from "../components/investors/InvestmentsTable";
import InvestorStatusPill from "../components/investors/InvestorStatusPill";
import NewInvestorDrawer from "../components/investors/NewInvestorDrawer";
import Button from "../components/ui/Button";
import ButtonLink from "../components/ui/ButtonLink";
import EmptyState from "../components/ui/EmptyState";
import EntityHeader from "../components/ui/EntityHeader";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import Panel from "../components/ui/Panel";
import RecordFields from "../components/ui/RecordFields";
import Tabs from "../components/ui/Tabs";
import { useInvestor } from "../hooks/useInvestors";
import { formatMoney } from "../lib/format";

const tabs = [
  { value: "perfil", label: "Perfil" },
  { value: "investimentos", label: "Investimentos" },
  { value: "documentos", label: "Documentos" },
] as const;

type TabValue = (typeof tabs)[number]["value"];

function InvestorDetailPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const investorId = Number(id);
  const query = useInvestor(investorId);
  const [editing, setEditing] = useState(false);
  // Lido uma vez: mudar de separador troca a query string e perderia os filtros da lista.
  const [backTo] = useState(() => {
    const listParams = new URLSearchParams(params);
    listParams.delete("tab");
    return `/investidores${listParams.toString() ? `?${listParams.toString()}` : ""}`;
  });
  const tab = tabs.find((item) => item.value === params.get("tab"))?.value ?? "perfil";
  const goToTab = (value: TabValue) => setParams({ tab: value }, { replace: true });

  if (!Number.isFinite(investorId) || (query.error instanceof ApiError && query.error.status === 404)) {
    return <EmptyState message="Este investidor não existe." action={<ButtonLink to="/investidores">Voltar a investidores</ButtonLink>} />;
  }
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  const investor = query.data;
  const { profile } = investor;

  return (
    <>
      <EntityHeader
        title={investor.name}
        type="Investidor"
        backTo={backTo}
        meta={<InvestorStatusPill status={profile.relationStatus} />}
        actions={
          <>
            <ButtonLink to={`/contactos/${investor.id}`} icon="contact">
              Ver contacto
            </ButtonLink>
            <Button variant="primary" onClick={() => setEditing(true)}>
              Editar perfil
            </Button>
          </>
        }
      />
      <Tabs label="Secções do investidor" tabs={[...tabs]} value={tab} onChange={goToTab} />
      {tab === "perfil" && (
        <div className="grid gap-3 min-[1051px]:grid-cols-[2fr_1fr]">
          <RecordFields
            title="Perfil de investidor"
            fields={[
              { label: "Capital disponível", value: formatMoney(profile.availableCapital) },
              { label: "Capital comprometido", value: formatMoney(investor.committedCapital) },
              { label: "Perfil de risco", value: profile.riskProfile },
              { label: "Montantes", value: `${formatMoney(profile.minAmount)} – ${formatMoney(profile.maxAmount)}` },
              { label: "Zonas preferidas", value: profile.preferredZones.join(" · ") || "—" },
              { label: "Estado da relação", value: <InvestorStatusPill status={profile.relationStatus} /> },
              { label: "Prazos preferidos", value: profile.preferredTerms || "—", wide: true },
            ]}
          />
          <RecordFields
            title="Contacto"
            fields={[
              { label: "Email", value: investor.email || "—", wide: true },
              { label: "Telemóvel", value: investor.phone || "—" },
              { label: "Empresa", value: investor.company || "—" },
              { label: "Zona", value: investor.zone || "—" },
            ]}
          />
        </div>
      )}
      {tab === "investimentos" && <InvestmentsTable investorId={investor.id} investorName={investor.name} investments={investor.investments} />}
      {tab === "documentos" && (
        <Panel className="overflow-hidden">
          {investor.documents.length ? <DocumentsTable documents={investor.documents} /> : <EmptyState message="Ainda não há documentos ligados aos investimentos." />}
        </Panel>
      )}
      {editing && <NewInvestorDrawer investor={investor} onClose={() => setEditing(false)} />}
    </>
  );
}

export default InvestorDetailPage;
