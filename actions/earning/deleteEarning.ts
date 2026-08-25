"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";

export const deleteEarning = async (earningIds: string[]) => {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);

    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    const earnings = await db.earning.findMany({
      where: { id: { in: earningIds }, userId: dbUser.id },
    });

    if (earnings.length !== earningIds.length) {
      return { error: "Uma ou mais transações especificadas não existem" };
    }

    await db.earning.deleteMany({
      where: { id: { in: earningIds } },
    });

    return {
      success: `Ganho${earningIds.length > 1 ? "s" : ""} excluído${earningIds.length > 1 ? "s" : ""} com sucesso`,
    };
  } catch {
    return { error: "Erro ao excluir os ganhos" };
  }
};
