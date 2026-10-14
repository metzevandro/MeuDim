/**
 * Leitura do extrato da conta (CSV exportado pelo app do banco).
 * Compartilhado entre Despesas (saídas) e Ganhos (entradas).
 *
 * Formato esperado (Nubank): Data,Valor,Identificador,Descrição
 *   04/09/2026,2436.97,6a9a...,Transferência Recebida - NOME - ...
 *   04/09/2026,-1080.93,6a9a...,Pagamento de fatura
 */
import Papa from "papaparse";

export type RowOrigin = "NONE" | "RULE" | "MANUAL";

/** "OUT" = saída (despesa) | "IN" = entrada (ganho) */
export type StatementDirection = "OUT" | "IN";

export interface StatementTransaction {
  id: string;
  date: Date;
  title: string;
  amount: number;
  status: "PENDING" | "IGNORED";
  ignoredReason: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
  origin: RowOrigin;
}

type RawRow = Record<string, string | undefined>;

function plain(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d,.\-]/g, "");
  if (cleaned.includes(",")) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }
  return parseFloat(cleaned);
}

/** Aceita dd/mm/aaaa (formato do extrato) e aaaa-mm-dd. */
function parseDate(raw: string): Date {
  const value = raw.trim();

  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (br) return new Date(`${br[3]}-${br[2]}-${br[1]}T12:00:00`);

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T12:00:00`);

  return new Date(NaN);
}

/**
 * Deixa só o nome de quem enviou/recebeu, para a descrição ficar curta e a
 * regra aprendida servir para a próxima vez:
 *   "Transferência enviada pelo Pix - PANINI BRASIL LTDA - 58.732.058/0001-00 - ADYEN ... Agência: 1 Conta: 1-9"
 *   -> "PANINI BRASIL LTDA"
 * Descrições sem contraparte ("Pagamento de fatura", "Aplicação RDB") ficam como estão.
 */
export function cleanStatementTitle(description: string): string {
  const text = description.trim();
  const parts = text.split(/\s+-\s+/);

  const withCounterparty =
    /^(transferencia\s+(enviada|recebida)|compra no debito|pagamento de boleto|debito em conta|pix)/.test(
      plain(parts[0] ?? ""),
    );

  if (withCounterparty && parts.length >= 2 && parts[1].trim()) {
    return parts[1].trim();
  }
  return text;
}

const CREDIT_PIX_PREFIX = "valor adicionado na conta por cartao de credito";

export const IGNORED_REASONS = {
  INVALID: "linha_invalida",
  ZERO: "valor_zerado",
  CARD_BILL: "pagamento_fatura",
  INVESTMENT: "investimento",
  CREDIT_PIX: "pix_no_credito",
} as const;

export function ignoredReasonLabel(reason: string | null): string {
  switch (reason) {
    case IGNORED_REASONS.CARD_BILL:
      return "pagamento de fatura (já entra pela fatura do cartão)";
    case IGNORED_REASONS.INVESTMENT:
      return "aplicação/resgate de investimento";
    case IGNORED_REASONS.CREDIT_PIX:
      return "Pix no crédito (já entra pela fatura do cartão)";
    case IGNORED_REASONS.ZERO:
      return "valor zerado";
    default:
      return "linha inválida";
  }
}

const REQUIRED_COLUMNS = ["data", "valor", "descricao"];

/**
 * Lê o CSV do extrato e devolve só as linhas do sentido pedido
 * ("OUT" para Despesas, "IN" para Ganhos). Linhas que não devem virar
 * lançamento (pagamento de fatura, investimentos, Pix no crédito) vêm como
 * IGNORED, para o usuário ver o motivo na revisão.
 */
export function parseNubankAccountStatementCsv(
  csvText: string,
  direction: StatementDirection,
): StatementTransaction[] {
  const { data, errors, meta } = Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => plain(h.replace(/^﻿/, "")),
  });

  const fields = meta.fields ?? [];
  if (!REQUIRED_COLUMNS.every((c) => fields.includes(c))) {
    throw new Error(
      "Esse arquivo não parece ser o extrato da conta. Confira se é o CSV de extrato exportado do app do banco (com as colunas Data, Valor e Descrição).",
    );
  }

  if (errors.length > 0) {
    throw new Error(`Erro ao ler CSV: ${errors[0].message}`);
  }

  // Pix pago no crédito vira um par no extrato (+ "valor adicionado" e - "Pix enviado")
  // com o mesmo identificador. O gasto de verdade aparece na fatura do cartão.
  const creditPixIds = new Set<string>();
  for (const row of data) {
    if (plain(row.descricao ?? "").startsWith(CREDIT_PIX_PREFIX)) {
      const id = (row.identificador ?? "").trim();
      if (id) creditPixIds.add(id);
    }
  }

  const occurrenceCount = new Map<string, number>();
  const result: StatementTransaction[] = [];

  for (const row of data) {
    const rawDescription = (row.descricao ?? "").trim();
    const value = parseAmount(row.valor ?? "");
    const date = parseDate(row.data ?? "");

    const rowDirection: StatementDirection = value < 0 ? "OUT" : "IN";
    if (!Number.isNaN(value) && value !== 0 && rowDirection !== direction) {
      continue; // pertence à outra página (entrada x saída)
    }

    const description = plain(rawDescription);
    const identifier = (row.identificador ?? "").trim();

    let ignoredReason: string | null = null;
    if (
      Number.isNaN(value) ||
      Number.isNaN(date.getTime()) ||
      !rawDescription
    ) {
      ignoredReason = IGNORED_REASONS.INVALID;
    } else if (value === 0) {
      ignoredReason = IGNORED_REASONS.ZERO;
    } else if (description.startsWith("pagamento de fatura")) {
      ignoredReason = IGNORED_REASONS.CARD_BILL;
    } else if (/^(aplicacao|resgate)\b/.test(description)) {
      ignoredReason = IGNORED_REASONS.INVESTMENT;
    } else if (
      description.startsWith(CREDIT_PIX_PREFIX) ||
      (identifier && creditPixIds.has(identifier))
    ) {
      ignoredReason = IGNORED_REASONS.CREDIT_PIX;
    }

    // Chave estável para não importar duas vezes o mesmo lançamento.
    // O identificador do banco pode se repetir no par do Pix no crédito,
    // por isso o valor (com sinal) entra na chave.
    const dedupeKey = (
      identifier
        ? `${identifier}|${row.valor}`
        : `${row.data}|${row.valor}|${rawDescription}`
    ).slice(0, 250);
    const occurrence = occurrenceCount.get(dedupeKey) ?? 0;
    occurrenceCount.set(dedupeKey, occurrence + 1);

    result.push({
      id: `nubank-conta|${dedupeKey}|${occurrence}`,
      date,
      title: cleanStatementTitle(rawDescription) || rawDescription,
      amount: Number.isNaN(value) ? 0 : Math.abs(value),
      status: ignoredReason ? "IGNORED" : "PENDING",
      ignoredReason,
      categoryId: null,
      subcategoryId: null,
      origin: "NONE",
    });
  }

  return result;
}
