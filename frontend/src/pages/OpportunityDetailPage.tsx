import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { ApiError } from "../api/client";
import OpportunityDetailContent from "../components/opportunities/OpportunityDetailContent";
import ButtonLink from "../components/ui/ButtonLink";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useOpportunity } from "../hooks/useOpportunities";

function OpportunityDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { data, isPending, error, refetch } = useOpportunity(Number(id));
  // Lido uma vez: mudar de separador substitui a entrada no histórico e perde o estado da navegação.
  const [backTo] = useState(() => `/oportunidades${(location.state as { listSearch?: string } | null)?.listSearch ?? ""}`);

  if (isPending) return <LoadingState />;
  if (error instanceof ApiError && error.status === 404) {
    return <EmptyState message="Esta oportunidade não existe." action={<ButtonLink to="/oportunidades">Voltar a oportunidades</ButtonLink>} />;
  }
  if (!data) return <ErrorState onRetry={() => refetch()} />;
  // A chave descarta alterações por guardar ao passar para outra oportunidade.
  return <OpportunityDetailContent key={data.id} detail={data} backTo={backTo} />;
}

export default OpportunityDetailPage;
