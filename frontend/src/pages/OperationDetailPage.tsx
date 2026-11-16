import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { ApiError } from "../api/client";
import OperationDetailContent from "../components/operations/OperationDetailContent";
import ButtonLink from "../components/ui/ButtonLink";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { useOperation } from "../hooks/useOperations";

function OperationDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { data, isPending, error, refetch } = useOperation(Number(id));
  const [backTo] = useState(() => `/operacoes${(location.state as { listSearch?: string } | null)?.listSearch ?? ""}`);

  if (isPending) return <LoadingState />;
  if (error instanceof ApiError && error.status === 404) {
    return <EmptyState message="Esta operação não existe." action={<ButtonLink to="/operacoes">Voltar a operações</ButtonLink>} />;
  }
  if (!data) return <ErrorState onRetry={() => refetch()} />;
  return <OperationDetailContent key={data.id} operation={data} backTo={backTo} />;
}

export default OperationDetailPage;
