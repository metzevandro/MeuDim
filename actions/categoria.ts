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

export const ExcluirCategoria = async (categoryIds: string[]) => {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    const categorias = await db.categoria.findMany({
      where: { id: { in: categoryIds }, userId: dbUser.id },
    });

    if (categorias.length !== categoryIds.length) {
      return { error: "Uma ou mais categorias especificadas não existem" };
    }

    const hasExpenses = await db.expense.findMany({
      where: { categoriaId: { in: categoryIds } },
    });

    if (hasExpenses.length > 0) {
      return {
        error: "Não é possível excluir categorias associadas a despesas",
      };
    }

    await db.categoria.deleteMany({
      where: { id: { in: categoryIds } },
    });

    return {
      success: `Categoria${categoryIds.length > 1 ? "s" : ""} excluída${categoryIds.length > 1 ? "s" : ""} com sucesso`,
    };
  } catch {
    return { error: "Erro ao excluir as categorias" };
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
