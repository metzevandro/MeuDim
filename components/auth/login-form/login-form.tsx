"use client";
// React e hooks
import React, { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Bibliotecas externas
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Componentes do design system
import {
  Input,
  Button,
  Link,
  Card,
  CardContent,
  Notification,
  CardHeader,
} from "design-system-zeroz";

// Módulos
import { LoginSchema } from "@/schemas";
import { login } from "@/actions/login";

// Styles
import "./login-form.scss";

/**
 * O componente LoginForm é um formulário para os usuários se logar na plataforma.
 * Ele é renderizado na página de login.
 * o zod resolver para validar os dados do formulário com base no LoginSchema.
 * O formulário possui 2 campos: email e senha. Quando o formulário é enviado, a função onSubmit é chamada.
 * A função onSubmit chama a função login do módulo actions, passando os dados do formulário como argumento.
 * Se o login for bem-sucedido, o usuário é redirecionado para a página dashboard. Se houver um erro, a mensagem de erro é exibida
 * em uma notificação.
 */
export const LoginForm = () => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "O email já esta em uso"
      : "";
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setSuccess("");
    setError("");

    startTransition(() => {
      login(values).then((data) => {
        setNotificationOpen(true);
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  const { errors } = form.formState;

  const router = useRouter();
  /**
   * A função navigateTo redireciona o usuário para a rota especificada.
   */
  const navigateTo = (route: string) => {
    router.push(route);
  };

  return (
    <>
      <div className="login-page">
        <div className="login-card">
          <div className="login-form">
            {/* <img src="/MeuDim-Icon.svg" alt="" height={48} /> */}
            <header>
              <h1>Que bom ter você de volta</h1>
            </header>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="input-field">
                <Input
                  disabled={isPending}
                  name="email"
                  textError={errors.email?.message}
                  error={!!errors.email}
                  onChange={(e) => form.setValue("email", e.target.value)}
                  value={form.watch("email")}
                  label="E-mail"
                  type="email"
                  placeholder="carlos@gmail.com"
                />
                <Input
                  disabled={isPending}
                  name="password"
                  textError={errors.password?.message}
                  error={!!errors.password}
                  onChange={(e) => form.setValue("password", e.target.value)}
                  value={form.watch("password")}
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <footer>
                <Button
                  label="Continuar"
                  variant={isPending ? "is-loading" : "primary"}
                  size="md"
                  type="submit"
                />

                <p onClick={() => navigateTo("/auth/criar-conta")}>
                  Não possui uma conta?
                  <Link content="Crie sua conta grátis"></Link>
                </p>
              </footer>
            </form>
          </div>
        </div>
        <div className="login-image">
          <div className="login-video" />
          <video src="/video.mp4" autoPlay muted loop />
        </div>
      </div>
      {error && (
        <Notification
          title={error || urlError}
          type="float"
          variant="warning"
          icon="warning"
          isOpen={notificationOpen}
        />
      )}
      {success && (
        <Notification
          title={success}
          type="float"
          variant="success"
          icon="check_circle"
          isOpen={notificationOpen}
        />
      )}
    </>
  );
};
