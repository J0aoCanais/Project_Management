import type { Investment } from "../../api/investorsApi";
import DocumentsPanel from "../documents/DocumentsPanel";
import EmptyState from "../ui/EmptyState";
import Panel from "../ui/Panel";

interface Props {
  investments: Investment[];
}

/** Separador "Documentos" do investidor: os documentos pertencem a cada investimento (`Document` em app/models.py). */
function InvestorDocuments({ investments }: Props) {
  if (!investments.length) {
    return (
      <Panel>
        <EmptyState message="Os documentos ficam ligados aos investimentos. Este investidor ainda não tem investimentos." />
      </Panel>
    );
  }
  return (
    <div className="grid gap-3.5">
      {investments.map((investment) => (
        <DocumentsPanel key={investment.id} owner={{ kind: "investment", id: investment.id }} title={`Investimento · ${investment.operationCode}`} />
      ))}
    </div>
  );
}

export default InvestorDocuments;
