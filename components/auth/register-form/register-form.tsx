import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Button,
  Input,
  Link,
  Modal,
  FooterModal,
  Checkbox,
} from "design-system-zeroz";

import { registerSchema } from "@/schemas/index";
import { register } from "@/actions/auth/register";
import { login } from "@/actions/auth/login";
import { createInitialData } from "@/actions/account/createInitialAccountData";

import "./register-form.scss";
import { AppNotification } from "@/components/notification/AppNotification";

export const RegisterForm = () => {
  const router = useRouter();
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    isError: boolean;
  }>({ open: false, message: "", isError: false });

  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConfirmingConfirm, setIsConfirmingConfirm] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    startTransition(() => {
      register(values)
        .then((data) => {
          if (data.error) {
            if (data.field === "email") {
              form.setError("email", { type: "manual", message: data.error });
            } else {
              form.setError("name", { type: "manual", message: data.error });
              form.setError("password", {
                type: "manual",
                message: data.error,
              });
            }
            setNotification({
              open: true,
              message: data.error,
              isError: true,
            });
          } else if (data.success && data.userId) {
            setUserId(data.userId);
            setShowModal(true);
            setNotification({
              open: true,
              message: data.success,
              isError: false,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          setNotification({
            open: true,
            message: "Erro ao se registrar. Tente novamente mais tarde.",
            isError: true,
          });
        });
    });
  };

  const handleModalConfirm = async () => {
    setIsConfirmingConfirm(true);
    try {
      if (userId) {
        await createInitialData(userId);
      }
      await loginUser();
    } catch (error) {
      console.error("Erro ao confirmar no modal:", error);
      setNotification({
        open: true,
        message: "Erro ao processar sua solicitação. Tente novamente mais tarde.",
        isError: true,
      });
    } finally {
      setIsConfirmingConfirm(false);
      setShowModal(false);
    }
  };

  const handleModalCancel = async () => {
    if (isConfirmingCancel) return;
    setIsConfirmingCancel(true);
    try {
      await loginUser();
    } catch (error) {
      console.error("Erro ao cancelar no modal:", error);
      setNotification({
        open: true,
        message: "Erro ao processar sua solicitação. Tente novamente mais tarde.",
        isError: true,
      });
    } finally {
      setIsConfirmingCancel(false);
      setShowModal(false);
    }
  };

  const loginUser = async () => {
    try {
      const values = form.getValues();
      const loginData = await login(values);
      if (loginData.error) {
        setNotification({
          open: true,
          message: loginData.error,
          isError: true,
        });
      } else if (loginData.success) {
        setNotification({
          open: true,
          message: loginData.success,
          isError: false,
        });
      }
    } catch (error) {}
  };

  const { errors } = form.formState;

  const navigateTo = (route: string) => {
    router.push(route);
  };

  return (
    <>
      <div className="sign-up-page">
        <div className="sign-up-card">
          <div className="sign-up-form">
            <Image
              src="/MeuDim-Icon.svg"
              alt="MeuDim Icon"
              height={48}
              width={48}
            />
            <header>
              <h1>Crie sua conta grátis</h1>
              <p>
                Crie sua conta grátis e comece a organizar o seu controle
                financeiro.
              </p>
            </header>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="input-field">
                <Input
                  disabled={isPending}
                  onChange={(e: any) => form.setValue("name", e.target.value)}
                  value={form.watch("name")}
                  label="Nome"
                  placeholder="Carlos Antônio"
                  error={!!errors.name}
                  textError={errors.name?.message || ""}
                />

                <Input
                  disabled={isPending}
                  onChange={(e: any) => form.setValue("email", e.target.value)}
                  value={form.watch("email")}
                  label="Email"
                  placeholder="carlos@gmail.com"
                  error={!!errors.email}
                  textError={errors.email?.message || ""}
                />

                <Input
                  disabled={isPending}
                  onChange={(e: any) =>
                    form.setValue("password", e.target.value)
                  }
                  value={form.watch("password")}
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  error={!!errors.password}
                  textError={errors.password?.message || ""}
                />

                <div style={{ width: "fit-content" }}>
                  <Checkbox
                    label="Concordo com os Termos e Privacidade."
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <footer>
                <Button
                  size="md"
                  variant="primary"
                  isLoading={isPending}
                  type="submit"
                >
                  Criar conta
                </Button>
                <p onClick={() => navigateTo("/auth/login")}>
                  Já possui uma conta?
                  <Link>Faça seu login.</Link>
                </p>
              </footer>
            </form>
          </div>
        </div>
        <div className="sign-up-image">
          <div className="sign-up-video" />
          <video
            src="/video.mp4"
            autoPlay
            muted
            loop
            playsInline
            webkit-playsinline
          />
        </div>
      </div>

      <AppNotification
        isOpen={notification.open}
        message={notification.message}
        isError={notification.isError}
        onClose={closeNotification}
      />

      <Modal
        title="Deseja pré-cadastrar dados iniciais?"
        description="Categorias, subcategorias, fontes de renda e formas de pagamento serão criadas automaticamente."
        hideModal={() => setShowModal(false)}
        isOpen={showModal}
        dismissible={false}
        footer={
          <FooterModal>
            <div
              style={{
                width: "min-content",
                display: "flex",
                gap: "var(--s-spacing-x-small)",
              }}
            >
              <Button
                size="md"
                variant="primary"
                isLoading={isConfirmingConfirm}
                onClick={handleModalConfirm}
                disabled={isConfirmingCancel || isConfirmingConfirm}
              >
                Confirmar
              </Button>
              <Button
                size="md"
                variant="secondary"
                onClick={handleModalCancel}
                disabled={isConfirmingCancel || isConfirmingConfirm}
              >
                Não, obrigado.
              </Button>
            </div>
          </FooterModal>
        }
      />
    </>
  );
};