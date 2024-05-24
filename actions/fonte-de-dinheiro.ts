"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { NewCategorySchema } from "@/schemas";
import { z } from "zod";

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

    return { success: "Criado com sucesso" };
  } catch (error) {
    return { error: "Erro ao criar a categoria" };
  }
};

export const ExcluirFonteDeRenda = async (categoryId: string) => {
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: "Não autorizado" };
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return { error: "Não autorizado" };
  }

  try {
    await db.fonteDeRenda.delete({
      where: {
        id: categoryId,
        userId: dbUser.id,
      },
    });

    return { success: "Categoria excluída com sucesso" };
  } catch (error) {
    return { error: "Não foi possível excluir a categoria!" };
  }
};

export const AtualizarFonteDeRenda = async (
  values: z.infer<typeof NewCategorySchema>,
  categoryId: string,
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
    await db.fonteDeRenda.update({
      where: { id: categoryId },
      data: {
        createdAt: date,
        name: name,
        userId: dbUser.id,
      },
    });

    return { success: "Criado com sucesso" };
  } catch (error) {
    return { error: "Erro ao criar a categoria" };
  }
};
