"use server";
import { signOut } from "@/auth";

export const Sair = async () => {
  const redirectTo = "/auth/login";

  await signOut({
    redirectTo: redirectTo,
    redirect: true,
  });
};
