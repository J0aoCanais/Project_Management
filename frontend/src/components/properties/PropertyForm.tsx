import { useState, type FormEvent } from "react";

import type { PropertyInput } from "../../api/propertiesApi";
import { AREA, PROPERTY_TEXT_LIMITS, propertyErrors } from "../../lib/propertyRules";
import { MONEY, TEXT_LIMITS } from "../../lib/opportunityRules";
import { propertyTypeOptions, typologyOptions, zoneOptions } from "../../temp";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import NumberInput from "../ui/NumberInput";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  /** `id` do `<form>`, para o botão de submeter ficar no rodapé do drawer. */
  formId: string;
  initial?: PropertyInput;
  /** Mensagem do servidor quando recusa a gravação. */
  serverError?: string;
  onSubmit: (input: PropertyInput) => void;
}

const empty: PropertyInput = { address: "", typology: "T2", zone: "", propertyType: "Apartamento", areaM2: 0, askingPrice: 0, vvr: 0 };

/** Campos do imóvel, usados para criar e para editar. */
function PropertyForm({ formId, initial = empty, serverError, onSubmit }: Props) {
  const [values, setValues] = useState<PropertyInput>(initial);
  const [showErrors, setShowErrors] = useState(false);
  const errors = propertyErrors(values);
  const set = <K extends keyof PropertyInput>(key: K, value: PropertyInput[K]) => setValues((previous) => ({ ...previous, [key]: value }));
  const shown = (key: keyof PropertyInput) => (showErrors ? errors[key] : undefined);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length) return;
    onSubmit({ ...values, address: values.address.trim(), sourceUrl: values.sourceUrl?.trim() || undefined, notes: values.notes?.trim() || undefined });
  };

  return (
    <form id={formId} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5 min-[721px]:grid-cols-2">
      {serverError && (
        <div className="min-[721px]:col-span-2">
          <Notice tone="warning">{serverError}</Notice>
        </div>
      )}
      <FormField label="Morada" error={shown("address")} className="min-[721px]:col-span-2">
        {/* Textarea para a morada passar para a linha de baixo; continua a ser uma só linha de texto. */}
        <textarea
          rows={2}
          autoFocus
          className={`${inputClasses} resize-none wrap-anywhere`}
          value={values.address}
          maxLength={TEXT_LIMITS.title}
          placeholder="Rua da Sofia, 82, Coimbra"
          onChange={(e) => set("address", e.target.value.replace(/[\r\n]+/g, " "))}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }}
        />
      </FormField>
      <FormField label="Tipologia" error={shown("typology")}>
        <Select value={values.typology} onChange={(value) => set("typology", value)} options={typologyOptions} />
      </FormField>
      <FormField label="Zona" error={shown("zone")}>
        <Select value={values.zone} onChange={(value) => set("zone", value)} options={zoneOptions} placeholder="Selecionar zona…" invalid={!!shown("zone")} />
      </FormField>
      <FormField label="Tipo de imóvel" error={shown("propertyType")}>
        <Select value={values.propertyType} onChange={(value) => set("propertyType", value)} options={propertyTypeOptions} />
      </FormField>
      <FormField label="Área" error={shown("areaM2")}>
        <NumberInput min={AREA.min} max={AREA.max} decimals={AREA.decimals} suffix="m²" value={values.areaM2} onChange={(value) => set("areaM2", value)} invalid={!!shown("areaM2")} />
      </FormField>
      <FormField label="Ano de construção (opcional)" error={shown("constructionYear")}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          className={`${inputClasses} tabular-nums ${shown("constructionYear") ? "border-danger" : ""}`}
          value={values.constructionYear ?? ""}
          placeholder="1978"
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            set("constructionYear", digits ? Number(digits) : undefined);
          }}
        />
      </FormField>
      <FormField label="Data de visita (opcional)" error={shown("visitDate")}>
        <input type="date" className={inputClasses} value={values.visitDate ?? ""} onChange={(e) => set("visitDate", e.target.value || undefined)} />
      </FormField>
      <FormField label="Preço pedido" error={shown("askingPrice")}>
        <NumberInput min={MONEY.min} max={MONEY.max} decimals={MONEY.decimals} suffix="€" value={values.askingPrice} onChange={(value) => set("askingPrice", value)} invalid={!!shown("askingPrice")} />
      </FormField>
      <FormField label="VVR" error={shown("vvr")}>
        <NumberInput min={MONEY.min} max={MONEY.max} decimals={MONEY.decimals} suffix="€" value={values.vvr} onChange={(value) => set("vvr", value)} invalid={!!shown("vvr")} />
      </FormField>
      <FormField label="URL do anúncio (opcional)" error={shown("sourceUrl")} className="min-[721px]:col-span-2">
        <input
          type="url"
          className={`${inputClasses} ${shown("sourceUrl") ? "border-danger" : ""}`}
          value={values.sourceUrl ?? ""}
          maxLength={PROPERTY_TEXT_LIMITS.sourceUrl}
          placeholder="https://"
          onChange={(e) => set("sourceUrl", e.target.value)}
        />
      </FormField>
      <FormField label="Notas (opcional)" error={shown("notes")} className="min-[721px]:col-span-2">
        <textarea rows={3} className={`${inputClasses} resize-y`} value={values.notes ?? ""} maxLength={PROPERTY_TEXT_LIMITS.notes} onChange={(e) => set("notes", e.target.value)} />
        <span className="mt-1 block text-right text-[11px] text-muted">
          {(values.notes ?? "").length}/{PROPERTY_TEXT_LIMITS.notes}
        </span>
      </FormField>
    </form>
  );
}

export default PropertyForm;
