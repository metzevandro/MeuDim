"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";

export const CriarCategoria = async (values: {
  name: string;
  date: Date;
  subcategoria: string[];
}) => {
  const { name, date, subcategoria } = values;
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: "Não autorizado" };
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return { error: "Não autorizado" };
  }

  try {
    await db.categoria.create({
      data: {
        createdAt: date,
        name: name,
        userId: dbUser.id,
        Subcategorias: {
          create: subcategoria.map((subcategoriaName) => ({
            name: subcategoriaName,
          })),
        },
      },
      include: {
        Subcategorias: true,
      },
    });

    return { success: "Categoria criada com sucesso" };
  } catch (error) {
    return { error: "Erro ao criar a categoria" };
  }
};

export const ExcluirCategoria = async (categoryId: string) => {
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: "Não autorizado" };
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return { error: "Não autorizado" };
  }

  try {
    await db.categoria.delete({
      where: {
        id: categoryId,
      },
    });

    return { success: "Categoria excluída com sucesso" };
  } catch (error) {
    return { error: "Não foi possível excluir a categoria!" };
  }
};

export const AtualizarCategoria = async (
  values: {
    name: string;
    date: Date;
    subcategoria: string[];
  },
  categoryId: string,
) => {
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: "Não autorizado" };
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return { error: "Não autorizado" };
  }

  const { name, date, subcategoria } = values;

  if (!Array.isArray(subcategoria)) {
    return { error: "Subcategorias devem ser um array" };
  }

  try {
    await db.categoria.update({
      where: { id: categoryId },
      data: {
        createdAt: date,
        name: name,
        userId: dbUser.id,
        Subcategorias: {
          deleteMany: {},
          create: subcategoria.map((subcategoriaName) => ({
            name: subcategoriaName,
          })),
        },
      },
      include: {
        Subcategorias: true,
      },
    });

    return { success: "Categoria atualizada com sucesso" };
  } catch (error) {
    return { error: "Erro ao atualizar a categoria" };
  }
};
