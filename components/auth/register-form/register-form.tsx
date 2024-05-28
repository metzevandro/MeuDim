import {
  Button,
  Card,
  CardContent,
  Input,
  Link,
  Notification,
} from "design-system-zeroz";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import "./register-form.scss";
import { RegisterSchema } from "@/schemas/index";
import { useState, useTransition } from "react";
import { register } from "@/actions/register";
import React from "react";
import { useRouter } from "next/navigation";

export const RegisterForm = () => {
  const router = useRouter();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setSuccess("");
    setError("");

    startTransition(() => {
      register(values).then((data) => {
        setNotificationOpen(true);
        setError(data.error), setSuccess(data.success);
        console.log(error);
        if (data.success) {
          router.push("/auth/login");
        }
      });
    });
  };

  const { errors } = form.formState;

  return (
    <div className="card-sign-up">
      <Card>
        <h1>Criar Conta</h1>
        <CardContent>
          <p>
            Já tem uma conta?{" "}
            <Link content="Faça seu login." href="/auth/login" />
          </p>
          <form className="form-sign-up" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="input-field">
              <Input
                disabled={isPending}
                onChange={(e) => form.setValue("name", e.target.value)}
                value={form.watch("name")}
                label="Nome"
                placeholder="Ex: Alberto Guerra"
                error={!!errors.name}
                textError={errors.name?.message || ""}
              />

              <Input
                disabled={isPending}
                onChange={(e) => form.setValue("email", e.target.value)}
                value={form.watch("email")}
                label="Email"
                placeholder="Ex: example@gmail.com"
                error={!!errors.email}
                textError={errors.email?.message || ""}
              />

              <Input
                disabled={isPending}
                onChange={(e) => form.setValue("password", e.target.value)}
                value={form.watch("password")}
                label="Senha"
                type="password"
                placeholder="Ex: 12345678"
                error={!!errors.password}
                textError={errors.password?.message || ""}
              />
            </div>
            {error && (
              <Notification
                title={error}
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
            <Button
              size="md"
              variant="primary"
              label="Criar conta"
              type="submit"
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
