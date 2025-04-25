"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { NewCategorySchema } from "@/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export const CriarFonteDeRenda = async (
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

export const ExcluirFonteDeRenda = async (categoryIds: string[]) => {
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: "Não autorizado" };
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return { error: "Não autorizado" };
  }

  try {
    const fontesDeRenda = await db.fonteDeRenda.findMany({
      where: { id: { in: categoryIds }, userId: dbUser.id },
    });

    if (fontesDeRenda.length !== categoryIds.length) {
      return { error: "Uma ou mais fontes de renda especificadas não existem" };
    }

    const hasTransactions = await db.transaction.findMany({
      where: { categoryId: { in: categoryIds } },
    });

    if (hasTransactions.length > 0) {
      return {
        error: "Não é possível excluir fontes de renda associadas a ganhos",
      };
    }

    await db.fonteDeRenda.deleteMany({
      where: { id: { in: categoryIds } },
    });

    return {
      success: `Fonte${categoryIds.length > 1 ? "s" : ""} de renda excluída${categoryIds.length > 1 ? "s" : ""} com sucesso`,
    };
  } catch {
    return { error: "Erro ao excluir as fontes de renda" };
  }
};

export const AtualizarFonteDeRenda = async (
  values: z.infer<typeof NewCategorySchema>,
  categoryId: string,
) => {
  const validatedFields = NewCategorySchema.safeParse(values);
  const user = await currentUser();

  if (!validatedFields.success) {
    console.log("Validation error:", validatedFields.error);
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
    await db.fonteDeRenda.update({
      where: { id: categoryId },
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
