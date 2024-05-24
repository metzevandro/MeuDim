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

    const categoryExists = await db.fonteDeRenda.findFirst({
      where: { name: category },
    });

    if (!categoryExists) {
      return { error: "A fonte de renda especificada não existe" };
    }

    await db.transaction.create({
      data: {
        amount: amount,
        accountId: dbUser.id,
        createdAt: date,
        categoryId: categoryExists.id,
      },
    });

    return { success: "Ganho adicionado com sucesso" };
  } catch (error) {
    console.log("Erro ao criar a transação:", error);
    return { error: "Erro ao criar a transação" };
  }
};

export const Deletar = async (categoryId: string) => {
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: "Não autorizado" };
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: "Não autorizado" };
  }

  try {
    await db.transaction.delete({
      where: {
        id: categoryId,
        accountId: dbUser.id,
      },
    });

    return { success: "Ganho excluído com sucesso" };
  } catch (error) {
    console.log(error);
    return { error: "Não foi possível excluir o ganho!" };
  }
};

export const Atualizar = async (
  values: z.infer<typeof TransactionSchema>,
  categoryId: string,
) => {
  const validatedFields = TransactionSchema.safeParse(values);
  const user = await currentUser();

  if (!validatedFields.success) {
    return { error: "Os itens estão informados incorretamente" };
  }

  if (!user || !user.id) {
    return { error: "Não autorizado" };
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return { error: "Não autorizado" };
  }

  const { amount, category, date } = validatedFields.data;

  const categoryExists = await db.fonteDeRenda.findFirst({
    where: { name: category },
  });

  if (!categoryExists) {
    return { error: "A fonte de renda especificada não existe" };
  }

  try {
    await db.transaction.update({
      where: { id: categoryId },
      data: {
        createdAt: date,
        amount: amount,
        accountId: dbUser.id,
        categoryId: categoryExists.id,
      },
    });

    return { success: "Criado com sucesso" };
  } catch (error) {
    return { error: "Erro ao criar a categoria" };
  }
};
