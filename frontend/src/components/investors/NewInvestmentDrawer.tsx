import { useState, type FormEvent } from "react";

import type { InvestmentInput } from "../../api/investorsApi";
import { useCreateInvestment } from "../../hooks/useInvestors";
import { toIsoDate } from "../../lib/format";
import { AGREEMENT_DATE_RANGE, investmentErrors } from "../../lib/investorRules";
import { MONEY, PERCENT } from "../../lib/opportunityRules";
import { investmentOperationOptions, returnTypeOptions } from "../../temp";
import Button from "../ui/Button";
import Drawer from "../ui/Drawer";
import FormField from "../ui/FormField";
import Notice from "../ui/Notice";
import NumberInput from "../ui/NumberInput";
import Select from "../ui/Select";
import { inputClasses } from "../ui/inputClasses";

interface Props {
  investorId: number;
  investorName: string;
  onClose: () => void;
}

const FORM_ID = "novo-investimento";

function NewInvestmentDrawer({ investorId, investorName, onClose }: Props) {
  const create = useCreateInvestment(investorId);
  const [values, setValues] = useState<InvestmentInput>(() => ({
    operationCode: "",
    committedValue: 0,
    participationPercent: 0,
    returnType: "",
    returnRate: 0,
    agreementDate: toIsoDate(new Date()),
  }));
  const [showErrors, setShowErrors] = useState(false);
  const errors = investmentErrors(values);
  const set = <K extends keyof InvestmentInput>(key: K, value: InvestmentInput[K]) => setValues({ ...values, [key]: value });
  const error = (key: keyof InvestmentInput) => (showErrors ? errors[key] : undefined);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (!Object.keys(errors).length) create.mutate(values, { onSuccess: onClose });
  };

  return (
    <Drawer
      title="Novo investimento"
      subtitle={investorName}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form={FORM_ID} disabled={create.isPending}>
            Registar investimento
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="grid gap-3 rounded-panel border border-line bg-white p-3.5">
        {create.isError && <Notice tone="warning">Não foi possível registar o investimento. Tente novamente.</Notice>}
        <FormField label="Operação" error={error("operationCode")}>
          <Select value={values.operationCode} onChange={(value) => set("operationCode", value)} options={investmentOperationOptions} placeholder="Selecionar operação…" autoFocus />
        </FormField>
        <FormField label="Valor comprometido" error={error("committedValue")}>
          <NumberInput min={MONEY.min} max={MONEY.max} decimals={MONEY.decimals} suffix="€" value={values.committedValue} onChange={(value) => set("committedValue", value)} invalid={!!error("committedValue")} />
        </FormField>
        <FormField label="Participação" error={error("participationPercent")}>
          <NumberInput min={PERCENT.min} max={PERCENT.max} decimals={PERCENT.decimals} suffix="%" value={values.participationPercent} onChange={(value) => set("participationPercent", value)} invalid={!!error("participationPercent")} />
        </FormField>
        <FormField label="Tipo de retorno" error={error("returnType")}>
          <Select value={values.returnType} onChange={(value) => set("returnType", value)} options={returnTypeOptions} placeholder="Selecionar tipo…" />
        </FormField>
        <FormField label="Taxa" error={error("returnRate")}>
          <NumberInput min={PERCENT.min} max={PERCENT.max} decimals={PERCENT.decimals} suffix="%" value={values.returnRate} onChange={(value) => set("returnRate", value)} invalid={!!error("returnRate")} />
        </FormField>
        <FormField label="Data do acordo" error={error("agreementDate")}>
          <input className={inputClasses} type="date" min={AGREEMENT_DATE_RANGE.min} max={AGREEMENT_DATE_RANGE.max} value={values.agreementDate} onChange={(e) => set("agreementDate", e.target.value)} />
        </FormField>
      </form>
    </Drawer>
  );
}

export default NewInvestmentDrawer;
