import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

export type ExtendedUser = NextAuth.DefaultSession["user"] & {
  role: UserRole;
  id: string;
  isOAuth: boolean;
  username: string;
  transactions: {
    id: string;
    amount: number;
    createdAt: string;
    category: {
      id: string;
      createdAt: string;
      name: string;
    };
  };
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
