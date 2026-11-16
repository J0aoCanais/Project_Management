import { useState, type FormEvent } from "react";

import type { Movement, MovementInput, MovementLinkKind, MovementOptions } from "../../api/financeApi";
import { FINANCE_TEXT_LIMITS, LINK_KIND_LABELS, budgetRoom, movementErrors } from "../../lib/financeRules";
import { formatMoney, todayIso } from "../../lib/format";
import { MONEY } from "../../lib/opportunityRules";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import NumberInput from "../ui/NumberInput";
import SegmentedChoice from "../ui/SegmentedChoice";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  formId: string;
  options: MovementOptions;
  /** O movimento a editar; sem ele, o formulário cria um novo. */
  movement?: Movement;
  serverError?: string;
  onSubmit: (input: MovementInput) => void;
}

type LinkChoice = MovementLinkKind | "none";

const linkChoices: { value: LinkChoice; label: string }[] = [
  { value: "operation", label: "Operação" },
  { value: "investment", label: "Investimento" },
  { value: "budgetItem", label: "Item de orçamento" },
  { value: "financing", label: "Financiamento" },
  { value: "none", label: "Nenhum" },
];

function linkRefs(options: MovementOptions, kind: MovementLinkKind) {
  return { operation: options.operations, investment: options.investments, budgetItem: options.budgetItems, financing: options.financings }[kind];
}

/** Campos de um movimento financeiro, usados para criar e para editar. */
function MovementForm({ formId, options, movement, serverError, onSubmit }: Props) {
  const [categoryId, setCategoryId] = useState(movement ? String(movement.categoryId) : "");
  const [amount, setAmount] = useState(movement?.amount ?? 0);
  const [expectedDate, setExpectedDate] = useState(movement?.expectedDate ?? "");
  const [effectiveDate, setEffectiveDate] = useState(movement?.effectiveDate ?? "");
  const [linkKind, setLinkKind] = useState<LinkChoice>(movement?.link?.kind ?? "none");
  const [linkId, setLinkId] = useState(movement?.link ? String(movement.link.id) : "");
  const [notes, setNotes] = useState(movement?.notes ?? "");
  const [showErrors, setShowErrors] = useState(false);

  const today = todayIso();
  const input: MovementInput = {
    categoryId: Number(categoryId),
    amount,
    expectedDate: expectedDate || undefined,
    effectiveDate: effectiveDate || undefined,
    link: linkKind === "none" ? undefined : { kind: linkKind, id: Number(linkId) },
    notes: notes.trim() || undefined,
  };
  const errors = movementErrors(input, { today, options, original: movement });
  const shown = (key: keyof typeof errors) => (showErrors ? errors[key] : undefined);
  const category = options.categories.find((item) => String(item.id) === categoryId);

  const budgetItem = linkKind === "budgetItem" ? options.budgetItems.find((item) => String(item.id) === linkId) : undefined;
  const ownAmount = movement?.direction === "Saída" && movement.link?.kind === "budgetItem" && String(movement.link.id) === linkId ? movement.amount : 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length) return;
    onSubmit(input);
  };

  return (
    <form id={formId} noValidate onSubmit={handleSubmit} className="grid min-w-0 grid-cols-1 gap-3 rounded-panel border border-line bg-white p-3.5">
      {serverError && <Notice tone="warning">{serverError}</Notice>}
      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <FormField label="Categoria" error={shown("categoryId")}>
          <Select
            value={categoryId}
            onChange={setCategoryId}
            options={options.categories.map((item) => ({ value: String(item.id), label: item.name }))}
            placeholder="Selecionar categoria…"
            invalid={!!shown("categoryId")}
            autoFocus
          />
        </FormField>
        <div className="mb-px">
          <span className="mb-1 block text-[11px] text-muted">Direção</span>
          <span className={`inline-flex h-[34px] items-center rounded-control bg-surface px-2.5 text-xs font-semibold ${category ? (category.direction === "Entrada" ? "text-success" : "text-danger") : "text-muted"}`}>
            {category?.direction ?? "—"}
          </span>
        </div>
      </div>
      <FormField label="Valor" error={shown("amount")}>
        <NumberInput min={MONEY.min} max={MONEY.max} decimals={MONEY.decimals} suffix="€" value={amount} onChange={setAmount} invalid={!!shown("amount")} />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Data prevista" error={shown("expectedDate")}>
          <input type="date" className={`${inputClasses} ${shown("expectedDate") ? "border-danger" : ""}`} value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
        </FormField>
        <FormField label="Data efetiva (opcional)" error={shown("effectiveDate")}>
          <input type="date" max={today} className={`${inputClasses} ${shown("effectiveDate") ? "border-danger" : ""}`} value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
        </FormField>
      </div>
      <p className="-mt-1 text-[11px] text-muted">Com data efetiva, o movimento fica como Realizado.</p>
      <div className="min-w-0">
        <span className="mb-1 block text-[11px] text-muted">Associar a</span>
        <div className="overflow-x-auto">
          <SegmentedChoice
            label="Associar a"
            options={linkChoices}
            value={linkKind}
            onChange={(value) => {
              setLinkKind(value);
              setLinkId("");
            }}
          />
        </div>
      </div>
      {linkKind !== "none" && (
        <FormField label={LINK_KIND_LABELS[linkKind]} error={shown("link")}>
          <Select
            value={linkId}
            onChange={setLinkId}
            options={linkRefs(options, linkKind).map((item) => ({ value: String(item.id), label: item.label }))}
            placeholder="Selecionar…"
            invalid={!!shown("link")}
          />
          {budgetItem && (
            <span className="mt-1 block text-[11px] text-muted">
              Contratado {formatMoney(budgetItem.contracted)} · em falta {formatMoney(budgetRoom(budgetItem, ownAmount))}
            </span>
          )}
        </FormField>
      )}
      <FormField label="Notas (opcional)" error={shown("notes")}>
        <textarea rows={3} className={`${inputClasses} resize-y`} value={notes} maxLength={FINANCE_TEXT_LIMITS.notes} onChange={(e) => setNotes(e.target.value)} />
        <span className="mt-1 block text-right text-[11px] text-muted">
          {notes.length}/{FINANCE_TEXT_LIMITS.notes}
        </span>
      </FormField>
    </form>
  );
}

export default MovementForm;
