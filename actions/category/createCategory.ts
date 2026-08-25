"use server";

import { categorySchema } from "@/schemas";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import z from "zod";

export const createCategory = async (
  values: z.infer<typeof categorySchema>,
) => {
  const { name, subcategoria } = values;

  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    await db.category.create({
      data: {
        createdAt: new Date(),
        name,
        userId: dbUser.id,
        subcategories: {
          create: subcategoria.map((subcategoriaName) => ({
            name: subcategoriaName,
          })),
        },
      },
      include: {
        subcategories: true,
      },
    });

    return { success: "Categoria criada com sucesso" };
  } catch (error) {
    console.error("Erro ao criar a categoria:", error);
    return { error: "Erro ao criar a categoria" };
  }
};
