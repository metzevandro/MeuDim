import { DataTableColumn } from "design-system-zeroz";

/**
 * Número de linhas por página exibidas no DataTable de Categorias.
 */
export const TABLE_ROWS_PER_PAGE = 5;

/**
 * Colunas do DataTable de Categorias. `key` mapeia para o campo
 * correspondente em cada linha retornada por `transformCategoryForTable`
 * (mais o `Subcategorias` calculado em `CategoryTable`).
 * Precisa ser um array mutável (DataTableColumn[]), por isso fica fora
 * do objeto `as const` abaixo.
 */
export const CATEGORY_TABLE_COLUMNS: DataTableColumn[] = [
  { key: "Data", label: "Data", minWidth: 150 },
  { key: "Categoria", label: "Categoria", minWidth: 150 },
  { key: "Subcategorias", label: "Subcategorias", minWidth: 400 },
];

/**
 * Configuração da progress bar usada pelo `useLoadingManager`
 * durante operações de create/update/delete.
 */
export const LOADING_CONFIG = {
  MAX_PROGRESS: 80,
  INTERVAL: 50,
  COMPLETE_DURATION: 100,
  SUCCESS_RESET_DELAY: 400,
};

/**
 * Largura máxima (em px) reservada para renderizar badges de subcategorias
 * antes de agrupar o restante em um badge "+N".
 */
export const SUBCATEGORIES_MAX_WIDTH = 400;

export const CATEGORY_TEXTS = {
  PAGE_TITLE: "Categorias",
  BUTTON_ADD: "Adicionar",
  BUTTON_ADD_SUBCATEGORY: "Adicionar",
  BUTTON_UPDATE: "Atualizar",
  BUTTON_CANCEL: "Cancelar",
  BUTTON_DELETE: "Excluir",
  BUTTON_EDIT: "Editar",

  TABLE: {
    ROWS_SELECTED: (count: number) =>
      `categoria${count > 1 ? "s" : ""} selecionada${count > 1 ? "s" : ""}`,
  },

  EMPTY_STATE: {
    TITLE: "Crie categorias para organizar as suas despesas!",
    DESCRIPTION:
      "Classifique cada despesa em uma categoria apropriada para facilitar a organização e análise do seu controle financeiro.",
    ICON: "car_tag",
    BUTTON: "Adicionar categoria",
  },

  DELETE_MODAL: {
    TITLE: "Excluir categorias",
    DESCRIPTION:
      "Tem certeza de que deseja excluir as categorias selecionadas?",
    GET_CONTENT: (count: number) =>
      `Esta ação é irreversível. Todo o histórico dessas categorias será perdido. ${count} categoria${
        count > 1 ? "s" : ""
      } ser${count > 1 ? "ão" : "á"} excluída${count > 1 ? "s" : ""}.`,
  },

  ASIDE_CREATE: {
    TITLE: "Adicionar categoria",
    DESCRIPTION: "Adicione uma categoria e suas subcategorias.",
    LABEL_NAME: "Nome",
    PLACEHOLDER_NAME: "Ex: Comida",
    LABEL_SUBCATEGORY: "Subcategoria",
    PLACEHOLDER_SUBCATEGORY: "Ex: Ifood",
  },

  ASIDE_EDIT: {
    TITLE: "Editar categoria",
    DESCRIPTION: "Edite a categoria e suas subcategorias.",
  },

  NOTIFICATIONS: {
    ERROR_CREATE: "Ocorreu um erro ao criar a categoria",
    ERROR_UPDATE: "Ocorreu um erro ao atualizar a categoria",
    ERROR_DELETE: "Ocorreu um erro ao excluir as categorias",
  },
} as const;
