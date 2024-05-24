"use client";
import "./nova-senha-form.scss";
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

import { NovaSenhaSchema } from "@/schemas";
import { novaSenha } from "@/actions/nova-senha";
import { useSearchParams } from "next/navigation";

export const NovaSenhaForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof NovaSenhaSchema>>({
    resolver: zodResolver(NovaSenhaSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NovaSenhaSchema>) => {
    setSuccess("");
    setError("");

    startTransition(() => {
      novaSenha(values, token).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  const { errors } = form.formState;

  return (
    <div className="card-nova-senha">
      <Card>
        <h1>Nova senha</h1>
        <CardContent>
          <form
            className="form-nova-senha"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="input-field">
              <Input
                disabled={isPending}
                name="email"
                textError={errors.password?.message}
                error={!!errors.password}
                onChange={(e) => form.setValue("password", e.target.value)}
                value={form.watch("password")}
                label="Nova senha"
                type="password"
                placeholder="********"
              />
            </div>
            {error && (
              <Notification
                title={error}
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
              label="Redefinir senha"
              variant="primary"
              size="md"
              type="submit"
            />
          </form>
        </CardContent>
      </Card>
      <Link href="/auth/login" content="Voltar para o login"></Link>
    </div>
  );
};
