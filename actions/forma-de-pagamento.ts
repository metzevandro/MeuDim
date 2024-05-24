"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { NewCategorySchema } from "@/schemas";
import { z } from "zod";

export const CriarFormaDePagamento = async (
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
    await db.formaDePagamento.create({
      data: {
        createdAt: date,
        name: name,
        userId: dbUser.id,
      },
    });

    return { success: "Forma de pagamento criada com sucesso" };
  } catch (error) {
    return { error: "Erro ao criar a forma de pagamento" };
  }
};

export const ExcluirFormaDePagamento = async (categoryId: string) => {
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: "Não autorizado" };
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return { error: "Não autorizado" };
  }

  try {
    await db.formaDePagamento.delete({
      where: {
        id: categoryId,
        userId: dbUser.id,
      },
    });

    return { success: "Forma de pagamento excluída com sucesso" };
  } catch (error) {
    return { error: "Não foi possível excluir a Forma de pagamento!" };
  }
};

export const AtualizarFormaDePagamento = async (
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
    await db.formaDePagamento.update({
      where: { id: categoryId },
      data: {
        createdAt: date,
        name: name,
        userId: dbUser.id,
      },
    });

    return { success: "Forma de pagamento atualizado com sucesso" };
  } catch (error) {
    return { error: "Erro ao atualizar a forma de pagamento" };
  }
};
