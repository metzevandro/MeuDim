"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { NewCategorySchema } from "@/schemas";
import { z } from "zod";

export const createIncomeSource = async (
  values: z.infer<typeof NewCategorySchema>,
) => {
  const validatedFields = NewCategorySchema.safeParse(values);
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
    await db.fonteDeRenda.create({
      data: {
        createdAt: date,
        name: name,
        userId: dbUser.id,
      },
    });

    return {
      success: "Fonte de renda criada com sucesso",
      data: { createdAt: date, name: name, id: dbUser.id },
      user,
    };
  } catch (error) {
    return { error: "Erro ao criar a fonte de renda" };
  }
};