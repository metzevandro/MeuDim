/**
 * Lógica compartilhada (client + server) para "aprender" categorias a partir
 * da descrição da transação.
 */

/**
 * Transforma a descrição bruta do banco numa chave estável:
 *  "Nike Store - Parcela 2/3"  ->  "nike store"
 *  "UBER *TRIP"                ->  "uber trip"
 */
export function normalizeTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .replace(/\s*-?\s*parcela\s*\d+\s*\/\s*\d+/g, "") // remove "- Parcela 2/3"
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export interface RuleLike {
  pattern: string;
}

/**
 * Procura a regra que melhor casa com a descrição:
 *  1) match exato do padrão normalizado
 *  2) padrão que é prefixo (por palavra) da descrição — ex.: regra "nike"
 *     casa com "nike store sao paulo". Vence o padrão mais longo.
 */
export function findMatchingRule<T extends RuleLike>(
  rules: T[],
  title: string,
): T | undefined {
  const key = normalizeTitle(title);
  if (!key) return undefined;

  let best: T | undefined;
  for (const rule of rules) {
    const matches = key === rule.pattern || key.startsWith(rule.pattern + " ");
    if (matches && (!best || rule.pattern.length > best.pattern.length)) {
      best = rule;
    }
  }
  return best;
}
