import { useState, type FormEvent } from "react";

import { useCreateOpportunity, useOpportunityOptions } from "../../hooks/useOpportunities";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import NumberInput from "../ui/NumberInput";
import { inputClasses } from "../ui/inputClasses";
import { MONEY, TEXT_LIMITS, fitsRule, titleError } from "../../lib/opportunityRules";

interface Props {
  onClose: () => void;
}

const FORM_ID = "nova-oportunidade";
const TYPOLOGIES = ["T0", "T1", "T2", "T3", "T4", "T5+"];

function NewOpportunityDrawer({ onClose }: Props) {
  const { data: options } = useOpportunityOptions();
  const create = useCreateOpportunity();
  const [title, setTitle] = useState("");
  const [typology, setTypology] = useState("T2");
  const [zone, setZone] = useState("");
  const [askingPrice, setAskingPrice] = useState(0);
  const [vvr, setVvr] = useState(0);
  const [leadId, setLeadId] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const errors = {
    title: titleError(title),
    zone: zone ? undefined : "Escolha a zona.",
    askingPrice: askingPrice > 0 && fitsRule(askingPrice, MONEY) ? undefined : "Indique o preço pedido.",
    vvr: vvr > 0 && fitsRule(vvr, MONEY) ? undefined : "Indique o VVR.",
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.values(errors).some(Boolean)) return;
    create.mutate(
      { title: title.trim(), typology, zone, askingPrice, vvr, leadId: leadId ? Number(leadId) : undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <Drawer
      title="Nova oportunidade"
      subtitle="Entra na fase Novo"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={create.isPending}>
            Criar oportunidade
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
        {create.isError && <Notice tone="warning">Não foi possível criar a oportunidade. Tente novamente.</Notice>}
        <FormField label="Imóvel / morada" error={showErrors ? errors.title : undefined}>
          {/* Textarea para a morada passar para a linha de baixo; continua a ser uma só linha de texto. */}
          <textarea
            rows={2}
            className={`${inputClasses} resize-none wrap-anywhere`}
            value={title}
            maxLength={TEXT_LIMITS.title}
            onChange={(e) => setTitle(e.target.value.replace(/[\r\n]+/g, " "))}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }}
            placeholder="Rua da Sofia, Coimbra"
            autoFocus
          />
        </FormField>
        <FormField label="Tipologia">
          <select className={inputClasses} value={typology} onChange={(e) => setTypology(e.target.value)}>
            {TYPOLOGIES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Zona" error={showErrors ? errors.zone : undefined}>
          <select className={inputClasses} value={zone} onChange={(e) => setZone(e.target.value)}>
            <option value="">Selecionar zona…</option>
            {options?.zones.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Preço pedido" error={showErrors ? errors.askingPrice : undefined}>
          <NumberInput min={MONEY.min} max={MONEY.max} decimals={MONEY.decimals} suffix="€" value={askingPrice} onChange={setAskingPrice} invalid={showErrors && !!errors.askingPrice} />
        </FormField>
        <FormField label="VVR" error={showErrors ? errors.vvr : undefined}>
          <NumberInput min={MONEY.min} max={MONEY.max} decimals={MONEY.decimals} suffix="€" value={vvr} onChange={setVvr} invalid={showErrors && !!errors.vvr} />
        </FormField>
        <FormField label="Lead de origem (opcional)">
          <select className={inputClasses} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
            <option value="">Sem lead de origem</option>
            {options?.leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name}
              </option>
            ))}
          </select>
        </FormField>
      </form>
    </Drawer>
  );
}

export default NewOpportunityDrawer;
