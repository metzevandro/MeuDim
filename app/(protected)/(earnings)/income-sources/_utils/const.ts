export const INCOME_SOURCE_TEXTS = {
  PAGE_TITLE: "Fontes de renda",
  BUTTON_ADD: "Adicionar",
  BUTTON_UPDATE: "Atualizar",
  BUTTON_DELETE: "Excluir",
  BUTTON_CANCEL: "Cancelar",

  ASIDE_CREATE: {
    TITLE: "Adicionar fonte de renda",
    DESCRIPTION: "Crie uma fonte de renda para suas entradas financeiras.",
    LABEL_NAME: "Nome",
    PLACEHOLDER_NAME: "Ex: Investimentos",
  },

  ASIDE_EDIT: {
    TITLE: "Editar fonte de renda",
    DESCRIPTION: "Edite a fonte de renda.",
  },

  EMPTY_STATE: {
    TITLE: "Adicione as fontes de renda dos seus ganhos!",
    DESCRIPTION:
      "Indique a origem dos seus ganhos, como salário, investimentos ou outros, para manter um registro detalhado e preciso das suas entradas financeiras.",
    BUTTON: "Adicionar fonte de renda",
  },

  DELETE_MODAL: {
    TITLE: "Excluir fontes de renda",
    GET_DESCRIPTION: (count: number) =>
      `Tem certeza de que deseja excluir ${count} fonte${count > 1 ? "s" : ""} de renda?`,
    GET_CONTENT: (count: number) =>
      `Você está prestes a excluir ${count} fonte${count > 1 ? "s" : ""} de renda. Esta ação é irreversível.`,
  },

  TABLE: {
    COLS: [
      { key: "Data", label: "Data" },
      { key: "Fonte de Renda", label: "Fonte de Renda" },
    ],
    ROWS_SELECTED_LABEL: "itens selecionados",
  },

  NOTIFICATIONS: {
    ERROR_CREATE: "Ocorreu um erro ao criar a fonte de renda.",
    ERROR_UPDATE: "Ocorreu um erro ao atualizar a fonte de renda.",
    ERROR_DELETE: "Ocorreu um erro ao excluir as fontes de renda.",
  },
};

export const LOADING_CONFIG = {
  INTERVAL: 50,
  MAX_PROGRESS: 80,
  COMPLETE_DURATION: 100,
  SUCCESS_RESET_DELAY: 500,
};

export const TABLE_ROWS_PER_PAGE = 5;
