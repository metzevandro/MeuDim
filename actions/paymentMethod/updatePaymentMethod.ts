"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { FormaDePagamentoSchema } from "@/schemas";
import z from "zod";

export const updatePaymentMethod = async (
  values: z.infer<typeof FormaDePagamentoSchema>,
  formaDePagamentoId: string,
) => {
  try {
    const validatedFields = FormaDePagamentoSchema.parse(values);
    const user = await currentUser();

    if (!user || !user.id) return { error: "Não autorizado" };

    const dbUser = await getUserById(user.id);
    if (!dbUser) return { error: "Não autorizado" };

    const { name, date } = validatedFields;

    const formaDePagamentoExists = await db.formaDePagamento.findFirst({
      where: { id: formaDePagamentoId, userId: dbUser.id },
    });

    if (!formaDePagamentoExists)
      return { error: "A forma de pagamento especificada não existe" };

    await db.formaDePagamento.update({
      where: { id: formaDePagamentoId },
      data: {
        createdAt: new Date(date),
        name: name.trim(),
      },
    });

    return { success: "Forma de pagamento atualizada com sucesso" };
  } catch {
    return { error: "Erro ao atualizar a forma de pagamento" };
  }
};