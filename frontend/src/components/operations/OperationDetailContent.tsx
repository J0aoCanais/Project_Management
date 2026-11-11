import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import type { OperationDetail } from "../../api/operationsApi";
import { useMoveOperationPhase, useUploadOperationDocuments } from "../../hooks/useOperations";
import { formatActivityDate, formatIsoDate, formatMoney } from "../../lib/format";
import { OPERATION_PHASES } from "../../lib/phases";
import Button from "../ui/Button";
import EntityHeader from "../ui/EntityHeader";
import Notice from "../ui/Notice";
import Panel from "../ui/Panel";
import PhaseStepper from "../ui/PhaseStepper";
import Pill from "../ui/Pill";
import RecordFields from "../ui/RecordFields";
import Table, { type TableColumn } from "../ui/Table";
import Tabs from "../ui/Tabs";
import Timeline from "../ui/Timeline";
import CancelOperationDialog from "./CancelOperationDialog";
import OperationActions from "./OperationActions";
import OperationSummary from "./OperationSummary";
import PhaseHistoryTable from "../pipeline/PhaseHistoryTable";
import DocumentsPanel from "../pipeline/DocumentsPanel";

interface Props {
  operation: OperationDetail;
  backTo: string;
}

const tabs = [
  { value: "resumo", label: "Resumo" },
  { value: "obras", label: "Obras" },
  { value: "investimentos", label: "Investimentos" },
  { value: "historico-de-fases", label: "Histórico de fases" },
  { value: "documentos", label: "Documentos" },
] as const;

type TabValue = (typeof tabs)[number]["value"];

function OperationDetailContent({ operation, backTo }: Props) {
  const [params, setParams] = useSearchParams();
  const tab = tabs.find((item) => item.value === params.get("tab"))?.value ?? "resumo";
  const [cancelling, setCancelling] = useState(false);
  const move = useMoveOperationPhase();
  const upload = useUploadOperationDocuments();
  const phase = OPERATION_PHASES[operation.phaseIndex];

  const workColumns: TableColumn<OperationDetail["constructionWorks"][number]>[] = [
    { key: "code", header: "Obra", render: (work) => <Link className="text-brand hover:underline" to={`/obras/${work.id}`}>{work.code}</Link> },
    { key: "name", header: "Descrição", render: (work) => work.name },
    { key: "status", header: "Estado", render: (work) => work.status },
    { key: "start", header: "Início", render: (work) => work.startDate ? formatIsoDate(work.startDate) : "—" },
    { key: "end", header: "Fim previsto", render: (work) => work.endDate ? formatIsoDate(work.endDate) : "—" },
    { key: "budget", header: "Orçamento", align: "right", render: (work) => formatMoney(work.budget) },
    { key: "spent", header: "Executado", align: "right", render: (work) => formatMoney(work.spent) },
  ];
  const investmentColumns: TableColumn<OperationDetail["investments"][number]>[] = [
    { key: "investor", header: "Investidor", render: (investment) => <Link className="text-brand hover:underline" to={`/investidores/${investment.investorId}`}>{investment.investor}</Link> },
    { key: "amount", header: "Valor", align: "right", render: (investment) => formatMoney(investment.amount) },
    { key: "share", header: "Participação", align: "right", render: (investment) => `${investment.sharePercent.toFixed(1).replace(".", ",")}%` },
    { key: "return", header: "Tipo de retorno", render: (investment) => investment.returnType },
    { key: "rate", header: "Taxa", align: "right", render: (investment) => `${investment.rate.toFixed(1).replace(".", ",")}%` },
  ];

  return (
    <>
      <EntityHeader
        title={operation.title}
        type={`Operação · ${operation.code}`}
        backTo={backTo}
        meta={<div className="mt-1 flex flex-wrap items-center gap-2"><Pill>{phase?.name ?? "Fase desconhecida"}</Pill><span className="text-[11px] text-muted">Responsável: {operation.owner.name}</span></div>}
        actions={
          <OperationActions
            closed={operation.phaseIndex === OPERATION_PHASES.length - 1}
            busy={move.isPending}
            cancelled={!!operation.cancellation}
            onAdvance={() => move.mutate({ id: operation.id, phaseIndex: operation.phaseIndex + 1 })}
            onCancel={() => setCancelling(true)}
          />
        }
      />
      {operation.cancellation && (
        <div className="mb-3">
          <Notice tone="warning">Cancelada em {formatIsoDate(operation.cancellation.date)}. Motivo: {operation.cancellation.reason}</Notice>
        </div>
      )}
      {(move.isError || upload.isError) && (
        <div role="alert" className="mb-3">
          <Notice tone="warning">{move.isError ? "Não foi possível mudar a fase. Tente novamente." : "Não foi possível carregar os documentos. Tente novamente."}</Notice>
        </div>
      )}
      <PhaseStepper steps={OPERATION_PHASES.map((item) => item.name)} current={operation.phaseIndex} startAt={9} />
      <Tabs label="Secções da operação" tabs={[...tabs]} value={tab} onChange={(value: TabValue) => setParams({ tab: value }, { replace: true })} />
      <div role="tabpanel">
        {tab === "resumo" && (
          <div className="grid items-start gap-3.5 min-[721px]:grid-cols-[1.3fr_.7fr]">
            <OperationSummary operation={operation} />
            <Panel>
              <h2 className="border-b border-line px-3 py-2.5 text-xs font-bold">Atividade recente</h2>
              {operation.activity.length ? (
                <Timeline events={operation.activity.map((event, index) => ({ id: index, date: formatActivityDate(event.date), text: event.text }))} />
              ) : (
                <p className="px-3 py-3 text-xs text-muted">Ainda não há atividade registada.</p>
              )}
            </Panel>
          </div>
        )}
        {tab === "obras" && (
          <Panel className="overflow-hidden">
            {operation.constructionWorks.length ? (
              <Table columns={workColumns} rows={operation.constructionWorks} getRowKey={(work) => work.id} />
            ) : (
              <p className="p-3 text-xs text-muted">Ainda não há obras associadas a esta operação.</p>
            )}
          </Panel>
        )}
        {tab === "investimentos" && (
          <RecordFields
            title="Investimentos"
            fields={[
              { label: "Total investido", value: formatMoney(operation.investments.reduce((total, item) => total + item.amount, 0)) },
              { label: "Número de investidores", value: operation.investments.length },
            ]}
          >
            {operation.investments.length ? (
              <Table columns={investmentColumns} rows={operation.investments} getRowKey={(investment) => investment.investorId} />
            ) : (
              <p className="p-3 text-xs text-muted">Ainda não há investimentos associados a esta operação.</p>
            )}
          </RecordFields>
        )}
        {tab === "historico-de-fases" && <PhaseHistoryTable history={operation.phaseHistory} />}
        {tab === "documentos" && (
          <DocumentsPanel
            documents={operation.documents}
            propertyCode={operation.propertyCode}
            entityLabel={operation.code}
            uploading={upload.isPending}
            uploadFailed={upload.isError}
            onUpload={(files, type) => upload.mutate({ id: operation.id, files, type })}
          />
        )}
      </div>
      {cancelling && <CancelOperationDialog operationId={operation.id} onClose={() => setCancelling(false)} />}
    </>
  );
}

export default OperationDetailContent;
