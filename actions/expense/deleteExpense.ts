"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";

export const deleteExpense = async (expenseIds: string[]) => {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);

    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    const expenses = await db.expense.findMany({
      where: { id: { in: expenseIds }, accountId: dbUser.id },
    });

    if (expenses.length !== expenseIds.length) {
      return { error: "Uma ou mais despesas especificadas não existem" };
    }

    await db.expense.deleteMany({
      where: { id: { in: expenseIds } },
    });

    return {
      success: `Despesa${expenseIds.length > 1 ? "s" : ""} deletada${expenseIds.length > 1 ? "s" : ""} com sucesso`,
    };
  } catch (error) {
    return { error: "Erro ao deletar as despesas" };
  }
};
