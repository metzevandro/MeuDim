import { findMatchingRule } from "@/lib/transaction-rules";
import type { CreditCardTransaction } from "./bank-credit-card";
import type { CategoryOption, TransactionRule } from "./import-api";

export function applyRules(
  transactions: CreditCardTransaction[],
  rules: TransactionRule[],
  categories: CategoryOption[],
): CreditCardTransaction[] {
  return transactions.map((t) => {
    if (t.status !== "PENDING") return t;

    const rule = findMatchingRule(rules, t.title);
    if (!rule) return t;

    const category = categories.find((c) => c.id === rule.categoryId);
    if (!category) return t;

    const subcategoryId =
      rule.subcategoryId &&
      category.subcategories.some((s) => s.id === rule.subcategoryId)
        ? rule.subcategoryId
        : null;

    return { ...t, categoryId: category.id, subcategoryId, origin: "RULE" };
  });
}
