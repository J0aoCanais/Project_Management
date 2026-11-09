import { useState } from "react";

import type { LeadStatus } from "../../api/leadsApi";
import { leadStatusChangeOptions } from "../../temp";
import Button from "../ui/Button";
import Select from "../ui/Select";
import DiscardLeadDialog from "./DiscardLeadDialog";

interface Props {
  leadId: number;
  status: LeadStatus;
  busy: boolean;
  onStatusChange: (status: LeadStatus) => void;
  onConvert: () => void;
}

function LeadActions({ leadId, status, busy, onStatusChange, onConvert }: Props) {
  const [discarding, setDiscarding] = useState(false);

  return (
    <>
      <Select label="Estado da lead" className="w-auto" value={status} onChange={(value) => onStatusChange(value as LeadStatus)} options={leadStatusChangeOptions} />
      <Button variant="danger" onClick={() => setDiscarding(true)}>
        Descartar
      </Button>
      <Button variant="primary" disabled={busy} onClick={onConvert}>
        Converter em oportunidade
      </Button>
      {discarding && <DiscardLeadDialog leadId={leadId} onClose={() => setDiscarding(false)} />}
    </>
  );
}

export default LeadActions;
