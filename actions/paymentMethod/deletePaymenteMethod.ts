"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";

export const deletePaymenteMethod = async (paymentMethodsIds: string[]) => {
  try {
    const user = await currentUser();

    if (!user || !user.id) return { error: "Não autorizado" };

    const dbUser = await getUserById(user.id);
    if (!dbUser) return { error: "Não autorizado" };

    const paymentMethods = await db.paymentMethod.findMany({
      where: { id: { in: paymentMethodsIds }, userId: dbUser.id },
    });

    if (paymentMethods.length !== paymentMethodsIds.length) {
      return {
        error: "Uma ou mais formas de pagamento especificadas não existem",
      };
    }

    const hasExpenses = await db.expense.findMany({
      where: { paymentMethodId: { in: paymentMethodsIds } },
    });

    if (hasExpenses.length > 0) {
      return {
        error:
          "Não é possível excluir formas de pagamento associadas a despesas",
      };
    }

    await db.paymentMethod.deleteMany({
      where: { id: { in: paymentMethodsIds } },
    });

    return {
      success: `Forma${paymentMethodsIds.length > 1 ? "s" : ""} de pagamento excluída${paymentMethodsIds.length > 1 ? "s" : ""} com sucesso`,
    };
  } catch {
    return { error: "Erro ao excluir as formas de pagamento" };
  }
};
