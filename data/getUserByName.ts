import { db } from "@/lib/db";

export const getUserByName = async (name: string) => {
  try {
    const user = await db.user.findUnique({ where: { name } });

    return user;
  } catch {
    return null;
  }
};
