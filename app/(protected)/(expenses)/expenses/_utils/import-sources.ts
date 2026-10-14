import { parseNubankAccountStatementCsv } from "@/lib/account-statement";
import {
  CreditCardTransaction,
  parseNubankCreditCardCsv,
} from "./bank-credit-card";

export type ImportSource = "card" | "account";

/**
 * - "single": uma forma de pagamento só (o cartão de crédito) vale para todas
 *   as linhas, o usuário não informa uma a uma.
 * - "per-row": cada linha informa a própria forma de pagamento.
 */
export type PaymentMode = "single" | "per-row";

export interface ImportSourceConfig {
  id: ImportSource;
  icon: string;
  /** Nome curto, usado em títulos e chips. */
  name: string;
  /** Uma frase para quem está escolhendo. */
  tagline: string;
  /** Linhas do cartão de escolha: o que entra, o que fica de fora, pagamento. */
  included: string;
  ignored: string;
  paymentSummary: string;
  paymentMode: PaymentMode;
  /** Etapa de envio do arquivo. */
  modalDescription: string;
  uploadTitle: string;
  uploadDescription: string;
  expectedColumns: string;
  /** Etapa de revisão. */
  ignoredHint: string;
  readyRule: string;
  parse: (csvText: string) => CreditCardTransaction[];
}

export const IMPORT_SOURCES: Record<ImportSource, ImportSourceConfig> = {
  card: {
    id: "card",
    icon: "credit_card",
    name: "Fatura do cartão",
    tagline: "Compras feitas no cartão de crédito.",
    included: "Todas as compras da fatura.",
    ignored: "Pagamentos e estornos.",
    paymentSummary: "Cartão de crédito, automático para todas as compras.",
    paymentMode: "single",
    modalDescription:
      "Envie o CSV da fatura do cartão exportado pelo app do banco.",
    uploadTitle: "Selecione o CSV da fatura",
    uploadDescription:
      "Exporte a fatura do cartão direto do app do seu banco e envie aqui. Nada é lançado automaticamente — você confirma tudo na próxima etapa.",
    expectedColumns: "date, title e amount",
    ignoredHint: "pagamentos e estornos",
    readyRule:
      "Todas as compras serão lançadas no cartão de crédito. Linhas sem categoria e subcategoria não serão importadas",
    parse: parseNubankCreditCardCsv,
  },
  account: {
    id: "account",
    icon: "account_balance",
    name: "Extrato da conta",
    tagline: "Pix, débito e boletos pagos com o saldo da conta.",
    included: "Só as saídas: Pix, débito e boletos.",
    ignored: "Pagamento de fatura, investimentos e Pix no crédito.",
    paymentSummary: "Você escolhe em cada linha.",
    paymentMode: "per-row",
    modalDescription:
      "Envie o CSV do extrato da conta exportado pelo app do banco. Só as saídas viram despesas.",
    uploadTitle: "Selecione o CSV do extrato",
    uploadDescription:
      "Exporte o extrato da conta no app do seu banco e envie aqui. Você confirma tudo na próxima etapa.",
    expectedColumns: "Data, Valor e Descrição",
    ignoredHint:
      "pagamento de fatura, investimentos ou Pix no crédito, que já entram por outros caminhos",
    readyRule:
      "Cada linha precisa de categoria, subcategoria e forma de pagamento para ser importada",
    parse: (csvText) =>
      parseNubankAccountStatementCsv(csvText, "OUT").map((t) => ({
        ...t,
        paymentMethodId: null,
      })),
  },
};

export const IMPORT_SOURCE_LIST: ImportSourceConfig[] = [
  IMPORT_SOURCES.card,
  IMPORT_SOURCES.account,
];

export const isPerRowPayment = (source: ImportSource) =>
  IMPORT_SOURCES[source].paymentMode === "per-row";
