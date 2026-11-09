// Alinhado com `Document` em app/models.py. Partilhado por oportunidades, investidores e,
// mais tarde, pelo menu Documentos.
export interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  propertyCode: string;
  /** Registo a que o documento está ligado, ex.: "OP-2026-001" ou "Investimento · OP-2026-001". */
  entity: string;
  sizeBytes: number;
  validUntil?: string;
  status: string;
}
