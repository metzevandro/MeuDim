import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getAccountByUserId } from "./data/account";
import {
  getCategoriaByUserId,
  getCategoriesByUserId,
  getExpenseByUserId,
  getFormaDePagamentoByUserId,
  getTransactionsByUserId,
} from "./data/transactions";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signOut: "/",
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      return true;
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.exp;
      }

      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        if (token.name) {
          session.user.name = token.name;
        }
        if (token.isOAuth) {
          session.user.isOAuth = token.isOAuth as boolean;
        }
      }

      if (!session.user.transactions) {
        const transactions = await getTransactionsByUserId(session.user.id);
        session.user.transactions = transactions;
      }

      if (!session.user.expense) {
        const expense = await getExpenseByUserId(session.user.id);
        session.user.expense = expense;
      }

      if (!session.user.transactions.categories) {
        const categories = await getCategoriesByUserId(session.user.id);
        session.user.categories = categories;
      }

      if (!session.user.categoria) {
        const categoria = await getCategoriaByUserId(session.user.id);
        session.user.categoria = categoria;
      }

      if (!session.user.formasDePagamento) {
        const formaDePagamento = await getFormaDePagamentoByUserId(
          session.user.id,
        );
        session.user.formaDePagamento = formaDePagamento;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;

      token.username = existingUser.username;
      token.role = existingUser.role;

      const transactions = await getTransactionsByUserId(existingUser.id);
      token.transactions = transactions;

      const expense = await getExpenseByUserId(existingUser.id);
      token.expense = expense;

      const categories = await getCategoriesByUserId(existingUser.id);
      token.categories = categories;

      const categoria = await getCategoriaByUserId(existingUser.id);
      token.categoria = categoria;

      const formaDePagamento = await getFormaDePagamentoByUserId(
        existingUser.id,
      );
      token.formaDePagamento = formaDePagamento;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});