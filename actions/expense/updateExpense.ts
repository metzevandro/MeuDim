"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { expenseSchema } from "@/schemas";
import { z } from "zod";

export const updateExpense = async (
  values: z.infer<typeof expenseSchema>,
  expenseId: string,
) => {
  try {
    const validatedFields = expenseSchema.parse(values);
    const user = await currentUser();

    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);

    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    const { date, categoryId, amount, paymentMethodId, subcategoryId } =
      validatedFields;

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

    const categoryExists = await db.category.findFirst({
      where: { id: categoryId, userId: dbUser.id },
    });

    if (!categoryExists) {
      return { error: "A categoria especificada não existe" };
    }

    const paymentMethodExists = await db.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId: dbUser.id },
    });

    if (!paymentMethodExists) {
      return { error: "A forma de pagamento especificada não existe" };
    }

    const subcategoryExists = await db.subcategory.findFirst({
      where: { id: subcategoryId, categoryId: categoryExists.id },
    });

    if (!subcategoryExists) {
      return { error: "A subcategoria especificada não existe" };
    }

    const expenseExists = await db.expense.findFirst({
      where: { id: expenseId, userId: dbUser.id },
    });

    if (!expenseExists) {
      return { error: "A despesa especificada não existe" };
    }

    const formattedAmount = parseFloat(amount.replace(",", "."));

    if (isNaN(formattedAmount) || formattedAmount <= 0) {
      return { error: "Valor inválido ou menor que R$ 0,00" };
    }

    await db.expense.update({
      where: { id: expenseId },
      data: {
        amount: formattedAmount,
        createdAt: formattedDate.toISOString(),
        categoryId: categoryExists.id,
        paymentMethodId: paymentMethodExists.id,
        subcategoryId: subcategoryExists?.id,
      },
    });

    return { success: "Despesa atualizada com sucesso" };
  } catch (error) {
    return { error: "Erro ao atualizar a despesa" };
  }
};
