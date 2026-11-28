import { CAEP_TERMS, INVESTOR_KINDS, taxRate, type CaepTerm, type InvestorKind, type InvestorStructure } from "../../lib/taxRules";
import FormField from "../ui/FormField";
import SegmentedChoice from "../ui/SegmentedChoice";
import Select from "../ui/Select";

interface Props {
  value: InvestorStructure;
  onChange: (value: InvestorStructure) => void;
  /** Texto por baixo, ex.: de onde vem o valor por defeito. */
  hint?: string;
}

/** Tipo de investidor (Particular/Empresa) e CAEP, só para empresa. Mostra a taxa que se aplica à parte do investidor. */
function InvestorStructureFields({ value, onChange, hint }: Props) {
  const rate = taxRate(value.kind, value.caep);
  return (
    <>
      <FormField label="Tipo de investidor">
        <Select
          label="Tipo de investidor"
          value={value.kind}
          onChange={(kind) => onChange({ ...value, kind: kind as InvestorKind })}
          options={INVESTOR_KINDS}
        />
      </FormField>
      {value.kind === "Empresa" ? (
        <div>
          <span className="mb-1 block text-[11px] text-muted">CAEP</span>
          <SegmentedChoice<CaepTerm>
            label="Prazo do CAEP"
            value={value.caep}
            onChange={(caep) => onChange({ ...value, caep })}
            options={CAEP_TERMS.map((term) => ({ value: term, label: `${term} · IRC ${taxRate("Empresa", term)}%` }))}
          />
        </div>
      ) : (
        <p className="self-end text-[11px] text-muted">Um particular paga IRS de {rate}% sobre a parte que recebe.</p>
      )}
      {hint && <p className="text-[11px] text-muted min-[721px]:col-span-2">{hint}</p>}
    </>
  );
}

export default InvestorStructureFields;
