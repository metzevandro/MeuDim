"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { incomeSourceSchema } from "@/schemas";
import { z } from "zod";

export const updateIncomeSource = async (
  values: z.infer<typeof incomeSourceSchema>,
  incomeSourceId: string,
) => {
  const validatedFields = incomeSourceSchema.safeParse(values);
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

  const { name, date } = validatedFields.data;

  try {
    await db.incomeSource.update({
      where: { id: incomeSourceId },
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
