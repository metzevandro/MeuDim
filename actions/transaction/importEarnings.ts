"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { normalizeTitle } from "@/lib/transaction-rules";
import { importEarningsSchema } from "@/schemas";
import { z } from "zod";

export const importEarnings = async (
  values: z.input<typeof importEarningsSchema>,
): Promise<{
  error?: string;
  success?: string;
  imported?: number;
  duplicates?: number;
  rulesLearned?: number;
}> => {
  const parsed = importEarningsSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const user = await currentUser();
  if (!user || !user.id) return { error: "Não autorizado" };

  const dbUser = await getUserById(user.id);
  if (!dbUser) return { error: "Não autorizado" };

  const { items } = parsed.data;

  const incomeSourceIds = [...new Set(items.map((i) => i.incomeSourceId))];
  const sources = await db.incomeSource.findMany({
    where: { userId: dbUser.id, id: { in: incomeSourceIds } },
    select: { id: true },
  });
  if (sources.length !== incomeSourceIds.length) {
    return { error: "Fonte de renda inválida em alguma linha" };
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
        const created = await tx.earning.createMany({
          data: items.map((i) => ({
            userId: dbUser.id,
            amount: Math.round(i.amount * 100) / 100,
            createdAt: new Date(i.date),
            description: i.title,
            importKey: i.importKey,
            incomeSourceId: i.incomeSourceId,
          })),
          skipDuplicates: true,
        });

        await Promise.all(
          [...rulesToLearn].map(([pattern, i]) =>
            tx.earningRule.upsert({
              where: { userId_pattern: { userId: dbUser.id, pattern } },
              create: {
                userId: dbUser.id,
                pattern,
                sampleTitle: i.title,
                incomeSourceId: i.incomeSourceId,
              },
              update: {
                sampleTitle: i.title,
                incomeSourceId: i.incomeSourceId,
              },
            }),
          ),
        );

        return created.count;
      },
      { timeout: 20_000 },
    );

    return {
      success: "Ganhos importados com sucesso",
      imported,
      duplicates: items.length - imported,
      rulesLearned: rulesToLearn.size,
    };
  } catch (error) {
    console.error("IMPORT ERROR:", error);
    return { error: "Erro ao importar os ganhos" };
  }
};
