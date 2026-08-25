import { DataTableColumn } from "design-system-zeroz";

/**
 * Número de linhas por página exibidas no DataTable de Formas de Pagamento.
 * Controla a paginação (rodapé com setas) do componente.
 */
export const TABLE_ROWS_PER_PAGE = 5;

/**
 * Configuração da progress bar usada pelo `useLoadingManager`
 * durante operações de create/update/delete.
 */
export const LOADING_CONFIG = {
  MAX_PROGRESS: 90,
  INTERVAL: 100,
  COMPLETE_DURATION: 100,
  SUCCESS_RESET_DELAY: 400,
};

export const PAYMENT_METHOD_TEXTS = {
  PAGE_TITLE: "Formas de Pagamento",
  BUTTON_ADD: "Adicionar",
  BUTTON_UPDATE: "Salvar alterações",
  BUTTON_CANCEL: "Cancelar",
  BUTTON_DELETE: "Excluir",

  TABLE: {
    /**
     * As `key`s abaixo são usadas tanto pelo DataTable (pra ler o campo
     * correspondente em cada linha) quanto como chave do objeto retornado
     * por `transformPaymentMethodForTable` — mantenha os dois em sincronia.
     */
    COLS: [
      { key: "Data", label: "Data", minWidth: "90" },
      { key: "Forma de Pagamento", label: "Nome" },
    ] as DataTableColumn[],
    ROWS_SELECTED: (count: number) =>
      count === 1 ? "item selecionado" : "itens selecionados",
  },

  EMPTY_STATE: {
    TITLE: "Nenhuma Forma de Pagamento cadastrada",
    DESCRIPTION:
      "Cadastre sua Forma de Pagamento para começar a acompanhar suas saídas.",
    BUTTON: "Adicionar Forma de Pagamento",
  },

  DELETE_MODAL: {
    TITLE: "Excluir Forma de Pagamento",
    GET_DESCRIPTION: (count: number) =>
      count === 1
        ? "Tem certeza que deseja excluir esta forma de pagamento?"
        : `Tem certeza que deseja excluir estas ${count} formas de pagamento?`,
    GET_CONTENT: (count: number) =>
      count === 1
        ? "Esta ação não pode ser desfeita."
        : "Esta ação não pode ser desfeita e todos os itens selecionados serão removidos.",
  },

  ASIDE_CREATE: {
    TITLE: "Adicionar Forma de Pagamento",
    DESCRIPTION:
      "Preencha os dados abaixo para registrar uma nova Forma de Pagamento.",
    LABEL_PAYMENT_METHOD: "Forma de Pagamento",
    PLACEHOLDER_PAYMENT_METHOD: "Ex.: Pix, Cartão de Crédito, Boleto",
  },

  ASIDE_EDIT: {
    TITLE: "Editar Forma de Pagamento",
    DESCRIPTION: "Atualize os dados da Forma de Pagamento selecionada.",
  },

  NOTIFICATIONS: {
    ERROR_CREATE: "Erro ao criar uma nova Forma de Pagamento",
    ERROR_UPDATE: "Erro ao atualizar a Forma de Pagamento selecionada",
    ERROR_DELETE: "Erro ao excluir Forma de Pagamento selecionada",
  },
} as const;
