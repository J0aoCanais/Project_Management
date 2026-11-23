import { useDashboard } from "../hooks/useDashboard";
import PageHeading from "../components/ui/PageHeading";
import ButtonLink from "../components/ui/ButtonLink";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Panel from "../components/ui/Panel";
import DashboardStats from "../components/dashboard/DashboardStats";
import InvestorCapitalCard from "../components/dashboard/InvestorCapitalCard";
import OpportunityFunnelPanel from "../components/dashboard/OpportunityFunnelPanel";
import LeadsBySourcePanel from "../components/dashboard/LeadsBySourcePanel";
import OperationsByPhasePanel from "../components/dashboard/OperationsByPhasePanel";
import AlertsPanel from "../components/dashboard/AlertsPanel";

function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) {
    return <LoadingState message="A carregar painel…" />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Não foi possível carregar os dados do painel."
        onRetry={() => void refetch()}
      />
    );
  }

  const isEmpty =
    !data ||
    (data.stats.openOpportunities.value === 0 &&
      data.stats.activeOperations.value === 0 &&
      data.stats.yearSales.value === 0 &&
      data.stats.realizedMargin.value === 0 &&
      data.investorCapital.total === 0 &&
      data.funnel.length === 0 &&
      data.leadsBySource.length === 0 &&
      data.operationsByPhase.length === 0 &&
      data.alerts.length === 0);

  if (isEmpty) {
    return (
      <div>
        <PageHeading
          title="Painel"
          actions={
            <ButtonLink to="/oportunidades" variant="primary" icon="plus">
              Nova oportunidade
            </ButtonLink>
          }
        />
        <Panel>
          <EmptyState
            message="Ainda não existem dados no painel."
            action={
              <ButtonLink to="/oportunidades" variant="primary">
                Criar primeira oportunidade
              </ButtonLink>
            }
          />
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <PageHeading
        title="Painel"
        actions={
          <ButtonLink to="/oportunidades" variant="primary" icon="plus">
            Nova oportunidade
          </ButtonLink>
        }
      />

      <DashboardStats stats={data.stats} />

      <div className="mt-2.5">
        <InvestorCapitalCard capital={data.investorCapital} />
      </div>

      <div className="mt-2.5 grid gap-2.5 min-[1051px]:grid-cols-[1.15fr_0.85fr]">
        <OpportunityFunnelPanel funnel={data.funnel} />
        <LeadsBySourcePanel leadsBySource={data.leadsBySource} />
      </div>

      <div className="mt-2.5 grid gap-2.5 min-[1051px]:grid-cols-[1.25fr_0.75fr]">
        <OperationsByPhasePanel operationsByPhase={data.operationsByPhase} />
        <AlertsPanel alerts={data.alerts} />
      </div>
    </div>
  );
}

export default DashboardPage;
