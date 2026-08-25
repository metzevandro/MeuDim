export interface PaymentMethodRaw {
  id: string;
  name: string;
  createdAt: string | Date;
}

export type PaymentMethodFormatted = {
  id: string;
  Data: string;
  "Forma de Pagamento": string;
} & Record<string, unknown>;

/**
 * Converte array de Formas de Pagamento da API para formato da tabela
 * @param paymentMethods - Dados brutos da API
 * @returns Dados formatados para tabela
 */
export function transformPaymentMethodForTable(
  paymentMethods: PaymentMethodRaw[],
): PaymentMethodFormatted[] {
  return paymentMethods.map((source) => {
    return {
      id: source.id,
      Data: new Date(source.createdAt).toLocaleDateString("pt-BR"),
      "Forma de Pagamento": source.name || "Sem nome",
    };
  });
}

/**
 * Valida se uma forma de pagamento tem dados mínimos
 */
export function isValidPaymentMethod(source: any): source is PaymentMethodRaw {
  return (
    typeof source === "object" &&
    source !== null &&
    typeof source.id === "string" &&
    typeof source.name === "string"
  );
}
