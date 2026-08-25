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

  const ids = categoryIds.map((id) => String(id).trim());

  try {
    const fontesDeRenda = await db.incomeSource.findMany({
      where: { id: { in: ids }, userId: dbUser.id },
    });

    if (fontesDeRenda.length !== ids.length) {
      return { error: "Uma ou mais fontes de renda especificadas não existem" };
    }

    const hasEarnings = await db.earning.findMany({
      where: { incomeSourceId: { in: ids } },
    });

    if (hasEarnings.length > 0) {
      return {
        error: "Não é possível excluir fontes de renda associadas a ganhos",
      };
    }

    await db.incomeSource.deleteMany({
      where: { id: { in: ids } },
    });

    return {
      success: `Fonte${ids.length > 1 ? "s" : ""} de renda excluída${ids.length > 1 ? "s" : ""} com sucesso`,
    };
  } catch {
    return { error: "Erro ao excluir as fontes de renda" };
  }
};
