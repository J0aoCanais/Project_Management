import { useState, type FormEvent } from "react";

import { ApiError } from "../../api/client";
import { useCreateFinancing } from "../../hooks/useFinance";
import { FINANCE_TEXT_LIMITS, financingErrors } from "../../lib/financeRules";
import { MONEY } from "../../lib/opportunityRules";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import NumberInput from "../ui/NumberInput";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  onClose: () => void;
}

const FORM_ID = "novo-financiamento";

function NewFinancingDrawer({ onClose }: Props) {
  const create = useCreateFinancing();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const errors = financingErrors({ name, amount });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length) return;
    create.mutate({ name: name.trim(), amount }, { onSuccess: onClose });
  };

  return (
    <Drawer
      title="Novo financiamento"
      subtitle="Crédito ou linha de financiamento"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={create.isPending}>
            Criar financiamento
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
        {create.isError && (
          <Notice tone="warning">{create.error instanceof ApiError && create.error.status === 422 ? create.error.message : "Não foi possível criar o financiamento. Tente novamente."}</Notice>
        )}
        <FormField label="Nome" error={showErrors ? errors.name : undefined}>
          <input autoFocus className={`${inputClasses} ${showErrors && errors.name ? "border-danger" : ""}`} value={name} maxLength={FINANCE_TEXT_LIMITS.financingName} placeholder="Crédito bancário OP-2026-004" onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="Montante" error={showErrors ? errors.amount : undefined}>
          <NumberInput min={MONEY.min} max={MONEY.max} decimals={MONEY.decimals} suffix="€" value={amount} onChange={setAmount} invalid={showErrors && !!errors.amount} />
        </FormField>
      </form>
    </Drawer>
  );
}

export default NewFinancingDrawer;
