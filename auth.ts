import NextAuth from "next-auth";
import { UserRole } from "@/lib/generated/prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { loginSchema } from "@/schemas";
import { getUserById, getUserByEmail } from "@/data/user";
import { getAccountByUserId } from "./data/account";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
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
  adapter: PrismaAdapter(db as any),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const validatedFields = loginSchema.safeParse(credentials);
          if (validatedFields.success) {
            const { email, password } = validatedFields.data;
            const user = await getUserByEmail(email);
            if (!user || !user.password) return null;
            const passwordsMatch = await bcrypt.compare(
              password,
              user.password,
            );
            if (passwordsMatch) return user;
          }
          return null;
        } catch (error) {
          console.error("Error during credentials authorization:", error);
          return null;
        }
      },
    }),
  ],
});
