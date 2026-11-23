import { Link } from "react-router-dom";

import type { MovementLink } from "../../api/financeApi";
import { LINK_KIND_LABELS } from "../../lib/financeRules";
import { entityPath } from "../../lib/links";

/** "Operação · OP-2026-001" com link para a entidade, ou "—". */
function MovementLinkText({ link }: { link?: MovementLink }) {
  if (!link) return <>—</>;
  return (
    <Link to={entityPath(link)} onClick={(e) => e.stopPropagation()} className="text-brand hover:underline">
      <span className="text-muted">{LINK_KIND_LABELS[link.kind]} · </span>
      {link.label}
    </Link>
  );
}

export default MovementLinkText;
