export interface ExpenseRaw {
  id: string;
  name: string;
  createdAt: string | Date;
  amount: string;
  paymentMethod: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  subcategory: {
    id: string;
    name: string;
  };
}

export type ExpenseFormatted = {
  id: string;
  Data: string;
  Valor: string;
  "Forma de Pagamento": string;
  Categoria: string;
  Subcategoria: string;
} & Record<string, unknown>;

/**
 * Converte array de despesas da API para formato da tabela
 * @param expenses - Dados brutos da API
 * @returns Dados formatados para tabela
 */
export function transformExpensesForTable(
  expenses: ExpenseRaw[],
): ExpenseFormatted[] {
  return expenses.map((source) => {
    return {
      id: source.id,
      Data: new Date(source.createdAt).toLocaleDateString("pt-BR"),
      Valor: `R$ ${parseFloat(source.amount.replace(",", "."))
        .toFixed(2)
        .replace(".", ",")}`,
      "Forma de Pagamento": source.paymentMethod.name || "Sem nome",
      Categoria: source.category.name || "Sem nome",
      Subcategoria: source.subcategory.name || "Sem nome",
    };
  });
}

/**
 * Valida se uma despesa tem dados mínimos
 */
export function isValidExpense(source: any): source is ExpenseRaw {
  return (
    typeof source === "object" &&
    source !== null &&
    typeof source.id === "string" &&
    typeof source.name === "string"
  );
}
