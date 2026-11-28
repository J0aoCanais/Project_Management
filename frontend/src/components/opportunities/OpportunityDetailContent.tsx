import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import type { OpportunityDetail } from "../../api/opportunitiesApi";
import { useFinanceDraft } from "../../hooks/useFinanceDraft";
import { useConvertOpportunity, useMoveOpportunityPhase, useSaveFinance } from "../../hooks/useOpportunities";
import { formatIsoDate } from "../../lib/format";
import { OPPORTUNITY_PHASES } from "../../lib/phases";
import DocumentsPanel from "../documents/DocumentsPanel";
import Button from "../ui/Button";
import Notice from "../ui/Notice";
import PhaseStepper from "../ui/PhaseStepper";
import Tabs from "../ui/Tabs";
import FinanceAnalysis from "./FinanceAnalysis";
import NewOpportunityDrawer from "./NewOpportunityDrawer";
import OpportunityActivity from "./OpportunityActivity";
import OpportunityHeader from "./OpportunityHeader";
import OpportunityPhaseHistory from "./OpportunityPhaseHistory";
import OpportunityReportFlow from "./OpportunityReportFlow";
import OpportunitySummary from "./OpportunitySummary";
import PhaseNoteDialog from "./PhaseNoteDialog";
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
  const [editing, setEditing] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  /** "Avançar fase" abre primeiro o Dialog da nota. */
  const [advancing, setAdvancing] = useState(false);

  const draft = useFinanceDraft(detail);
  const move = useMoveOpportunityPhase();
  const convert = useConvertOpportunity();
  const saveFinance = useSaveFinance();
  const closed = Boolean(detail.rejection || detail.operationId);

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
        onEdit={() => setEditing(true)}
        onReject={() => setRejecting(true)}
        onAdvance={() => setAdvancing(true)}
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
            <OpportunitySummary detail={detail} editable={!closed} />
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
        {tab === "historico-de-fases" && <OpportunityPhaseHistory detail={detail} editable={!closed} />}
        {tab === "documentos" && (
          <DocumentsPanel
            owner={{ kind: "opportunity", id: detail.id }}
            title="Documentos da oportunidade"
            notice={`Pode carregar documentos em qualquer fase, incluindo o due diligence (certidões, cadernetas, orçamentos de obra…). Ficam associados a esta oportunidade (imóvel ${detail.property.code}) e aparecem no menu Documentos.`}
          />
        )}
      </div>

      {editing && <NewOpportunityDrawer opportunity={detail} onClose={() => setEditing(false)} />}
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
      {advancing && detail.phaseIndex < phaseNames.length - 1 && (
        <PhaseNoteDialog
          title="Avançar fase"
          description={`${phaseNames[detail.phaseIndex]} → ${phaseNames[detail.phaseIndex + 1]}`}
          confirmLabel="Avançar fase"
          onClose={() => setAdvancing(false)}
          onConfirm={(note) => {
            move.mutate({ id: detail.id, phaseIndex: detail.phaseIndex + 1, note });
            setAdvancing(false);
          }}
        />
      )}
      {reportOpen && <OpportunityReportFlow detail={detail} values={draft.current.values} extras={draft.current.extras} onClose={() => setReportOpen(false)} />}
    </>
  );
}

export default OpportunityDetailContent;
