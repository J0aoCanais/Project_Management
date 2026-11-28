import { useState, type FormEvent } from "react";

import { useInvestors } from "../../hooks/useInvestors";
import { investorKindLabel } from "../../lib/investorRules";
import type { CaepTerm, InvestorKind, InvestorStructure } from "../../lib/taxRules";
import InvestorStructureFields from "../investors/InvestorStructureFields";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import Select from "../ui/Select";

/** Para quem é o relatório: decide o imposto aplicado à parte do investidor. */
export interface ReportAudience {
  investorName?: string;
  kind: InvestorKind;
  caep: CaepTerm;
}

interface Props {
  /** Estrutura gravada na análise da oportunidade, usada quando ainda não há investidor. */
  defaultStructure: InvestorStructure;
  onConfirm: (audience: ReportAudience) => void;
  onClose: () => void;
}

const FORM_ID = "relatorio-investidor";

/** Antes do relatório: escolher o investidor, ou a estrutura (particular/empresa e CAEP) se ainda não houver investidor. */
function ReportAudienceDialog({ defaultStructure, onConfirm, onClose }: Props) {
  const investors = useInvestors();
  const [investorId, setInvestorId] = useState("");
  const [structure, setStructure] = useState<InvestorStructure>(defaultStructure);
  const chosen = investors.data?.find((investor) => String(investor.id) === investorId);
  // Um investidor sem estrutura no perfil (ainda não foi editado) também pede a estrutura.
  const chosenKind = chosen?.profile.investorKind || undefined;
  const options = (investors.data ?? []).map((investor) => ({ value: String(investor.id), label: investor.name }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (chosen && chosenKind) onConfirm({ investorName: chosen.name, kind: chosenKind, caep: chosen.profile.caepTerm });
    else onConfirm({ investorName: chosen?.name, ...structure });
  };

  return (
    <Dialog
      title="Relatório para investidores"
      description="O relatório mostra as contas na ótica do investidor: o que recebe depende da estrutura dele."
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" icon="file" type="submit" form={FORM_ID}>
            Gerar relatório
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3">
        <FormField label="Investidor">
          <Select
            searchable
            label="Investidor"
            value={investorId}
            onChange={setInvestorId}
            options={options}
            placeholder={investors.isPending ? "A carregar investidores…" : "Sem investidor (indicar a estrutura)"}
          />
        </FormField>
        {investors.isError && <p className="text-[11px] text-muted">Não foi possível carregar os investidores. Indique a estrutura.</p>}
        {chosen && chosenKind ? (
          <p className="text-[11px] text-muted">Estrutura do perfil: {investorKindLabel(chosen.profile)}.</p>
        ) : (
          <InvestorStructureFields value={structure} onChange={setStructure} />
        )}
      </form>
    </Dialog>
  );
}

export default ReportAudienceDialog;
