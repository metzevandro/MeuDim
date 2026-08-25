import {
  UserRole,
  Earning,
  Expense,
  Category,
  IncomeSource,
  PaymentMethod,
} from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = NextAuth.DefaultSession["user"] & {
  role: UserRole;
  id: string;
  isOAuth: boolean;
  eanings: Earning[];
  expenses: Expense[];
  categories: Category[];
  incomeSources: IncomeSource[];
  paymentMethods: PaymentMethod[];
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
