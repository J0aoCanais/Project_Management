import { useState, type FormEvent } from "react";

import type { NewOpportunity, OpportunityDetail } from "../../api/opportunitiesApi";
import { useCreateOpportunity, useOpportunityOptions } from "../../hooks/useOpportunities";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import NumberInput from "../ui/NumberInput";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";
import { typologyOptions } from "../../temp";
import { MONEY, TEXT_LIMITS, fitsRule, titleError } from "../../lib/opportunityRules";

interface Props {
  onClose: () => void;
  /** Ao converter uma lead: fica como lead de origem (fixa) e preenche a zona. */
  fromLead?: { id: number; name: string; zone: string };
  /** Valores iniciais, como os de um imóvel ("Criar oportunidade" no detalhe do imóvel). */
  initial?: Partial<NewOpportunity>;
  /** Chamado depois de criar; por omissão fecha o drawer. */
  onCreated?: (detail: OpportunityDetail) => void;
}

const FORM_ID = "nova-oportunidade";

function NewOpportunityDrawer({ onClose, fromLead, initial = {}, onCreated }: Props) {
  const { data: options } = useOpportunityOptions();
  const create = useCreateOpportunity();
  const [title, setTitle] = useState(initial.title?.slice(0, TEXT_LIMITS.title) ?? "");
  const [typology, setTypology] = useState(initial.typology ?? "T2");
  const [zone, setZone] = useState(fromLead?.zone ?? initial.zone ?? "");
  const [askingPrice, setAskingPrice] = useState(initial.askingPrice ?? 0);
  const [vvr, setVvr] = useState(initial.vvr ?? 0);
  const [leadId, setLeadId] = useState(fromLead ? String(fromLead.id) : initial.leadId ? String(initial.leadId) : "");
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
      { title: title.trim(), typology, zone, askingPrice, vvr, leadId: leadId ? Number(leadId) : undefined, propertyId: initial.propertyId },
      { onSuccess: (detail) => (onCreated ? onCreated(detail) : onClose()) },
    );
  };

  return (
    <Drawer
      title={fromLead ? "Converter lead em oportunidade" : "Nova oportunidade"}
      subtitle={fromLead ? `A partir da lead ${fromLead.name} · entra na fase Novo` : initial.propertyId ? "A partir do imóvel · entra na fase Novo" : "Entra na fase Novo"}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={create.isPending}>
            {fromLead ? "Converter" : "Criar oportunidade"}
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
          <Select value={typology} onChange={setTypology} options={typologyOptions} />
        </FormField>
        <FormField label="Zona" error={showErrors ? errors.zone : undefined}>
          <Select value={zone} onChange={setZone} options={options?.zones ?? []} placeholder="Selecionar zona…" />
        </FormField>
        <FormField label="Preço pedido" error={showErrors ? errors.askingPrice : undefined}>
          <NumberInput min={MONEY.min} max={MONEY.max} decimals={MONEY.decimals} suffix="€" value={askingPrice} onChange={setAskingPrice} invalid={showErrors && !!errors.askingPrice} />
        </FormField>
        <FormField label="VVR" error={showErrors ? errors.vvr : undefined}>
          <NumberInput min={MONEY.min} max={MONEY.max} decimals={MONEY.decimals} suffix="€" value={vvr} onChange={setVvr} invalid={showErrors && !!errors.vvr} />
        </FormField>
        {fromLead ? (
          <FormField label="Lead de origem">
            <input className={inputClasses} value={fromLead.name} readOnly disabled />
          </FormField>
        ) : (
          <FormField label="Lead de origem (opcional)">
            <Select
              value={leadId}
              onChange={setLeadId}
              options={(options?.leads ?? []).map((lead) => ({ value: String(lead.id), label: lead.name }))}
              placeholder="Sem lead de origem"
            />
          </FormField>
        )}
      </form>
    </Drawer>
  );
}

export default NewOpportunityDrawer;
