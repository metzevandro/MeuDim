"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { normalizeTitle } from "@/lib/transaction-rules";
import { importTransactionsSchema } from "@/schemas";
import { z } from "zod";

export const importTransactions = async (
  values: z.input<typeof importTransactionsSchema>,
): Promise<{
  error?: string;
  success?: string;
  imported?: number;
  duplicates?: number;
  rulesLearned?: number;
}> => {
  const parsed = importTransactionsSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const user = await currentUser();
  if (!user || !user.id) return { error: "Não autorizado" };

  const dbUser = await getUserById(user.id);
  if (!dbUser) return { error: "Não autorizado" };

  const { items } = parsed.data;

  const paymentMethodIds = [...new Set(items.map((i) => i.paymentMethodId))];
  const paymentMethods = await db.paymentMethod.findMany({
    where: { userId: dbUser.id, id: { in: paymentMethodIds } },
    select: { id: true },
  });
  if (paymentMethods.length !== paymentMethodIds.length) {
    return { error: "A forma de pagamento especificada não existe" };
  }

  const categoryIds = [...new Set(items.map((i) => i.categoryId))];
  const categories = await db.category.findMany({
    where: { userId: dbUser.id, id: { in: categoryIds } },
    select: { id: true, subcategories: { select: { id: true } } },
  });
  const subsByCategory = new Map(
    categories.map((c) => [c.id, new Set(c.subcategories.map((s) => s.id))]),
  );

  const invalid = items.some(
    (i) => !subsByCategory.get(i.categoryId)?.has(i.subcategoryId),
  );
  if (invalid) {
    return { error: "Categoria ou subcategoria inválida em alguma linha" };
  }

  const rulesToLearn = new Map<string, (typeof items)[number]>();
  for (const item of items) {
    if (!item.learn) continue;
    const pattern = normalizeTitle(item.title);
    if (pattern) rulesToLearn.set(pattern, item);
  }

  try {
    const imported = await db.$transaction(
      async (tx) => {
        const created = await tx.expense.createMany({
          data: items.map((i) => ({
            userId: dbUser.id,
            amount: Math.round(i.amount * 100) / 100,
            createdAt: new Date(i.date),
            description: i.title,
            importKey: i.importKey,
            categoryId: i.categoryId,
            subcategoryId: i.subcategoryId,
            paymentMethodId: i.paymentMethodId,
          })),
          skipDuplicates: true,
        });

        await Promise.all(
          [...rulesToLearn].map(([pattern, i]) =>
            tx.transactionRule.upsert({
              where: { userId_pattern: { userId: dbUser.id, pattern } },
              create: {
                userId: dbUser.id,
                pattern,
                sampleTitle: i.title,
                categoryId: i.categoryId,
                subcategoryId: i.subcategoryId,
              },
              update: {
                sampleTitle: i.title,
                categoryId: i.categoryId,
                subcategoryId: i.subcategoryId,
              },
            }),
          ),
        );

        return created.count;
      },
      { timeout: 20_000 },
    );

    return {
      success: "Transações importadas com sucesso",
      imported,
      duplicates: items.length - imported,
      rulesLearned: rulesToLearn.size,
    };
  } catch (error) {
    console.error("IMPORT ERROR:", error);
    return { error: "Erro ao importar as transações" };
  }
};
