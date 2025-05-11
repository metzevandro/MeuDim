"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { TransactionSchema } from "@/schemas";
import { z } from "zod";

export const Criar = async (values: z.infer<typeof TransactionSchema>) => {
  try {
    const validatedFields = TransactionSchema.parse(values);
    const user = await currentUser();

    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    const { date, category, amount } = validatedFields;

    const [day, month, year] = date.split("/");

    const formattedDate = new Date(
      Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        12,
        0,
        0,
      ),
    );

    if (isNaN(formattedDate.getTime())) {
      return { error: "Data inválida" };
    }

    const categoryExists = await db.fonteDeRenda.findFirst({
      where: { name: category, userId: dbUser.id },
    });

    if (!categoryExists) {
      return { error: "A fonte de renda especificada não existe" };
    }

    const formattedAmount = parseFloat(amount.toString().replace(",", "."));

    if (isNaN(formattedAmount) || formattedAmount <= 0) {
      return { error: "Valor inválido ou menor que R$ 0,00" };
    }

    await db.transaction.create({
      data: {
        amount: formattedAmount,
        accountId: dbUser.id,
        createdAt: formattedDate.toISOString(),
        categoryId: categoryExists.id,
      },
    });

    return { success: "Ganho adicionado com sucesso" };
  } catch (error) {
    console.log(error);
    return { error: "Erro ao criar o ganho" };
  }
};

export const Deletar = async (transactionIds: string[]) => {
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

export const Atualizar = async (
  values: z.infer<typeof TransactionSchema>,
  transactionId: string,
) => {
  try {
    const validatedFields = TransactionSchema.parse(values);
    const user = await currentUser();

    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    const { date, category, amount } = validatedFields;

    const [day, month, year] = date.split("/");

    const formattedDate = new Date(
      Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        12,
        0,
        0,
      ),
    );

    if (isNaN(formattedDate.getTime())) {
      return { error: "Data inválida" };
    }

    const categoryExists = await db.fonteDeRenda.findFirst({
      where: { name: category, userId: dbUser.id },
    });

    if (!categoryExists) {
      return { error: "A fonte de renda especificada não existe" };
    }

    const transactionExists = await db.transaction.findFirst({
      where: { id: transactionId, accountId: dbUser.id },
    });

    if (!transactionExists) {
      return { error: "A transação especificada não existe" };
    }

    const formattedAmount = parseFloat(amount.toString().replace(",", "."));

    if (isNaN(formattedAmount) || formattedAmount <= 0) {
      return { error: "Valor inválido ou menor que R$ 0,00" };
    }

    await db.transaction.update({
      where: { id: transactionId },
      data: {
        amount: formattedAmount,
        createdAt: formattedDate.toISOString(),
        accountId: dbUser.id,
        categoryId: categoryExists.id,
      },
    });

    return { success: "Ganho atualizado com sucesso" };
  } catch (error) {
    console.log(error);
    return { error: "Erro ao atualizar o ganho" };
  }
};
