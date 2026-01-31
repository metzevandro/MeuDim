"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";

export const deleteTransaction = async (transactionIds: string[]) => {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);

    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    const transactions = await db.transaction.findMany({
      where: { id: { in: transactionIds }, accountId: dbUser.id },
    });

    if (transactions.length !== transactionIds.length) {
      return { error: "Uma ou mais transações especificadas não existem" };
    }

    await db.transaction.deleteMany({
      where: { id: { in: transactionIds } },
    });

    return {
      success: `Ganho${transactionIds.length > 1 ? "s" : ""} excluído${transactionIds.length > 1 ? "s" : ""} com sucesso`,
    };
  } catch {
    return { error: "Erro ao excluir os ganhos" };
  }
};