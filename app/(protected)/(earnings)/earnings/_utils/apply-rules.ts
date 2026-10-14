import { findMatchingRule } from "@/lib/transaction-rules";
import type {
  EarningImportTransaction,
  EarningRule,
  IncomeSourceOption,
} from "./import-api";

/** Preenche a fonte de renda das linhas pendentes com base nas regras aprendidas. */
export function applyEarningRules(
  transactions: EarningImportTransaction[],
  rules: EarningRule[],
  incomeSources: IncomeSourceOption[],
): EarningImportTransaction[] {
  return transactions.map((t) => {
    if (t.status !== "PENDING") return t;

    const rule = findMatchingRule(rules, t.title);
    if (!rule) return t;

    const source = incomeSources.find((s) => s.id === rule.incomeSourceId);
    if (!source) return t;

    return { ...t, incomeSourceId: source.id, origin: "RULE" };
  });
}
