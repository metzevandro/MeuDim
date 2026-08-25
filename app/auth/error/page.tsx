"use client";
import { Button, EmptyState } from "design-system-zeroz";
import "./styles.scss";
import { useRouter } from "next/navigation";
import React from "react";

const AuthErrorPage = () => {
  const router = useRouter();

  const login = () => {
    router.push("/auth/login");
  };

  return (
    <div className="auth-error-page">
      <EmptyState
        title="Ops!"
        description="Aconteceu um erro!"
        icon="warning"
        actions={<Button onClick={login}>Voltar para a página de login</Button>}
      />
    </div>
  );
};

export default AuthErrorPage;
