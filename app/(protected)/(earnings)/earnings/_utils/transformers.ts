export interface EarningRaw {
  id: string;
  name: string;
  createdAt: string | Date;
  amount: string;
  incomeSource: {
    id: string;
    name: string;
  };
}

export type EarningFormatted = {
  id: string;
  Data: string;
  Valor: string;
  "Fonte de Renda": string;
} & Record<string, unknown>;

/**
 * Converte array de fontes de renda da API para formato da tabela
 * @param earnings - Dados brutos da API
 * @returns Dados formatados para tabela
 */
export function transformEarningsForTable(
  earnings: EarningRaw[],
): EarningFormatted[] {
  return earnings.map((source) => {
    return {
      id: source.id,
      Data: new Date(source.createdAt).toLocaleDateString("pt-BR"),
      Valor: `R$ ${parseFloat(source.amount.replace(",", "."))
        .toFixed(2)
        .replace(".", ",")}`,
      "Fonte de Renda": source.incomeSource.name || "Sem nome",
    };
  });
}

/**
 * Valida se uma fonte de renda tem dados mínimos
 */
export function isValidIncomeSource(source: any): source is EarningRaw {
  return (
    typeof source === "object" &&
    source !== null &&
    typeof source.id === "string" &&
    typeof source.name === "string"
  );
}
