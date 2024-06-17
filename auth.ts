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
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;

      if (!user.id) return false;

      const existingUser = await getUserById(user.id);

      if (!existingUser) {
        return false;
      }

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

      token.role = existingUser.role;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
