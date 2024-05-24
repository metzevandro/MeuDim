"use client";
import "./reset-form.scss";
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

import { ResetSchema } from "@/schemas";
import { reset } from "@/actions/reset";

export const ResetForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    setSuccess("");
    setError("");

    startTransition(() => {
      reset(values).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  const { errors } = form.formState;

  return (
    <div className="card-reset">
      <Card>
        <h1>Esqueceu sua senha?</h1>
        <CardContent>
          <form className="form-reset" onSubmit={form.handleSubmit(onSubmit)}>
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
