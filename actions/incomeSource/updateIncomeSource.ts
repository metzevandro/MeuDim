"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { NewCategorySchema } from "@/schemas";
import { z } from "zod";

export const updateIncomeSource = async (
  values: z.infer<typeof NewCategorySchema>,
  categoryId: string,
) => {
  const validatedFields = NewCategorySchema.safeParse(values);
  const user = await currentUser();

  if (!validatedFields.success) {
    console.log("Validation error:", validatedFields.error);
    return { error: "Os itens estão informados incorretamente" };
  }

  if (!user || !user.id) {
    return { error: "Não autorizado" };
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return { error: "Não autorizado" };
  }

  const { name, date } = validatedFields.data;

  try {
    await db.fonteDeRenda.update({
      where: { id: categoryId },
      data: {
        createdAt: date,
        name: name,
        userId: dbUser.id,
      },
    });

    return {
      success: "Fonte de renda atualizada com sucesso",
      data: { createdAt: date, name: name },
    };
  } catch (error) {
    return { error: "Erro ao atualizar a fonte de renda", data: null };
  }
};