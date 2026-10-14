import Papa from "papaparse";

export type RowOrigin = "NONE" | "RULE" | "MANUAL";

export interface CreditCardTransaction {
  id: string;
  date: Date;
  title: string;
  amount: number;
  status: "PENDING" | "IGNORED";
  ignoredReason: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
  paymentMethodId: string | null;
  origin: RowOrigin;
}

/**
 * Uma linha só pode ser importada com categoria e subcategoria e, no extrato
 * da conta, também com a forma de pagamento da própria linha. Na fatura do
 * cartão a forma de pagamento é única para todas (`requiresRowPaymentMethod`
 * = false).
 */
export function isRowReady(
  t: CreditCardTransaction,
  requiresRowPaymentMethod: boolean,
): boolean {
  return (
    t.status === "PENDING" &&
    !!t.categoryId &&
    !!t.subcategoryId &&
    (!requiresRowPaymentMethod || !!t.paymentMethodId)
  );
}

interface RawRow {
  date: string;
  title: string;
  amount: string;
}

const IGNORE_TITLES = new Set(["Pagamento recebido"]);

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d,.\-]/g, "");
  if (cleaned.includes(",")) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }
  return parseFloat(cleaned);
}

function parseDate(raw: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    return new Date(`${raw.trim()}T12:00:00`);
  }
  return new Date(raw);
}

export function parseNubankCreditCardCsv(
  csvText: string,
): CreditCardTransaction[] {
  const { data, errors, meta } = Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const fields = meta.fields ?? [];
  if (!["date", "title", "amount"].every((c) => fields.includes(c))) {
    throw new Error(
      "Esse arquivo não parece ser a fatura do cartão. Se é o extrato da conta, volte e escolha “Extrato da conta”.",
    );
  }

  if (errors.length > 0) {
    throw new Error(`Erro ao ler CSV: ${errors[0].message}`);
  }

  const occurrenceCount = new Map<string, number>();

  return data.map((row) => {
    const amount = parseAmount(row.amount ?? "");
    const date = parseDate(row.date ?? "");

    let ignoredReason: string | null = null;
    if (IGNORE_TITLES.has((row.title ?? "").trim())) {
      ignoredReason = "pagamento_fatura_recebido";
    } else if (Number.isNaN(amount) || Number.isNaN(date.getTime())) {
      ignoredReason = "linha_invalida";
    } else if (amount <= 0) {
      ignoredReason = "credito_ou_estorno";
    }

    const dedupeKey = `${row.date}|${row.title}|${amount}`;
    const occurrence = occurrenceCount.get(dedupeKey) ?? 0;
    occurrenceCount.set(dedupeKey, occurrence + 1);

    return {
      id: `nubank-cc|${dedupeKey}|${occurrence}`,
      date,
      title: row.title,
      amount,
      status: ignoredReason ? "IGNORED" : "PENDING",
      ignoredReason,
      categoryId: null,
      subcategoryId: null,
      paymentMethodId: null,
      origin: "NONE",
    };
  });
}
