"use client";

import { signOut } from "next-auth/react";
import { useUser } from "@/data/provider";

export const useLogout = () => {
  const { setUserData } = useUser();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
    setUserData(null);
  };

  return handleLogout;
};
