import { importEarnings } from "@/actions/transaction/importEarnings";
import { fetchAllPages } from "@/lib/fetch-all-pages";
import type { RowOrigin } from "@/lib/account-statement";

export interface IncomeSourceOption {
  id: string;
  name: string;
}

export interface EarningRule {
  id: string;
  pattern: string;
  incomeSourceId: string;
}

/** Linha do extrato (entrada) na tela de revisão de Ganhos. */
export interface EarningImportTransaction {
  id: string;
  date: Date;
  title: string;
  amount: number;
  status: "PENDING" | "IGNORED";
  ignoredReason: string | null;
  incomeSourceId: string | null;
  origin: RowOrigin;
}

export interface EarningImportPayloadItem {
  importKey: string;
  date: string;
  title: string;
  amount: number;
  incomeSourceId: string;
  learn: boolean;
}

export interface EarningImportResult {
  imported: number;
  duplicates: number;
  rulesLearned: number;
}

export const fetchAllIncomeSources = () =>
  fetchAllPages<IncomeSourceOption>(
    "/api/income-sources",
    "Não foi possível carregar suas fontes de renda.",
  );

export async function fetchEarningRules(): Promise<EarningRule[]> {
  const res = await fetch("/api/earning-rules");
  if (!res.ok) throw new Error("Não foi possível carregar as regras salvas.");
  const { items } = (await res.json()) as { items: EarningRule[] };
  return items;
}

export async function submitEarningImport(
  items: EarningImportPayloadItem[],
): Promise<EarningImportResult> {
  const result = await importEarnings({ items });
  if (result.error) throw new Error(result.error);

  return {
    imported: result.imported ?? 0,
    duplicates: result.duplicates ?? 0,
    rulesLearned: result.rulesLearned ?? 0,
  };
}
