import type { NewOperation } from "../api/operationsApi";
import { fitsRule, MONEY } from "./opportunityRules";

export const OPERATION_TEXT_LIMITS = {
  code: 16,
  buyerName: 80,
  cancellationReason: 500,
} as const;

export type OperationFieldErrors = Partial<Record<keyof NewOperation, string>>;

export function operationErrors(input: NewOperation): OperationFieldErrors {
  const errors: OperationFieldErrors = {};
  if (!Number.isInteger(input.opportunityId) || input.opportunityId <= 0) errors.opportunityId = "Escolha uma oportunidade aprovada.";
  if (!input.buyerName.trim()) errors.buyerName = "Indique o contacto comprador.";
  else if (input.buyerName.trim().length > OPERATION_TEXT_LIMITS.buyerName) errors.buyerName = `Máximo de ${OPERATION_TEXT_LIMITS.buyerName} caracteres.`;
  if (!fitsRule(input.realPurchasePrice, MONEY) || input.realPurchasePrice <= 0) errors.realPurchasePrice = "Indique um preço de compra válido.";
  if (!fitsRule(input.advertisedPrice, MONEY) || input.advertisedPrice <= 0) errors.advertisedPrice = "Indique um preço anunciado válido.";
  return errors;
}

export function cancellationReasonError(reason: string): string | undefined {
  const value = reason.trim();
  if (!value) return "Indique o motivo do cancelamento.";
  if (value.length > OPERATION_TEXT_LIMITS.cancellationReason) return `Máximo de ${OPERATION_TEXT_LIMITS.cancellationReason} caracteres.`;
  return undefined;
}

export const OPERATION_MONEY_LIMIT = MONEY;
