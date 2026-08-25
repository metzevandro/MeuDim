"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { earningSchema } from "@/schemas";
import { z } from "zod";

export const createEarning = async (values: z.infer<typeof earningSchema>) => {
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

    const { incomeSourceId, amount, date } = validatedFields;

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

    const formattedAmount = parseFloat(
      parseFloat(amount.toString().replace(",", ".")).toFixed(2),
    );

    if (isNaN(formattedAmount) || formattedAmount <= 0) {
      return { error: "Valor inválido ou menor que R$ 0,00" };
    }

    await db.earning.create({
      data: {
        amount: formattedAmount,
        userId: dbUser.id,
        createdAt: formattedDate.toISOString(),
        incomeSourceId: incomeSourceExists.id,
      },
    });

    return { success: "Ganho adicionado com sucesso" };
  } catch (error) {
    error;
    return { error: "Erro ao criar o ganho" };
  }
};
