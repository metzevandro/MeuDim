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

    const categoryExists = await db.categoria.findFirst({
      where: { name: categoria },
    });

    if (!categoryExists) {
      return { error: "A categoria especificada não existe" };
    }

    const formaDePagamentoExiste = await db.formaDePagamento.findFirst({
      where: { name: formaDePagamento },
    });

    if (!formaDePagamentoExiste) {
      return { error: "A forma de pagamento especificada não existe" };
    }

    const subcategoriaExiste = await db.subcategoria.findFirst({
      where: { name: subcategoria },
    });

    await db.expense.create({
      data: {
        amount: valor,
        accountId: dbUser.id,
        createdAt: data,
        categoriaId: categoryExists.id,
        formaDePagamentoId: formaDePagamentoExiste.id,
        subcategoriaId: subcategoriaExiste?.id,
      },
    });

    return { success: "Despesa adicionado com sucesso" };
  } catch (error) {
    console.log("Erro ao criar a despesa:", error);
    return { error: "Erro ao criar a despesa" };
  }
};

export const Atualizar = async (
  values: z.infer<typeof ExpenseSchema>,
  categoryId: string,
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

    const categoryExists = await db.categoria.findFirst({
      where: { name: categoria },
    });

    if (!categoryExists) {
      return { error: "A categoria especificada não existe" };
    }

    const formaDePagamentoExiste = await db.formaDePagamento.findFirst({
      where: { name: formaDePagamento },
    });

    if (!formaDePagamentoExiste) {
      return { error: "A forma de pagamento especificada não existe" };
    }

    const subcategoriaExiste = await db.subcategoria.findFirst({
      where: { name: subcategoria },
    });

    await db.expense.update({
      where: { id: categoryId },
      data: {
        amount: valor,
        accountId: dbUser.id,
        createdAt: data,
        categoriaId: categoryExists.id,
        formaDePagamentoId: formaDePagamentoExiste.id,
        subcategoriaId: subcategoriaExiste?.id,
      },
    });

    return { success: "Despesa atualizada com sucesso" };
  } catch (error) {
    console.log("Erro ao criar a despesa:", error);
    return { error: "Erro ao criar a despesa" };
  }
};

export const Deletar = async (categoryId: string) => {
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: "Não autorizado" };
  }

  const dbUser = await getUserById(user.id);
  if (!dbUser) {
    return { error: "Não autorizado" };
  }

  try {
    await db.expense.delete({
      where: {
        id: categoryId,
        accountId: dbUser.id,
      },
    });

    return { success: "Despesa excluída com sucesso" };
  } catch (error) {
    return { error: "Não foi possível excluir a categoria!" };
  }
};
