import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import InvestorFilters, { type InvestorFilterKey } from "../components/investors/InvestorFilters";
import InvestorStats from "../components/investors/InvestorStats";
import InvestorsTable from "../components/investors/InvestorsTable";
import NewInvestorDrawer from "../components/investors/NewInvestorDrawer";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import PageHeading from "../components/ui/PageHeading";
import Panel from "../components/ui/Panel";
import { useInvestors } from "../hooks/useInvestors";

function InvestorsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [creating, setCreating] = useState(false);
  const investorsQuery = useInvestors();
  const query = params.get("q") ?? "";
  const risk = params.get("risco") ?? "";
  const status = params.get("estado") ?? "";

  const updateFilter = (key: InvestorFilterKey, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return (investorsQuery.data ?? []).filter(
      (investor) =>
        (!text || [investor.name, investor.email, investor.phone, investor.company].some((value) => value.toLowerCase().includes(text))) &&
        (!risk || investor.profile.riskProfile === risk) &&
        (!status || investor.profile.relationStatus === status),
    );
  }, [investorsQuery.data, query, risk, status]);

  const search = params.toString() ? `?${params.toString()}` : "";

  const renderContent = () => {
    if (investorsQuery.isPending) return <LoadingState />;
    if (investorsQuery.isError) return <ErrorState onRetry={() => void investorsQuery.refetch()} />;
    if (!investorsQuery.data.length) return <EmptyState message="Ainda não há investidores. Crie o primeiro a partir de um contacto." />;
    if (!filtered.length) return <EmptyState message="Nenhum investidor corresponde aos filtros." action={<Button onClick={() => setParams({})}>Limpar filtros</Button>} />;
    return <InvestorsTable investors={filtered} onRowClick={(investor) => navigate(`/investidores/${investor.id}${search}`)} />;
  };

  return (
    <>
      <PageHeading
        title="Investidores"
        actions={
          <Button variant="primary" icon="plus" onClick={() => setCreating(true)}>
            Novo investidor
          </Button>
        }
      />
      {investorsQuery.data && investorsQuery.data.length > 0 && <InvestorStats investors={investorsQuery.data} />}
      <InvestorFilters query={query} risk={risk} status={status} onChange={updateFilter} />
      <Panel className="overflow-hidden">{renderContent()}</Panel>
      {creating && <NewInvestorDrawer onClose={() => setCreating(false)} />}
    </>
  );
}

export default InvestorsPage;
