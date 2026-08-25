// Transforma dados da API para o formato exibido na tabela
export interface IncomeSourceRaw {
  id: string;
  name: string;
  createdAt: string | Date;
}

export type IncomeSourceFormatted = {
  id: string;
  Data: string;
  "Fonte de Renda": string;
} & Record<string, unknown>;

/**
 * Converte array de fontes de renda da API para formato da tabela
 * @param incomeSources - Dados brutos da API
 * @returns Dados formatados para tabela
 */
export function transformIncomeSourcesForTable(
  incomeSources: IncomeSourceRaw[],
): IncomeSourceFormatted[] {
  return incomeSources.map((source) => ({
    id: source.id,
    Data: new Date(source.createdAt).toLocaleDateString("pt-BR"),
    "Fonte de Renda": source.name || "Sem nome",
  }));
}

/**
 * Valida se uma fonte de renda tem dados mínimos
 */
export function isValidIncomeSource(source: any): source is IncomeSourceRaw {
  return (
    typeof source === "object" &&
    source !== null &&
    typeof source.id === "string" &&
    typeof source.name === "string"
  );
}
