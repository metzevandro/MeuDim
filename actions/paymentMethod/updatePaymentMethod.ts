"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { paymentMethodSchema } from "@/schemas";
import z from "zod";

export const updatePaymentMethod = async (
  values: z.infer<typeof paymentMethodSchema>,
  paymentMethodId: string,
) => {
  try {
    const validatedFields = paymentMethodSchema.parse(values);
    const user = await currentUser();

    if (!user || !user.id) return { error: "Não autorizado" };

    const dbUser = await getUserById(user.id);
    if (!dbUser) return { error: "Não autorizado" };

    const { name } = validatedFields;

    const formaDePagamentoExists = await db.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId: dbUser.id },
    });

    if (!formaDePagamentoExists)
      return { error: "A forma de pagamento especificada não existe" };

    await db.paymentMethod.update({
      where: { id: paymentMethodId },
      data: {
        createdAt: new Date(),
        name: name.trim(),
      },
    });

    return { success: "Forma de pagamento atualizada com sucesso" };
  } catch {
    return { error: "Erro ao atualizar a forma de pagamento" };
  }
};
