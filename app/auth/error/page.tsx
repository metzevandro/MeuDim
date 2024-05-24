"use client";
import { EmptyState } from "design-system-zeroz";
import "./auth-error-page.css";
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
        buttonContentPrimary="Voltar para a página de login"
        onClickActionPrimary={login}
      />
    </div>
  );
};

export default AuthErrorPage;
