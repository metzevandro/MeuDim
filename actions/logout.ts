"use server";

import { signOut } from "@/auth";

export const Sair = async () => {
  await signOut();
};
