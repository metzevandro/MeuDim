"use server";
import * as z from "zod";
import bcrypt from "bcrypt";
import { registerSchema } from "@/schemas";
import { db } from "@/lib/db";

export const register = async (values: z.infer<typeof registerSchema>) => {
  const validatedFields = registerSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "error" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Este e-mail já está cadastrado!", field: "email" };
  }

  try {
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const userId = newUser.id;
    const currentDate = new Date();

    return { success: "Usuário criado", userId: newUser.id };
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return { error: "Erro ao registrar usuário." };
  }
};
