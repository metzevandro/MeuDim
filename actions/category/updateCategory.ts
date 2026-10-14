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

    const newNames = [
      ...new Set(subcategoria.map((s) => s.trim()).filter(Boolean)),
    ];

    const existing = await db.subcategory.findMany({
      where: { categoryId },
      include: { _count: { select: { expenses: true } } },
    });

    const existingNames = existing.map((s) => s.name);

    const toCreate = newNames.filter((n) => !existingNames.includes(n));
    const toRemove = existing.filter((s) => !newNames.includes(s.name));

    const inUse = toRemove.filter((s) => s._count.expenses > 0);
    if (inUse.length > 0) {
      return {
        error: `Não é possível remover: ${inUse
          .map((s) => s.name)
          .join(", ")} (possuem despesas vinculadas)`,
      };
    }

    await db.category.update({
      where: { id: categoryId },
      data: {
        name,
        userId: dbUser.id,
        subcategories: {
          deleteMany: { id: { in: toRemove.map((s) => s.id) } },
          create: toCreate.map((n) => ({ name: n })),
        },
      },
    });

    return { success: "Categoria atualizada com sucesso" };
  } catch (error) {
    console.error("Erro ao atualizar a categoria:", error);
    return { error: "Erro ao atualizar a categoria" };
  }
};
