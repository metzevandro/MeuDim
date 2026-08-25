import { DataTableColumn } from "design-system-zeroz";

/**
 * Número de linhas por página exibidas no DataTable de despesas.
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

export const EXPENSE_TEXTS = {
  PAGE_TITLE: "Despesas",
  BUTTON_ADD: "Adicionar despesa",
  BUTTON_UPDATE: "Salvar alterações",
  BUTTON_CANCEL: "Cancelar",
  BUTTON_DELETE: "Excluir",

  TABLE: {
    COLS: [
      { key: "Data", label: "Data", minWidth: 140 },
      { key: "Valor", label: "Valor", minWidth: 160 },
      { key: "Forma de Pagamento", label: "Forma de Pagamento", minWidth: 180 },
      { key: "Categoria", label: "Categoria", minWidth: 160 },
      { key: "Subcategoria", label: "Subcategoria", minWidth: 160 },
    ] as DataTableColumn[],
    ROWS_SELECTED: (count: number) =>
      count === 1 ? "item selecionado" : "itens selecionados",
  },

  EMPTY_STATE: {
    TITLE: "Nenhuma despesa cadastrada",
    DESCRIPTION:
      "Cadastre sua primeira despesa para começar a acompanhar suas saídas.",
    BUTTON: "Adicionar despesa",
  },

  DELETE_MODAL: {
    TITLE: "Excluir despesa",
    GET_DESCRIPTION: (count: number) =>
      count === 1
        ? "Tem certeza que deseja excluir esta despesa?"
        : `Tem certeza que deseja excluir estas ${count} despesas?`,
    GET_CONTENT: (count: number) =>
      count === 1
        ? "Esta ação não pode ser desfeita."
        : "Esta ação não pode ser desfeita e todos os itens selecionados serão removidos.",
  },

  ASIDE_CREATE: {
    TITLE: "Adicionar despesa",
    DESCRIPTION: "Preencha os dados abaixo para registrar uma nova despesa.",
    LABEL_DATE: "Data",
    PLACEHOLDER_AMOUNT: "R$ 0,00",
    LABEL_PAYMENT_METHOD: "Forma de pagamento",
    LABEL_CATEGORY: "Categoria",
    LABEL_SUBCATEGORY: "Subcategoria",
  },

  ASIDE_EDIT: {
    TITLE: "Editar despesa",
    DESCRIPTION: "Atualize os dados da despesa selecionada.",
  },

  NOTIFICATIONS: {
    ERROR_CREATE: "Erro ao criar despesa",
    ERROR_UPDATE: "Erro ao atualizar despesa",
    ERROR_DELETE: "Erro ao excluir despesa",
  },
} as const;
