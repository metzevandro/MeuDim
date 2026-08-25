import { z } from "zod";

/**
 * Schema de validação de Categoria.
 *
 * `subcategoria` é um array de strings — a categoria pode não ter
 * nenhuma subcategoria (por isso o `.default([])`, que cobre tanto o
 * caso de o campo não ser enviado quanto o de ser enviado como `[]`).
 * Cada subcategoria individual, se existir, não pode ser uma string vazia.
 */
export const categorySchema = z.object({
  name: z.string().min(1, "É necessário um nome para a categoria!"),

  subcategoria: z
    .array(z.string().min(1, "O nome da subcategoria não pode estar vazio!"))
    .default([]),
});
