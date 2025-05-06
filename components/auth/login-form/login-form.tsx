import React, { useState, useTransition, forwardRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input, Button, Link, Notification } from "design-system-zeroz";

import { LoginSchema } from "@/schemas";
import { login } from "@/actions/login";

import "./login-form.scss";

const InputWithRef = forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>((props, ref) => (
  <Input {...props} inputRef={ref} />
));

export const LoginForm = forwardRef<HTMLDivElement>((props, ref) => {
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
        if (data && data.error) {
          setError(data.error);
          form.setError("email", { type: "manual", message: data.error });
          form.setError("password", { type: "manual", message: data.error });
        } else if (data && data.success) {
          setSuccess(data.success);
        }
        setNotificationOpen(true);
      });
    });
  };

  const { errors } = form.formState;

  const router = useRouter();

  const navigateTo = (route: string) => {
    router.push(route);
  };

  return (
    <>
      <div className="login-page" ref={ref}>
        <div className="login-card">
          <div className="login-form">
            {/* <img src="/MeuDim-Icon.svg" alt="" height={48} /> */}
            <header>
              <h1>Que bom ter você de volta</h1>
            </header>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="input-field">
                <InputWithRef
                  disabled={isPending}
                  error={!!errors.email}
                  {...form.register("email")}
                  label="E-mail"
                  type="email"
                  placeholder="carlos@gmail.com"
                  name="email"
                  onChange={(e) => form.setValue("email", e.target.value)}
                  autoComplete="email"
                />
                <InputWithRef
                  disabled={isPending}
                  textError={errors.password?.message}
                  error={!!errors.password}
                  {...form.register("password")}
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  name="password"
                  onChange={(e) => form.setValue("password", e.target.value)}
                  value={form.watch("password")}
                  autoComplete="current-password"
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
          <video
            src="/video.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
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
});
