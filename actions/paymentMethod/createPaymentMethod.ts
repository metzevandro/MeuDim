"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { FormaDePagamentoSchema } from "@/schemas";
import z from "zod";

export const createPaymentMethod = async (
  values: z.infer<typeof FormaDePagamentoSchema>,
) => {
  try {
    const validatedFields = FormaDePagamentoSchema.parse(values);
    const user = await currentUser();

    if (!user || !user.id) return { error: "Não autorizado" };

    const dbUser = await getUserById(user.id);
    if (!dbUser) return { error: "Não autorizado" };

    const { name, date } = validatedFields;

    await db.formaDePagamento.create({
      data: {
        createdAt: new Date(date),
        name: name.trim(),
        userId: dbUser.id,
      },
    });

    return { success: "Forma de pagamento criada com sucesso" };
  } catch {
    return { error: "Erro ao criar a forma de pagamento" };
  }
};