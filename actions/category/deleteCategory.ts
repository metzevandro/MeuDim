"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";

export const deleteCategory = async (categoryIds: string[]) => {
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