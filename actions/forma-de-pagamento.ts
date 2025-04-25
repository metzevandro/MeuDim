"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { FormaDePagamentoSchema } from "@/schemas";
import z from "zod";

export const CriarFormaDePagamento = async (
  values: z.infer<typeof FormaDePagamentoSchema>,
) => {
  try {
    const validatedFields = FormaDePagamentoSchema.parse(values);
    const user = await currentUser();

    if (!user || !user.id) return { error: "Não autorizado" };

    const dbUser = await getUserById(user.id);
    if (!dbUser) return { error: "Não autorizado" };

    const { name, date } = validatedFields;

    await db.formaDePagamento.create({
      data: {
        createdAt: new Date(date),
        name: name.trim(),
        userId: dbUser.id,
      },
    });

    return { success: "Forma de pagamento criada com sucesso" };
  } catch {
    return { error: "Erro ao criar a forma de pagamento" };
  }
};

export const AtualizarFormaDePagamento = async (
  values: z.infer<typeof FormaDePagamentoSchema>,
  formaDePagamentoId: string,
) => {
  try {
    const validatedFields = FormaDePagamentoSchema.parse(values);
    const user = await currentUser();

    if (!user || !user.id) return { error: "Não autorizado" };

    const dbUser = await getUserById(user.id);
    if (!dbUser) return { error: "Não autorizado" };

    const { name, date } = validatedFields;

    const formaDePagamentoExists = await db.formaDePagamento.findFirst({
      where: { id: formaDePagamentoId, userId: dbUser.id },
    });

    if (!formaDePagamentoExists)
      return { error: "A forma de pagamento especificada não existe" };

    await db.formaDePagamento.update({
      where: { id: formaDePagamentoId },
      data: {
        createdAt: new Date(date),
        name: name.trim(),
      },
    });

    return { success: "Forma de pagamento atualizada com sucesso" };
  } catch {
    return { error: "Erro ao atualizar a forma de pagamento" };
  }
};

export const ExcluirFormaDePagamento = async (
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
