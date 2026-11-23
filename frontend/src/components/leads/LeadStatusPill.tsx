import type { LeadStatus } from "../../api/leadsApi";
import Pill from "../ui/Pill";

interface Props {
  status: LeadStatus;
}

function LeadStatusPill({ status }: Props) {
  return <Pill tone={status === "Descartada" ? "red" : "green"}>{status}</Pill>;
}

export default LeadStatusPill;
