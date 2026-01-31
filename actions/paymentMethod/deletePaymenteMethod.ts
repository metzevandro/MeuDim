"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";

export const deletePaymenteMethod = async (
  formaDePagamentoIds: string[],
) => {
  try {
    const user = await currentUser();

    if (!user || !user.id) return { error: "Não autorizado" };

    const dbUser = await getUserById(user.id);
    if (!dbUser) return { error: "Não autorizado" };

    const formasDePagamento = await db.formaDePagamento.findMany({
      where: { id: { in: formaDePagamentoIds }, userId: dbUser.id },
    });

    if (formasDePagamento.length !== formaDePagamentoIds.length) {
      return {
        error: "Uma ou mais formas de pagamento especificadas não existem",
      };
    }

    const hasExpenses = await db.expense.findMany({
      where: { formaDePagamentoId: { in: formaDePagamentoIds } },
    });

    if (hasExpenses.length > 0) {
      return {
        error:
          "Não é possível excluir formas de pagamento associadas a despesas",
      };
    }

    await db.formaDePagamento.deleteMany({
      where: { id: { in: formaDePagamentoIds } },
    });

    return {
      success: `Forma${formaDePagamentoIds.length > 1 ? "s" : ""} de pagamento excluída${formaDePagamentoIds.length > 1 ? "s" : ""} com sucesso`,
    };
  } catch {
    return { error: "Erro ao excluir as formas de pagamento" };
  }
};
