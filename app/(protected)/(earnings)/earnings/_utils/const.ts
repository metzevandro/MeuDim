import { DataTableColumn } from "design-system-zeroz";

/**
 * Número de linhas por página exibidas no DataTable de ganhos.
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

export const EARNING_TEXTS = {
  PAGE_TITLE: "Ganhos",
  BUTTON_ADD: "Adicionar ganho",
  BUTTON_UPDATE: "Salvar alterações",
  BUTTON_CANCEL: "Cancelar",
  BUTTON_DELETE: "Excluir",

  TABLE: {
    /**
     * As `key`s abaixo são usadas tanto pelo DataTable (pra ler o campo
     * correspondente em cada linha) quanto como chave do objeto retornado
     * por `transformEarningsForTable` — mantenha os dois em sincronia.
     */
    COLS: [
      { key: "Data", label: "Data", minWidth: 140 },
      { key: "Valor", label: "Valor", minWidth: 160 },
      { key: "Fonte de Renda", label: "Fonte de Renda", minWidth: 200 },
    ] as DataTableColumn[],
    ROWS_SELECTED: (count: number) =>
      count === 1 ? "item selecionado" : "itens selecionados",
  },

  EMPTY_STATE: {
    TITLE: "Nenhum ganho cadastrado",
    DESCRIPTION:
      "Cadastre seu primeiro ganho para começar a acompanhar suas entradas.",
    BUTTON: "Adicionar ganho",
  },

  DELETE_MODAL: {
    TITLE: "Excluir ganho",
    GET_DESCRIPTION: (count: number) =>
      count === 1
        ? "Tem certeza que deseja excluir este ganho?"
        : `Tem certeza que deseja excluir estes ${count} ganhos?`,
    GET_CONTENT: (count: number) =>
      count === 1
        ? "Esta ação não pode ser desfeita."
        : "Esta ação não pode ser desfeita e todos os itens selecionados serão removidos.",
  },

  ASIDE_CREATE: {
    TITLE: "Adicionar ganho",
    DESCRIPTION: "Preencha os dados abaixo para registrar um novo ganho.",
    LABEL_DATE: "Data",
    PLACEHOLDER_AMOUNT: "R$ 0,00",
    LABEL_INCOME_SOURCE: "Fonte de renda",
  },

  ASIDE_EDIT: {
    TITLE: "Editar ganho",
    DESCRIPTION: "Atualize os dados do ganho selecionado.",
  },

  NOTIFICATIONS: {
    ERROR_CREATE: "Erro ao criar ganho",
    ERROR_UPDATE: "Erro ao atualizar ganho",
    ERROR_DELETE: "Erro ao excluir ganho",
  },
} as const;
