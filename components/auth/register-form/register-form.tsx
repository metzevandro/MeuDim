// React e hooks
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Bibliotecas externas
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Componentes do design system
import {
  Button,
  Input,
  Link,
  Notification,
  InputCheckbox,
  Modal,
  FooterModal,
} from "design-system-zeroz";

// Módulos
import { RegisterSchema } from "@/schemas/index";
import { register } from "@/actions/register";
import { login } from "@/actions/login";
import { createInitialData } from "@/actions/createInitialData";

// Styles
import "./register-form.scss";

/**
 * O componente RegisterForm é um formulário para os usuários se registrarem na plataforma.
 * Ele utiliza o hook useForm do react-hook-form para gerenciar o estado do formulário e
 * o zod resolver para validar os dados do formulário com base no RegisterSchema.
 * O formulário possui 3 campos: nome, email e senha. Quando o formulário é enviado,
 * a função onSubmit é chamada, que executa a função register do módulo actions, passando
 * os dados do formulário como argumento. Se o registro for bem-sucedido, o usuário é
 * redirecionado para a página de login. Se houver um erro, a mensagem de erro é exibida
 * em uma notificação.
 */
export const RegisterForm = () => {
  const router = useRouter();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConfirmingConfirm, setIsConfirmingConfirm] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

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
      register(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);

            if (data.field === "email") {
              form.setError("email", { type: "manual", message: data.error });
            } else {
              form.setError("name", { type: "manual", message: data.error });
              form.setError("password", {
                type: "manual",
                message: data.error,
              });
            }
          } else if (data.success && data.userId) {
            setSuccess(data.success);
            setUserId(data.userId);
            setShowModal(true);
          }
          setNotificationOpen(true);
        })
        .catch((error) => {
          console.error(error);
          setError("Erro ao se registrar. Tente novamente mais tarde.");
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
      setError(
        "Erro ao processar sua solicitação. Tente novamente mais tarde.",
      );
    } finally {
      setIsConfirmingConfirm(false);
      setShowModal(false);
    }
  };

  const handleModalCancel = async () => {
    if (isConfirmingCancel) return; // Prevent cancel action during confirmation
    setIsConfirmingCancel(true); // Set "Não, obrigado" button to loading
    try {
      await loginUser();
    } catch (error) {
      console.error("Erro ao cancelar no modal:", error);
      setError(
        "Erro ao processar sua solicitação. Tente novamente mais tarde.",
      );
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
        setError(loginData.error);
      } else {
        setSuccess(loginData.success);
      }
    } catch (error) {}
  };

  const { errors } = form.formState;

  /**
   * A função navigateTo redireciona o usuário para a rota especificada.
   */
  const navigateTo = (route: string) => {
    router.push(route);
  };

  return (
    <>
      <div className="sign-up-page">
        <div className="sign-up-card">
          <div className="sign-up-form">
            <Image src="/MeuDim-Icon.svg" alt="MeuDim Icon" height={48} width={48} />
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
                  onChange={(e) => form.setValue("name", e.target.value)}
                  value={form.watch("name")}
                  label="Nome"
                  placeholder="Carlos Antônio"
                  error={!!errors.name}
                  textError={errors.name?.message || ""}
                />

                <Input
                  disabled={isPending}
                  onChange={(e) => form.setValue("email", e.target.value)}
                  value={form.watch("email")}
                  label="Email"
                  placeholder="carlos@gmail.com"
                  error={!!errors.email}
                  textError={errors.email?.message || ""}
                />

                <Input
                  disabled={isPending}
                  onChange={(e) => form.setValue("password", e.target.value)}
                  value={form.watch("password")}
                  label="Senha"
                  type="password"
                  placeholder="••••••••"
                  error={!!errors.password}
                  textError={errors.password?.message || ""}
                />

                <div style={{ width: "fit-content" }}>
                  <InputCheckbox
                    label="Concordo com os Termos e Privacidade."
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <footer>
                <Button
                  size="md"
                  variant={isPending ? "is-loading" : "primary"}
                  label="Criar conta"
                  type="submit"
                />
                <p onClick={() => navigateTo("/auth/login")}>
                  Já possui uma conta?
                  <Link content="Faça seu login." />
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
                variant={isConfirmingConfirm ? "is-loading" : "primary"}
                label="Confirmar"
                onClick={handleModalConfirm}
                disabled={isConfirmingCancel || isConfirmingConfirm}
              />
              <Button
                size="md"
                variant={isConfirmingCancel ? "is-loading" : "secondary"}
                label="Não, obrigado"
                onClick={handleModalCancel}
                disabled={isConfirmingCancel || isConfirmingConfirm}
              />
            </div>
          </FooterModal>
        }
      />
    </>
  );
};
