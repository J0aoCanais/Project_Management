import { useState, type FormEvent } from "react";

import type { BudgetItem } from "../../api/worksApi";
import { useWorkOptions } from "../../hooks/useWorks";
import {
  BUDGET_CATEGORIES,
  MONEY,
  budgetItemErrors,
  type BudgetItemValues,
} from "../../lib/workRules";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import NumberInput from "../ui/NumberInput";
import Select from "../ui/Select";

interface Props {
  initialValues?: Partial<BudgetItem>;
  onSubmit: (item: Omit<BudgetItem, "id"> & { id?: string }) => void;
  serverError?: string | null;
  formId?: string;
}

function BudgetItemForm({
  initialValues,
  onSubmit,
  serverError,
  formId = "budget-item-form",
}: Props) {
  const { data: options } = useWorkOptions();

  const [categoryName, setCategoryName] = useState(
    initialValues?.categoryName ?? BUDGET_CATEGORIES[0],
  );
  const [contractorName, setContractorName] = useState(
    initialValues?.contractorName ?? options?.contractors[0]?.name ?? "",
  );
  const [budgetedValue, setBudgetedValue] = useState(initialValues?.budgetedValue ?? 0);
  const [contractedValue, setContractedValue] = useState(initialValues?.contractedValue ?? 0);
  const [executedValue, setExecutedValue] = useState(initialValues?.executedValue ?? 0);
  const [invoicedValue, setInvoicedValue] = useState(initialValues?.invoicedValue ?? 0);
  const [paidValue, setPaidValue] = useState(initialValues?.paidValue ?? 0);
  const [showErrors, setShowErrors] = useState(false);

  const values: BudgetItemValues = {
    categoryName,
    contractorName: contractorName || (options?.contractors[0]?.name ?? ""),
    budgetedValue,
    contractedValue,
    executedValue,
    invoicedValue,
    paidValue,
  };

  const errors = budgetItemErrors(values);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (Object.keys(errors).length > 0) return;

    const contractorObj = options?.contractors.find((c) => c.name === values.contractorName);

    onSubmit({
      id: initialValues?.id,
      categoryName: values.categoryName,
      contractorName: values.contractorName,
      contractorId: contractorObj?.id,
      budgetedValue: values.budgetedValue,
      contractedValue: values.contractedValue,
      executedValue: values.executedValue,
      invoicedValue: values.invoicedValue,
      paidValue: values.paidValue,
    });
  };

  const contractorOptionsList = (options?.contractors ?? []).map((c) => c.name);

  return (
    <form id={formId} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
      {serverError && <Notice tone="warning">{serverError}</Notice>}

      <FormField label="Categoria" error={showErrors ? errors.categoryName : undefined}>
        <Select
          label="Categoria"
          value={categoryName}
          onChange={setCategoryName}
          options={BUDGET_CATEGORIES}
        />
      </FormField>

      <FormField label="Empreiteiro (contacto)" error={showErrors ? errors.contractorName : undefined}>
        <Select
          label="Empreiteiro"
          value={contractorName}
          onChange={setContractorName}
          options={contractorOptionsList}
          placeholder="Selecionar empreiteiro…"
        />
      </FormField>

      <div className="grid grid-cols-1 gap-2.5 min-[721px]:grid-cols-2">
        <FormField label="Valor previsto" error={showErrors ? errors.budgetedValue : undefined}>
          <NumberInput
            value={budgetedValue}
            onChange={setBudgetedValue}
            suffix="€"
            min={MONEY.min}
            max={MONEY.max}
            decimals={MONEY.decimals}
            invalid={showErrors && !!errors.budgetedValue}
          />
        </FormField>

        <FormField label="Valor contratado" error={showErrors ? errors.contractedValue : undefined}>
          <NumberInput
            value={contractedValue}
            onChange={setContractedValue}
            suffix="€"
            min={MONEY.min}
            max={MONEY.max}
            decimals={MONEY.decimals}
            invalid={showErrors && !!errors.contractedValue}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-2.5 min-[721px]:grid-cols-3">
        <FormField label="Valor executado" error={showErrors ? errors.executedValue : undefined}>
          <NumberInput
            value={executedValue}
            onChange={setExecutedValue}
            suffix="€"
            min={MONEY.min}
            max={MONEY.max}
            decimals={MONEY.decimals}
            invalid={showErrors && !!errors.executedValue}
          />
        </FormField>

        <FormField label="Valor faturado" error={showErrors ? errors.invoicedValue : undefined}>
          <NumberInput
            value={invoicedValue}
            onChange={setInvoicedValue}
            suffix="€"
            min={MONEY.min}
            max={MONEY.max}
            decimals={MONEY.decimals}
            invalid={showErrors && !!errors.invoicedValue}
          />
        </FormField>

        <FormField label="Valor pago" error={showErrors ? errors.paidValue : undefined}>
          <NumberInput
            value={paidValue}
            onChange={setPaidValue}
            suffix="€"
            min={MONEY.min}
            max={MONEY.max}
            decimals={MONEY.decimals}
            invalid={showErrors && !!errors.paidValue}
          />
        </FormField>
      </div>
    </form>
  );
}

export default BudgetItemForm;
