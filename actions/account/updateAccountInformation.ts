"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { accountSchema } from "@/schemas";

export const updateAccountInformation = async (
  values: z.infer<typeof accountSchema>,
) => {
  const validatedFields = accountSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos!" };
  }

  const user = await currentUser();

  if (!user?.id) {
    return { error: "Não autorizado!" };
  }

  const dbUser = await db.user.findUnique({ where: { id: user.id } });

  if (!dbUser) {
    return { error: "Usuário não encontrado!" };
  }

  const name = validatedFields.data.name?.trim();

  if (!name) {
    return { error: "O nome não pode ficar vazio!" };
  }

  try {
    await db.user.update({
      where: { id: dbUser.id },
      data: { name },
    });
  } catch {
    return { error: "Erro ao atualizar as informações da conta." };
  }

  revalidatePath("/account");

  return { success: "Informações da conta atualizadas com sucesso!" };
};
