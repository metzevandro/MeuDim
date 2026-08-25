"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { earningSchema } from "@/schemas";
import { z } from "zod";

export const updateEarning = async (
  values: z.infer<typeof earningSchema>,
  earningId: string,
) => {
  try {
    const validatedFields = earningSchema.parse(values);
    const user = await currentUser();

    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    const { date, incomeSourceId, amount } = validatedFields;

    const [day, month, year] = date.split("/");

    const formattedDate = new Date(
      Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        12,
        0,
        0,
      ),
    );

    if (isNaN(formattedDate.getTime())) {
      return { error: "Data inválida" };
    }

    const incomeSourceExists = await db.incomeSource.findFirst({
      where: { id: incomeSourceId, userId: dbUser.id },
    });

    if (!incomeSourceExists) {
      return { error: "A fonte de renda especificada não existe" };
    }

    const earningExists = await db.earning.findFirst({
      where: { id: earningId, userId: dbUser.id },
    });

    if (!earningExists) {
      return { error: "O ganho especificado não existe" };
    }

    const formattedAmount = parseFloat(
      parseFloat(amount.toString().replace(",", ".")).toFixed(2),
    );

    if (isNaN(formattedAmount) || formattedAmount <= 0) {
      return { error: "Valor inválido ou menor que R$ 0,00" };
    }

    await db.earning.update({
      where: { id: earningId },
      data: {
        amount: formattedAmount,
        createdAt: formattedDate.toISOString(),
        userId: dbUser.id,
        incomeSourceId: incomeSourceExists.id,
      },
    });

    return { success: "Ganho atualizado com sucesso" };
  } catch (error) {
    return { error: "Erro ao atualizar o ganho" };
  }
};
