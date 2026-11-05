import type { Lead, LeadContactEntry } from "../leadsApi";

export const leads: Lead[] = [
  { id: 1, contactName: "Marta Ribeiro", phone: "912 345 678", referredBy: "Casa Certa", zone: "Baixa", source: "Anúncio", status: "Nova", message: "Proprietária pretende vender apartamento T2 na Baixa de Coimbra.", createdAt: "2026-11-03T09:00:00.000Z" },
  { id: 2, contactName: "João Noronha", phone: "934 102 889", referredBy: "Particular", zone: "Celas", source: "Indicação", status: "Contactada", message: "Procura uma solução de investimento.", createdAt: "2026-11-02T10:30:00.000Z" },
  { id: 3, contactName: "Carla Mendes", phone: "966 334 120", referredBy: "Habita", zone: "Solum", source: "Site", status: "Qualificada", message: "Tem documentação pronta para análise.", createdAt: "2026-11-01T14:15:00.000Z" },
  { id: 4, contactName: "Rui Valente", phone: "918 422 301", referredBy: "Porta 21", zone: "Alta", source: "Idealista", status: "Convertida", createdAt: "2026-10-30T11:00:00.000Z" },
  { id: 5, contactName: "Sofia Matos", phone: "925 781 442", referredBy: "Particular", zone: "Santa Clara", source: "Redes sociais", status: "Descartada", discardReason: "Fora dos critérios de investimento", createdAt: "2026-10-28T16:45:00.000Z" },
];

export const leadContacts: Record<number, LeadContactEntry[]> = {
  1: [
    { id: 1, date: "2026-11-04T10:00:00.000Z", channel: "Telefone", owner: "Rodrigo Mendes", result: "Atendeu", note: "Visita marcada para 18/11/2026" },
    { id: 2, date: "2026-11-03T15:00:00.000Z", channel: "Email", owner: "Rodrigo Mendes", result: "Enviado", note: "Pedido de documentação" },
  ],
};
