import { importTransactions } from "@/actions/transaction/importTransactions";
import { fetchAllPages } from "@/lib/fetch-all-pages";

export interface CategoryOption {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

export interface PaymentMethodOption {
  id: string;
  name: string;
}

export interface TransactionRule {
  id: string;
  pattern: string;
  categoryId: string;
  subcategoryId: string | null;
}

export interface ImportPayloadItem {
  importKey: string;
  date: string;
  title: string;
  amount: number;
  categoryId: string;
  subcategoryId: string;
  paymentMethodId: string;
  learn: boolean;
}

export interface ImportResult {
  imported: number;
  duplicates: number;
  rulesLearned: number;
}

export const fetchAllCategories = () =>
  fetchAllPages<CategoryOption>(
    "/api/categories",
    "Não foi possível carregar suas categorias.",
  );

export const fetchAllPaymentMethods = () =>
  fetchAllPages<PaymentMethodOption>(
    "/api/payment-methods",
    "Não foi possível carregar suas formas de pagamento.",
  );

export async function fetchRules(): Promise<TransactionRule[]> {
  const res = await fetch("/api/transaction-rules");
  if (!res.ok) throw new Error("Não foi possível carregar as regras salvas.");
  const { items } = (await res.json()) as { items: TransactionRule[] };
  return items;
}

export async function submitImport(
  items: ImportPayloadItem[],
): Promise<ImportResult> {
  const result = await importTransactions({ items });
  if (result.error) throw new Error(result.error);

  return {
    imported: result.imported ?? 0,
    duplicates: result.duplicates ?? 0,
    rulesLearned: result.rulesLearned ?? 0,
  };
}
