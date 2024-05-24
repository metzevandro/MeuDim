import { db } from "@/lib/db";

export async function getTransactionsByUserId(userId: string) {
  try {
    const transactions = await db.transaction.findMany({
      where: {
        accountId: userId,
      },
    });

    return transactions;
  } catch (error) {
    console.error("Erro ao buscar transações do usuário:", error);
    throw new Error("Erro ao buscar transações do usuário");
  }
}

export async function getExpenseByUserId(userId: string) {
  try {
    const expense = await db.expense.findMany({
      where: {
        accountId: userId,
      },
    });

    return expense;
  } catch (error) {
    console.error("Erro ao buscar transações do usuário:", error);
    throw new Error("Erro ao buscar transações do usuário");
  }
}

export async function getCategoriaByUserId(userId: string) {
  return await db.categoria.findMany({
    where: { userId },
    include: {
      Subcategorias: true,
    },
  });
}

export async function getCategoriasIdByName(id: string) {
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
}

export async function getFormaDePagamentoByUserId(userId: string) {
  return await db.formaDePagamento.findMany({
    where: { userId },
  });
}

export async function getFormaDePagamentoIdByName(id: string) {
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
}

export async function getCategoriesByUserId(userId: string) {
  return await db.fonteDeRenda.findMany({
    where: { userId },
  });
}

export async function getCategoryIdByName(id: string) {
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
}
