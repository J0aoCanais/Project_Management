import type { DocumentOwnerKind, DocumentRecord } from "../../api/documentsApi";
import { EXPIRY_WARNING_DAYS, expiryStatus, missingRequiredTypes } from "../../lib/documentRules";
import { formatIsoDate, todayIso } from "../../lib/format";
import Notice from "../ui/Notice";

interface Props {
  kind: DocumentOwnerKind;
  documents: DocumentRecord[];
}

/** Avisos de documentos obrigatórios em falta e de validades a terminar. */
function DocumentWarnings({ kind, documents }: Props) {
  const missing = missingRequiredTypes(kind, documents);
  const today = todayIso();
  const expiring = documents.filter((document) => {
    const status = expiryStatus(document.expiryDate, today);
    return status === "A expirar" || status === "Expirado";
  });
  if (!missing.length && !expiring.length) return null;
  return (
    <div role="status" className="grid gap-2 p-2.5">
      {missing.length > 0 && <Notice tone="warning">Faltam documentos obrigatórios: {missing.join(", ")}.</Notice>}
      {expiring.map((document) => (
        <Notice key={document.id} tone="warning">
          {document.name}{" "}
          {expiryStatus(document.expiryDate, today) === "Expirado"
            ? `expirou a ${formatIsoDate(document.expiryDate!)}.`
            : `expira a ${formatIsoDate(document.expiryDate!)} (menos de ${EXPIRY_WARNING_DAYS} dias).`}{" "}
          Carregue uma versão atualizada.
        </Notice>
      ))}
    </div>
  );
}

export default DocumentWarnings;
