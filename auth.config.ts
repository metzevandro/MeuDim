import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";

export default {
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
} satisfies NextAuthConfig;
