"use client";
import { Button } from "design-system-zeroz";
import { useRouter } from "next/navigation";
import React from "react";

export default function Home() {
  const router = useRouter();
  const login = () => {
    router.push("/auth/login");
  };
  return (
    <div>
      <h1>HOME PAGE</h1>
      <Button
        size="md"
        label="Clique fazer o login"
        variant="primary"
        onClick={login}
      ></Button>
    </div>
  );
}
