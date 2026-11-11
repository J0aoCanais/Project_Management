import { useSearchParams } from "react-router-dom";

import AccountPanel from "../components/settings/AccountPanel";
import LeadSourcesPanel from "../components/settings/LeadSourcesPanel";
import MovementCategoriesPanel from "../components/settings/MovementCategoriesPanel";
import PhasesPanel from "../components/settings/PhasesPanel";
import UsersPanel from "../components/settings/UsersPanel";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import PageHeading from "../components/ui/PageHeading";
import Tabs from "../components/ui/Tabs";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { administratorRole } from "../temp";

const adminOnlyTabs = ["utilizadores", "fases", "categorias-de-movimento"];
type TabValue = "conta" | "utilizadores" | "origens-de-lead" | "fases" | "categorias-de-movimento";

function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const { data: user, isPending, isError, refetch } = useCurrentUser();

  if (isPending) return <LoadingState />;
  if (isError || !user) return <ErrorState onRetry={() => refetch()} />;

  const isAdmin = user.role === administratorRole;
  const tabs: { value: TabValue; label: string }[] = [
    { value: "conta", label: "Conta" },
    ...(isAdmin ? [{ value: "utilizadores" as const, label: "Utilizadores" }] : []),
    { value: "origens-de-lead", label: "Origens de lead" },
    ...(isAdmin
      ? [
          { value: "fases" as const, label: "Fases" },
          { value: "categorias-de-movimento" as const, label: "Categorias de movimento" },
        ]
      : []),
  ];
  const requested = params.get("tab") ?? "conta";
  const denied = !isAdmin && adminOnlyTabs.includes(requested);
  const activeTab = tabs.find((tab) => tab.value === requested)?.value ?? "conta";

  const setTab = (value: TabValue) => setParams({ tab: value }, { replace: true });

  return (
    <>
      <PageHeading title="Definições" />
      <Tabs label="Secções das definições" tabs={tabs} value={activeTab} onChange={setTab} />
      {denied ? (
        <EmptyState
          message="Não tem permissões para aceder a esta secção."
          action={<Button onClick={() => setTab("conta")}>Voltar à conta</Button>}
        />
      ) : (
        <>
          {activeTab === "conta" && <AccountPanel />}
          {activeTab === "utilizadores" && isAdmin && <UsersPanel />}
          {activeTab === "origens-de-lead" && <LeadSourcesPanel />}
          {activeTab === "fases" && isAdmin && <PhasesPanel />}
          {activeTab === "categorias-de-movimento" && isAdmin && <MovementCategoriesPanel />}
        </>
      )}
    </>
  );
}

export default SettingsPage;
