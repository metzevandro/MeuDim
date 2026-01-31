"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { TransactionSchema } from "@/schemas";
import { z } from "zod";

export const createTransaction = async (values: z.infer<typeof TransactionSchema>) => {
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