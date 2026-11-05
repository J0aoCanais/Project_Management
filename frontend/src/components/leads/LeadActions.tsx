import type { LeadStatus } from "../../api/leadsApi";
import Button from "../ui/Button";
import DiscardLeadDialog from "./DiscardLeadDialog";
import { useState } from "react";

interface Props {
  status: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
  onDiscard: (reason: string) => void;
  onConvert: () => void;
}

function LeadActions({ status, onStatusChange, onDiscard, onConvert }: Props) {
  const [discardOpen, setDiscardOpen] = useState(false);
  if (status === "Convertida" || status === "Descartada") return null;
  return <><select aria-label="Estado da lead" className="h-[34px] rounded-control border border-line bg-white px-2.5 text-xs" value={status} onChange={(event) => onStatusChange(event.target.value as LeadStatus)}><option>Nova</option><option>Contactada</option><option>Qualificada</option></select><Button variant="danger" onClick={() => setDiscardOpen(true)}>Descartar</Button><Button variant="primary" onClick={onConvert}>Converter em oportunidade</Button><DiscardLeadDialog open={discardOpen} onClose={() => setDiscardOpen(false)} onConfirm={(reason) => { onDiscard(reason); setDiscardOpen(false); }} /></>;
}

export default LeadActions;
