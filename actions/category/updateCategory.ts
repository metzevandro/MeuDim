"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import z from "zod";
import { categorySchema } from "@/schemas";

export const updateCategory = async (
  values: z.infer<typeof categorySchema>,
  categoryId: string,
) => {
  const { name, subcategoria } = values;

  if (!Array.isArray(subcategoria)) {
    return { error: "Subcategorias devem ser um array" };
  }

  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    await db.category.update({
      where: { id: categoryId },
      data: {
        createdAt: new Date(),
        name,
        userId: dbUser.id,
        subcategories: {
          deleteMany: {},
          create: subcategoria.map((subcategoryName) => ({
            name: subcategoryName,
          })),
        },
      },
      include: {
        subcategories: true,
      },
    });

    return { success: "Categoria atualizada com sucesso" };
  } catch (error) {
    console.error("Erro ao atualizar a categoria:", error);
    return { error: "Erro ao atualizar a categoria" };
  }
};
