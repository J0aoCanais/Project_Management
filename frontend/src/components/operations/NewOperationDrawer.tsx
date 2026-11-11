import { useState, type FormEvent } from "react";

import type { NewOperation } from "../../api/operationsApi";
import { useCreateOperation, useOperationOptions } from "../../hooks/useOperations";
import { operationErrors, OPERATION_MONEY_LIMIT, OPERATION_TEXT_LIMITS } from "../../lib/operationRules";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import NumberInput from "../ui/NumberInput";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  onClose: () => void;
  onCreated: (id: number) => void;
}

const FORM_ID = "nova-operacao";

function NewOperationDrawer({ onClose, onCreated }: Props) {
  const { data: options, isError: optionsFailed } = useOperationOptions();
  const create = useCreateOperation();
  const [opportunityId, setOpportunityId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [realPurchasePrice, setRealPurchasePrice] = useState(0);
  const [advertisedPrice, setAdvertisedPrice] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  const selectedId = Number(opportunityId.split(" · ", 1)[0]);
  const selected = options?.approvedOpportunities.find((opportunity) => opportunity.id === selectedId);
  const input: NewOperation = { opportunityId: selectedId, buyerName, realPurchasePrice, advertisedPrice };
  const errors = operationErrors(input);

  const handleOpportunityChange = (value: string) => {
    setOpportunityId(value);
    const id = Number(value.split(" · ", 1)[0]);
    const opportunity = options?.approvedOpportunities.find((item) => item.id === id);
    setBuyerName(opportunity?.buyerName ?? "");
    setRealPurchasePrice(opportunity?.askingPrice ?? 0);
    setAdvertisedPrice(opportunity?.vvr ?? 0);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);
    if (Object.values(errors).some(Boolean)) return;
    create.mutate(input, { onSuccess: (operation) => onCreated(operation.id) });
  };

  return (
    <Drawer
      title="Nova operação"
      subtitle="A partir de uma oportunidade aprovada"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={create.isPending || !options?.approvedOpportunities.length}>
            Criar operação
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
        {optionsFailed && <Notice tone="warning">Não foi possível carregar as oportunidades aprovadas. Tente novamente.</Notice>}
        {create.isError && <Notice tone="warning">Não foi possível criar a operação. A oportunidade pode já ter sido convertida.</Notice>}
        <FormField label="Oportunidade de origem" error={showErrors ? errors.opportunityId : undefined}>
          <Select
            value={opportunityId}
            onChange={handleOpportunityChange}
            options={options?.approvedOpportunities.map((opportunity) => `${opportunity.id} · ${opportunity.title}`) ?? []}
            placeholder="Selecionar oportunidade…"
          />
        </FormField>
        <FormField label="Código">
          <input className={inputClasses} value={options?.nextCode ?? ""} maxLength={OPERATION_TEXT_LIMITS.code} readOnly />
        </FormField>
        <FormField label="Contacto comprador" error={showErrors ? errors.buyerName : undefined}>
          <Select
            value={buyerName}
            onChange={setBuyerName}
            options={options?.buyers ?? []}
            placeholder="Selecionar contacto…"
          />
        </FormField>
        <FormField label="Preço de compra real" error={showErrors ? errors.realPurchasePrice : undefined}>
          <NumberInput
            min={OPERATION_MONEY_LIMIT.min}
            max={OPERATION_MONEY_LIMIT.max}
            decimals={OPERATION_MONEY_LIMIT.decimals}
            suffix="€"
            value={realPurchasePrice}
            onChange={setRealPurchasePrice}
            invalid={showErrors && !!errors.realPurchasePrice}
          />
        </FormField>
        <FormField label="Preço anunciado" error={showErrors ? errors.advertisedPrice : undefined}>
          <NumberInput
            min={OPERATION_MONEY_LIMIT.min}
            max={OPERATION_MONEY_LIMIT.max}
            decimals={OPERATION_MONEY_LIMIT.decimals}
            suffix="€"
            value={advertisedPrice}
            onChange={setAdvertisedPrice}
            invalid={showErrors && !!errors.advertisedPrice}
          />
        </FormField>
        {!selected && !options?.approvedOpportunities.length && !optionsFailed && (
          <Notice>Não existem oportunidades aprovadas disponíveis para converter.</Notice>
        )}
      </form>
    </Drawer>
  );
}

export default NewOperationDrawer;
