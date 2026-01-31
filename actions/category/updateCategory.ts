"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";

export const updateCategory = async (
  values: {
    name: string;
    date: Date;
    subcategoria: string[];
  },
  categoryId: string,
) => {
  const { name, date, subcategoria } = values;

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

    await db.categoria.update({
      where: { id: categoryId },
      data: {
        createdAt: date,
        name,
        userId: dbUser.id,
        subcategorias: {
          deleteMany: {},
          create: subcategoria.map((subcategoriaName) => ({
            name: subcategoriaName,
          })),
        },
      },
      include: {
        subcategorias: true,
      },
    });

    return { success: "Categoria atualizada com sucesso" };
  } catch (error) {
    console.error("Erro ao atualizar a categoria:", error);
    return { error: "Erro ao atualizar a categoria" };
  }
};
