"use server";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { ExpenseSchema } from "@/schemas";
import { z } from "zod";

export const Criar = async (values: z.infer<typeof ExpenseSchema>) => {
  try {
    const validatedFields = ExpenseSchema.parse(values);
    const user = await currentUser();

    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);

    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    const { data, categoria, valor, formaDePagamento, subcategoria } =
      validatedFields;

    const [day, month, year] = data.split("/");
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

    const categoryExists = await db.categoria.findFirst({
      where: { name: categoria, userId: dbUser.id },
    });

    if (!categoryExists) {
      return { error: "A categoria especificada não existe" };
    }

    const formaDePagamentoExiste = await db.formaDePagamento.findFirst({
      where: { name: formaDePagamento, userId: dbUser.id },
    });

    if (!formaDePagamentoExiste) {
      return { error: "A forma de pagamento especificada não existe" };
    }

    const subcategoriaExiste = await db.subcategoria.findFirst({
      where: { name: subcategoria, categoriaId: categoryExists.id },
    });

    if (!subcategoriaExiste) {
      return { error: "A subcategoria especificada não existe" };
    }

    const formattedAmount = parseFloat(valor.replace(",", "."));

    if (formattedAmount <= 0) {
      return { error: "Valor deve ser maior que R$ 0,00" };
    }

    if (isNaN(formattedAmount)) {
      return { error: "Valor inválido" };
    }

    await db.expense.create({
      data: {
        amount: formattedAmount,
        accountId: dbUser.id,
        createdAt: formattedDate.toISOString(),
        categoriaId: categoryExists.id,
        formaDePagamentoId: formaDePagamentoExiste.id,
        subcategoriaId: subcategoriaExiste?.id,
      },
    });

    return { success: "Despesa adicionada com sucesso" };
  } catch (error) {
    return { error: "Erro ao criar a despesa" };
  }
};

export const Atualizar = async (
  values: z.infer<typeof ExpenseSchema>,
  expenseId: string,
) => {
  try {
    const validatedFields = ExpenseSchema.parse(values);
    const user = await currentUser();

    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);

    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    const { data, categoria, valor, formaDePagamento, subcategoria } =
      validatedFields;

    const [day, month, year] = data.split("/");
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

    const categoryExists = await db.categoria.findFirst({
      where: { name: categoria, userId: dbUser.id },
    });

    if (!categoryExists) {
      return { error: "A categoria especificada não existe" };
    }

    const formaDePagamentoExiste = await db.formaDePagamento.findFirst({
      where: { name: formaDePagamento, userId: dbUser.id },
    });

    if (!formaDePagamentoExiste) {
      return { error: "A forma de pagamento especificada não existe" };
    }

    const subcategoriaExiste = await db.subcategoria.findFirst({
      where: { name: subcategoria, categoriaId: categoryExists.id },
    });

    if (!subcategoriaExiste) {
      return { error: "A subcategoria especificada não existe" };
    }

    const expenseExists = await db.expense.findFirst({
      where: { id: expenseId, accountId: dbUser.id },
    });

    if (!expenseExists) {
      return { error: "A despesa especificada não existe" };
    }

    const formattedAmount = parseFloat(valor.replace(",", "."));

    if (isNaN(formattedAmount) || formattedAmount <= 0) {
      return { error: "Valor inválido ou menor que R$ 0,00" };
    }

    await db.expense.update({
      where: { id: expenseId },
      data: {
        amount: formattedAmount,
        createdAt: formattedDate.toISOString(),
        categoriaId: categoryExists.id,
        formaDePagamentoId: formaDePagamentoExiste.id,
        subcategoriaId: subcategoriaExiste?.id,
      },
    });

    return { success: "Despesa atualizada com sucesso" };
  } catch (error) {
    return { error: "Erro ao atualizar a despesa" };
  }
};

export const Deletar = async (expenseIds: string[]) => {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return { error: "Não autorizado" };
    }

    const dbUser = await getUserById(user.id);

    if (!dbUser) {
      return { error: "Não autorizado" };
    }

    const expenses = await db.expense.findMany({
      where: { id: { in: expenseIds }, accountId: dbUser.id },
    });

    if (expenses.length !== expenseIds.length) {
      return { error: "Uma ou mais despesas especificadas não existem" };
    }

    await db.expense.deleteMany({
      where: { id: { in: expenseIds } },
    });

    return {
      success: `Despesa${expenseIds.length > 1 ? "s" : ""} deletada${expenseIds.length > 1 ? "s" : ""} com sucesso`,
    };
  } catch (error) {
    return { error: "Erro ao deletar as despesas" };
  }
};
