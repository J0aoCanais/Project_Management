import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { OpportunityDetail } from "../../api/opportunitiesApi";
import { useFinanceDraft } from "../../hooks/useFinanceDraft";
import { useConvertOpportunity, useMoveOpportunityPhase, useSaveFinance } from "../../hooks/useOpportunities";
import { formatIsoDate } from "../../lib/format";
import { OPPORTUNITY_PHASES } from "../../lib/phases";
import Button from "../ui/Button";
import Notice from "../ui/Notice";
import PhaseStepper from "../ui/PhaseStepper";
import Tabs from "../ui/Tabs";
import FinanceAnalysis from "./FinanceAnalysis";
import OpportunityActivity from "./OpportunityActivity";
import OpportunityDocuments from "./OpportunityDocuments";
import OpportunityHeader from "./OpportunityHeader";
import OpportunityReport from "./OpportunityReport";
import OpportunitySummary from "./OpportunitySummary";
import PhaseHistoryTable from "./PhaseHistoryTable";
import RejectOpportunityDialog from "./RejectOpportunityDialog";
import UnsavedChangesDialog from "./UnsavedChangesDialog";

interface Props {
  detail: OpportunityDetail;
  backTo: string;
}

const tabs = [
  { value: "resumo", label: "Resumo" },
  { value: "analise-financeira", label: "Análise financeira" },
  { value: "historico-de-fases", label: "Histórico de fases" },
  { value: "documentos", label: "Documentos" },
] as const;

type TabValue = (typeof tabs)[number]["value"];

const phaseNames = OPPORTUNITY_PHASES.map((phase) => phase.name);

function OpportunityDetailContent({ detail, backTo }: Props) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = tabs.find((item) => item.value === params.get("tab"))?.value ?? "resumo";
  const [pendingTab, setPendingTab] = useState<TabValue | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const draft = useFinanceDraft(detail);
  const move = useMoveOpportunityPhase();
  const convert = useConvertOpportunity();
  const saveFinance = useSaveFinance();

  const goToTab = (value: TabValue) => setParams({ tab: value }, { replace: true });
  const requestTab = (value: TabValue) => {
    if (tab === "analise-financeira" && draft.dirty) setPendingTab(value);
    else goToTab(value);
  };

  const handleSave = () => {
    const sent = draft.current;
    saveFinance.mutate({ id: detail.id, finance: sent.values, extraCosts: sent.extras }, { onSuccess: () => draft.markSaved(sent) });
  };

  const handleConvert = () =>
    convert.mutate(detail.id, { onSuccess: ({ operationId }) => navigate(`/operacoes/${operationId}`) });

  return (
    <>
      <OpportunityHeader
        detail={detail}
        backTo={backTo}
        busy={move.isPending || convert.isPending}
        onReport={() => setReportOpen(true)}
        onReject={() => setRejecting(true)}
        onAdvance={() => move.mutate({ id: detail.id, phaseIndex: detail.phaseIndex + 1 })}
        onConvert={handleConvert}
      />
      <Button icon="file" className="mb-2.5 w-full min-[721px]:hidden" onClick={() => setReportOpen(true)}>
        Gerar relatório para investidores
      </Button>
      {detail.rejection && (
        <div className="mb-3">
          <Notice tone="warning">
            Marcada como rejeitada/perdida em {formatIsoDate(detail.rejection.date)}. Motivo: {detail.rejection.reason}
          </Notice>
        </div>
      )}
      {(move.isError || convert.isError) && (
        <div role="alert" className="mb-3">
          <Notice tone="warning">
            {move.isError ? "Não foi possível mudar a fase. A oportunidade voltou à fase anterior." : "Não foi possível converter em operação. Tente novamente."}
          </Notice>
        </div>
      )}
      <PhaseStepper steps={phaseNames} current={detail.phaseIndex} startAt={1} />
      <Tabs label="Secções da oportunidade" tabs={[...tabs]} value={tab} onChange={requestTab} />

      <div role="tabpanel">
        {tab === "resumo" && (
          <div className="grid items-start gap-3.5 min-[721px]:grid-cols-[1.3fr_.7fr]">
            <OpportunitySummary detail={detail} />
            <OpportunityActivity activity={detail.activity} />
          </div>
        )}
        {tab === "analise-financeira" && (
          <FinanceAnalysis
            values={draft.current.values}
            extras={draft.current.extras}
            onValuesChange={draft.setValues}
            onExtrasChange={draft.setExtras}
            dirty={draft.dirty}
            saving={saveFinance.isPending}
            saved={saveFinance.isSuccess}
            saveFailed={saveFinance.isError}
            onSave={handleSave}
          />
        )}
        {tab === "historico-de-fases" && <PhaseHistoryTable history={detail.phaseHistory} />}
        {tab === "documentos" && <OpportunityDocuments detail={detail} />}
      </div>

      {rejecting && <RejectOpportunityDialog opportunityId={detail.id} onClose={() => setRejecting(false)} />}
      {pendingTab && (
        <UnsavedChangesDialog
          onStay={() => setPendingTab(null)}
          onLeave={() => {
            draft.discard();
            goToTab(pendingTab);
            setPendingTab(null);
          }}
        />
      )}
      {reportOpen && <OpportunityReport detail={detail} values={draft.current.values} extras={draft.current.extras} onClose={() => setReportOpen(false)} />}
    </>
  );
}

export default OpportunityDetailContent;
