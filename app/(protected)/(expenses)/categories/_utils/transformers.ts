export interface SubcategoryRaw {
  id?: string;
  name: string;
}

export interface CategoryRaw {
  id: string;
  name: string;
  createdAt: string | Date;
  subcategories?: SubcategoryRaw[];
}

export type CategoryFormatted = {
  id: string;
  Data: string;
  Categoria: string;
  subcategorias: SubcategoryRaw[];
} & Record<string, unknown>;

/**
 * Converte array de Categorias da API para formato da tabela.
 * Mantém a ordem mais recente primeiro (igual ao comportamento original).
 * @param categories - Dados brutos da API
 * @returns Dados formatados para tabela
 */
export function transformCategoryForTable(
  categories: CategoryRaw[],
): CategoryFormatted[] {
  return [...categories].map((category) => ({
    id: category.id,
    Data: new Date(category.createdAt).toLocaleDateString("pt-BR"),
    Categoria: category.name,
    subcategorias: category.subcategories || [],
  }));
}

/**
 * Valida se uma categoria tem dados mínimos
 */
export function isValidCategory(source: any): source is CategoryRaw {
  return (
    typeof source === "object" &&
    source !== null &&
    typeof source.id === "string" &&
    typeof source.name === "string"
  );
}
