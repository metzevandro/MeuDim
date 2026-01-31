"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";

export const deleteIncomeSource = async (categoryIds: string[]) => {
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: "Não autorizado" };
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return { error: "Não autorizado" };
  }

  try {
    const fontesDeRenda = await db.fonteDeRenda.findMany({
      where: { id: { in: categoryIds }, userId: dbUser.id },
    });

    if (fontesDeRenda.length !== categoryIds.length) {
      return { error: "Uma ou mais fontes de renda especificadas não existem" };
    }

    const hasTransactions = await db.transaction.findMany({
      where: { categoryId: { in: categoryIds } },
    });

    if (hasTransactions.length > 0) {
      return {
        error: "Não é possível excluir fontes de renda associadas a ganhos",
      };
    }

    await db.fonteDeRenda.deleteMany({
      where: { id: { in: categoryIds } },
    });

    return {
      success: `Fonte${categoryIds.length > 1 ? "s" : ""} de renda excluída${categoryIds.length > 1 ? "s" : ""} com sucesso`,
    };
  } catch {
    return { error: "Erro ao excluir as fontes de renda" };
  }
};


