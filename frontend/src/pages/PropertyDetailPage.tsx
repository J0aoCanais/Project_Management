import { useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";

import { ApiError } from "../api/client";
import DocumentsPanel from "../components/documents/DocumentsPanel";
import PropertyFields from "../components/properties/PropertyFields";
import PropertyHeader from "../components/properties/PropertyHeader";
import PropertyRelated from "../components/properties/PropertyRelated";
import ButtonLink from "../components/ui/ButtonLink";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import Tabs from "../components/ui/Tabs";
import { useProperty } from "../hooks/useProperties";

const tabs = [
  { value: "dados", label: "Dados" },
  { value: "ligacoes", label: "Oportunidades e operações" },
  { value: "documentos", label: "Documentos" },
] as const;

type TabValue = (typeof tabs)[number]["value"];

function PropertyDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const { data, isPending, error, refetch } = useProperty(Number(id));
  // Lido uma vez: mudar de separador substitui a entrada no histórico e perde o estado da navegação.
  const [backTo] = useState(() => `/imoveis${(location.state as { listSearch?: string } | null)?.listSearch ?? ""}`);
  const tab: TabValue = tabs.find((item) => item.value === params.get("tab"))?.value ?? "dados";

  if (isPending) return <LoadingState />;
  if (error instanceof ApiError && error.status === 404) {
    return <EmptyState message="Este imóvel não existe." action={<ButtonLink to="/imoveis">Voltar a imóveis</ButtonLink>} />;
  }
  if (!data) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <>
      <PropertyHeader property={data} backTo={backTo} />
      <Tabs label="Secções do imóvel" tabs={[...tabs]} value={tab} onChange={(value) => setParams({ tab: value }, { replace: true })} />
      <div role="tabpanel">
        {tab === "dados" && <PropertyFields property={data} />}
        {tab === "ligacoes" && <PropertyRelated records={data.related} />}
        {tab === "documentos" && <DocumentsPanel owner={{ kind: "property", id: data.id }} title="Documentos do imóvel" />}
      </div>
    </>
  );
}

export default PropertyDetailPage;
