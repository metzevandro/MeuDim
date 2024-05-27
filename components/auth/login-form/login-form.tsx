"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React from "react";

import {
  Input,
  Button,
  Link,
  Card,
  CardContent,
  Notification,
} from "design-system-zeroz";

import "./login-form.scss";
import { LoginSchema } from "@/schemas";
import { login } from "@/actions/login";
import { useSearchParams } from "next/navigation";

export const LoginForm = () => {
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
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  const { errors } = form.formState;

  return (
    <div className="card-login">
      <Card>
        <h1>Login</h1>
        <CardContent>
          <p>
            Não tem uma conta?
            <Link content="Crie a sua conta." href="/auth/criar-conta"></Link>
          </p>
          <form className="form-login" onSubmit={form.handleSubmit(onSubmit)}>
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
                placeholder="exemplo@email.com"
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
                placeholder="Ex: 12345678"
              />
            </div>
            {error && (
              <Notification
                title={error || urlError}
                type="inline"
                variant="warning"
                icon="warning"
              />
            )}
            {success && (
              <Notification
                title={success}
                type="inline"
                variant="success"
                icon="check_circle"
              />
            )}
            <Button
              disabled={isPending}
              label="Entrar"
              variant="primary"
              size="md"
              type="submit"
            />
          </form>
        </CardContent>
      </Card>
      <Link href="/auth/reset" content="Esqueceu sua senha?"></Link>
    </div>
  );
};
