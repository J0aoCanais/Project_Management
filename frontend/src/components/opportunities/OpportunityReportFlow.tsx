import { useState } from "react";

import type { ExtraCost, FinanceValues, OpportunityDetail } from "../../api/opportunitiesApi";
import { fromPassiveProfile } from "../../lib/taxRules";
import OpportunityReport from "./OpportunityReport";
import ReportAudienceDialog, { type ReportAudience } from "./ReportAudienceDialog";

interface Props {
  detail: OpportunityDetail;
  values: FinanceValues;
  extras: ExtraCost[];
  onClose: () => void;
}

/** "Gerar relatório para investidores": primeiro escolhe-se o investidor (ou a estrutura), depois abre o relatório. */
function OpportunityReportFlow({ detail, values, extras, onClose }: Props) {
  const [audience, setAudience] = useState<ReportAudience | null>(null);
  if (!audience) return <ReportAudienceDialog defaultStructure={fromPassiveProfile(values.investorProfile)} onClose={onClose} onConfirm={setAudience} />;
  return <OpportunityReport detail={detail} values={values} extras={extras} audience={audience} onClose={onClose} />;
}

export default OpportunityReportFlow;
