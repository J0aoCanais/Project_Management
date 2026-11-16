import { useState, type FormEvent } from "react";

import { useWorkOptions } from "../../hooks/useWorks";
import {
  WORK_STATES,
  WORK_TEXT_LIMITS,
  workFormErrors,
  type WorkFormValues,
  type WorkState,
} from "../../lib/workRules";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  initialValues?: Partial<WorkFormValues>;
  onSubmit: (values: WorkFormValues) => void;
  isSubmitting?: boolean;
  serverError?: string | null;
  formId?: string;
  isEdit?: boolean;
}

function WorkForm({
  initialValues,
  onSubmit,
  serverError,
  formId = "work-form",
  isEdit = false,
}: Props) {
  const { data: options } = useWorkOptions();

  const [name, setName] = useState(initialValues?.name ?? "");
  const [operationId, setOperationId] = useState(
    initialValues?.operationId ? String(initialValues.operationId) : "",
  );
  const [state, setState] = useState<WorkState>(initialValues?.state ?? "Planeada");
  const [plannedStartDate, setPlannedStartDate] = useState(initialValues?.plannedStartDate ?? "");
  const [plannedEndDate, setPlannedEndDate] = useState(initialValues?.plannedEndDate ?? "");
  const [realStartDate, setRealStartDate] = useState(initialValues?.realStartDate ?? "");
  const [realEndDate, setRealEndDate] = useState(initialValues?.realEndDate ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [showErrors, setShowErrors] = useState(false);

  const errors = workFormErrors({
    name,
    operationId: operationId ? Number(operationId) : undefined,
    state,
    plannedStartDate,
    plannedEndDate,
    realStartDate,
    realEndDate,
    notes,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (Object.keys(errors).length > 0) return;

    onSubmit({
      name: name.trim(),
      operationId: Number(operationId),
      state,
      plannedStartDate: plannedStartDate || undefined,
      plannedEndDate: plannedEndDate || undefined,
      realStartDate: realStartDate || undefined,
      realEndDate: realEndDate || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const operationList = options?.operations ?? [];
  const selectedOp = operationList.find((op) => String(op.id) === operationId);
  const operationLabels = operationList.map((op) => op.name);

  const handleOperationChange = (label: string) => {
    const found = operationList.find((op) => op.name === label);
    setOperationId(found ? String(found.id) : "");
  };

  return (
    <form id={formId} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
      {serverError && <Notice tone="warning">{serverError}</Notice>}

      <FormField label="Nome da obra" error={showErrors ? errors.name : undefined}>
        <input
          type="text"
          className={inputClasses}
          value={name}
          maxLength={WORK_TEXT_LIMITS.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Remodelação T2 Baixa"
          autoFocus
        />
      </FormField>

      <FormField label="Operação" error={showErrors ? errors.operationId : undefined}>
        <Select
          label="Operação"
          value={selectedOp ? selectedOp.name : ""}
          onChange={handleOperationChange}
          options={operationLabels}
          placeholder="Selecionar operação…"
        />
      </FormField>

      <FormField label="Estado">
        <Select
          label="Estado"
          value={state}
          onChange={(val) => setState(val as WorkState)}
          options={[...WORK_STATES]}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-2.5 min-[721px]:grid-cols-2">
        <FormField label="Início previsto">
          <input
            type="date"
            className={inputClasses}
            value={plannedStartDate}
            onChange={(e) => setPlannedStartDate(e.target.value)}
          />
        </FormField>
        <FormField label="Fim previsto" error={showErrors ? errors.plannedEndDate : undefined}>
          <input
            type="date"
            className={inputClasses}
            value={plannedEndDate}
            onChange={(e) => setPlannedEndDate(e.target.value)}
          />
        </FormField>
      </div>

      {isEdit && (
        <div className="grid grid-cols-1 gap-2.5 min-[721px]:grid-cols-2">
          <FormField label="Início real">
            <input
              type="date"
              className={inputClasses}
              value={realStartDate}
              onChange={(e) => setRealStartDate(e.target.value)}
            />
          </FormField>
          <FormField label="Fim real" error={showErrors ? errors.realEndDate : undefined}>
            <input
              type="date"
              className={inputClasses}
              value={realEndDate}
              onChange={(e) => setRealEndDate(e.target.value)}
            />
          </FormField>
        </div>
      )}

      <FormField label="Notas (opcional)" error={showErrors ? errors.notes : undefined}>
        <textarea
          rows={3}
          className={`${inputClasses} resize-none`}
          value={notes}
          maxLength={WORK_TEXT_LIMITS.notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações, notas de planeamento ou condicionantes…"
        />
      </FormField>
    </form>
  );
}

export default WorkForm;
