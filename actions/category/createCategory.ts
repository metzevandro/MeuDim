"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";

export const CreateCategory = async (values: {
  name: string;
  date: Date;
  subcategoria: string[];
}) => {
  const { name, date, subcategoria } = values;

  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    await db.categoria.create({
      data: {
        createdAt: date,
        name,
        userId: dbUser.id,
        subcategorias: {
          create: subcategoria.map((subcategoriaName) => ({
            name: subcategoriaName,
          })),
        },
      },
      include: {
        subcategorias: true,
      },
    });

    return { success: "Categoria criada com sucesso" };
  } catch (error) {
    console.error("Erro ao criar a categoria:", error);
    return { error: "Erro ao criar a categoria" };
  }
};

