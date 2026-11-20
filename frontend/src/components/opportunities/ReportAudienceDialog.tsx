import { useState, type FormEvent } from "react";

import { useInvestors } from "../../hooks/useInvestors";
import { CAEP_TERMS, INVESTOR_KINDS, type CaepTerm, type InvestorKind } from "../../lib/taxRules";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import FormField from "../ui/FormField";
import SegmentedChoice from "../ui/SegmentedChoice";
import Select from "../ui/Select";

/** Para quem é o relatório: decide o imposto da tabela de retorno líquido. */
export interface ReportAudience {
  investorName?: string;
  kind: InvestorKind;
  caep: CaepTerm;
}

interface Props {
  onConfirm: (audience: ReportAudience) => void;
  onClose: () => void;
}

const FORM_ID = "relatorio-investidor";

/** Antes do relatório: escolher o investidor, ou a estrutura (particular/empresa e CAEP) se ainda não houver investidor. */
function ReportAudienceDialog({ onConfirm, onClose }: Props) {
  const investors = useInvestors();
  const [investorId, setInvestorId] = useState("");
  const [kind, setKind] = useState<InvestorKind>("Particular");
  const [caep, setCaep] = useState<CaepTerm>("Menos de 1 ano");
  const chosen = investors.data?.find((investor) => String(investor.id) === investorId);
  // Um investidor sem estrutura no perfil (ainda não foi editado) também pede a estrutura.
  const chosenKind = chosen?.profile.investorKind || undefined;
  const options = (investors.data ?? []).map((investor) => ({ value: String(investor.id), label: investor.name }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (chosen && chosenKind) onConfirm({ investorName: chosen.name, kind: chosenKind, caep: chosen.profile.caepTerm });
    else onConfirm({ investorName: chosen?.name, kind, caep });
  };

  return (
    <Dialog
      title="Relatório para investidores"
      description="O retorno líquido depende da estrutura do investidor."
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
        {!chosenKind && (
          <>
            <div>
              <span className="mb-1 block text-[11px] text-muted">Estrutura</span>
              <SegmentedChoice<InvestorKind> label="Estrutura do investidor" value={kind} onChange={setKind} options={INVESTOR_KINDS.map((value) => ({ value, label: value }))} />
            </div>
            {kind === "Empresa" && (
              <div>
                <span className="mb-1 block text-[11px] text-muted">CAEP</span>
                <SegmentedChoice<CaepTerm> label="Prazo do CAEP" value={caep} onChange={setCaep} options={CAEP_TERMS.map((value) => ({ value, label: value }))} />
              </div>
            )}
          </>
        )}
      </form>
    </Dialog>
  );
}

export default ReportAudienceDialog;
