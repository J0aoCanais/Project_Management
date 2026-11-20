import type { OpportunityDetail } from "../../api/opportunitiesApi";
import { entityPath } from "../../lib/links";
import { LAST_OPPORTUNITY_PHASE } from "../../lib/phases";
import Button from "../ui/Button";
import ButtonLink from "../ui/ButtonLink";

interface Props {
  detail: OpportunityDetail;
  busy: boolean;
  onReport: () => void;
  onEdit: () => void;
  onReject: () => void;
  onAdvance: () => void;
  onConvert: () => void;
}

function OpportunityActions({ detail, busy, onReport, onEdit, onReject, onAdvance, onConvert }: Props) {
  const closed = Boolean(detail.rejection || detail.operationId);
  return (
    <>
      {/* Em telemóvel, o relatório é um bloco de largura total abaixo do cabeçalho. */}
      <Button icon="file" className="max-[720px]:hidden" onClick={onReport}>
        Gerar relatório
      </Button>
      {detail.property.id !== undefined && <ButtonLink to={entityPath({ kind: "property", id: detail.property.id })}>Ver imóvel</ButtonLink>}
      {detail.operationId && (
        <ButtonLink variant="primary" to={`/operacoes/${detail.operationId}`}>
          Ver operação
        </ButtonLink>
      )}
      {!closed && (
        <>
          <Button onClick={onEdit}>Editar</Button>
          <Button variant="danger" onClick={onReject}>
            Marcar como rejeitada/perdida
          </Button>
          {detail.phaseIndex < LAST_OPPORTUNITY_PHASE ? (
            <Button variant="primary" disabled={busy} onClick={onAdvance}>
              Avançar fase
            </Button>
          ) : (
            <Button variant="primary" disabled={busy} onClick={onConvert}>
              Converter em operação
            </Button>
          )}
        </>
      )}
    </>
  );
}

export default OpportunityActions;
