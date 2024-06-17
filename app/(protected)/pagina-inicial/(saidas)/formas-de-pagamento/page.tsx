"use client";
import {
  AtualizarFormaDePagamento,
  CriarFormaDePagamento,
  ExcluirFormaDePagamento,
} from "@/actions/forma-de-pagamento";
import LayoutPage from "@/app/(protected)/_components/layout";
import { useCurrentUser } from "@/hooks/user-current-user";
import { NewCategorySchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Aside,
  EmptyState,
  Page,
  AsideFooter,
  Button,
  AsideContent,
  Input,
  DataTable,
  Notification,
  Modal,
  FooterModal,
  ButtonIcon,
  Skeleton,
} from "design-system-zeroz";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import "./forma-de-pagamento.scss";
import AuthProgress from "@/components/auth/Progress/progress";

interface FormaDePagamento {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}
interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  formaDePagamento: FormaDePagamento[];
}

interface UserData {
  user: User;
  expires: string;
}

const API = process.env.NEXT_PUBLIC_APP_URL;

export default function CategoryPage() {
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState<{ [key: string]: boolean }>({});
  const [editAsideOpen, setEditAsideOpen] = useState<{
    [key: string]: boolean;
  }>({});

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const form = useForm<z.infer<typeof NewCategorySchema>>({
    resolver: zodResolver(NewCategorySchema),
    defaultValues: {
      name: "",
      date: new Date(),
    },
  });

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(0);
  const [loadingError, setLoadingError] = useState(false);

  async function fetchUserData() {
    try {
      const response = await fetch(`${API}/api/auth/session`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();
      setUserData(userData);
      setLoading(0);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  const toggleAside = () => {
    setIsAsideOpen(!isAsideOpen);
  };

  const toggleModal = (categoryId: string) => {
    setModalOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const editingAside = (categoryId: string) => {
    setEditAsideOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const startLoading = () => {
    setLoading(0);
    const interval = setInterval(() => {
      setLoading((prevLoading) => {
        if (prevLoading >= 80) {
          clearInterval(interval);
          return prevLoading;
        }
        return prevLoading + 1;
      });
    }, 50);
    return interval;
  };

  const stopLoading = (interval: NodeJS.Timeout, success: boolean) => {
    clearInterval(interval);
    setLoading(success ? 100 : 0);
  };

  const criar = async (values: z.infer<typeof NewCategorySchema>) => {
    setError("");
    setSuccess("");
    toggleAside();
    setLoadingError(false);

    const loadingInterval = startLoading();
    try {
      const data = await CriarFormaDePagamento(values);
      if (data.error) {
        setError(data.error);
        setSuccess("");
        setNotificationOpen(true);
        setLoadingError(true);
      } else {
        setError("");
        setSuccess(data.success);
        setNotificationOpen(true);
      }
    } catch (error) {
      setError("Ocorreu um erro ao criar a categoria.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const atualizar = async (categoryId: string) => {
    setError("");
    setSuccess("");
    editingAside(categoryId);

    setLoadingError(false);

    const loadingInterval = startLoading();
    try {
      const data = await AtualizarFormaDePagamento(
        form.getValues(),
        categoryId,
      );
      if (data.error) {
        setError(data.error);
        setSuccess("");
        setNotificationOpen(true);
        setLoadingError(true);
      } else {
        setError("");
        setSuccess(data.success);
        setNotificationOpen(true);
      }
    } catch (error) {
      setError("Ocorreu um erro ao excluir a forma de pagamento.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const excluir = async (categoryId: string) => {
    setError("");
    setSuccess("");
    toggleModal(categoryId);
    setLoadingError(false);

    const loadingInterval = startLoading();
    try {
      const data = await ExcluirFormaDePagamento(categoryId);
      if (data.error) {
        setError(data.error);
        setSuccess("");
        setNotificationOpen(true);
        setLoadingError(true);
      } else {
        setError("");
        setSuccess(data.success);
        setNotificationOpen(true);
      }
    } catch (error) {
      setError("Ocorreu um erro ao excluir a fonte de renda.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const columns: string[] = ["Data", "Forma", "Ações"];

  const renderCategoryActions = (categoryId: string, categoryName: string) => (
    <div className="actions">
      <Button
        size="sm"
        variant="secondary"
        label="Editar"
        onClick={() => editingAside(categoryId)}
      />
      <Aside
        isOpen={editAsideOpen[categoryId] || false}
        toggleAside={() => editingAside(categoryId)}
        content={
          <AsideContent>
            <Input
              label="Nome"
              placeholder="Ex: Cartão de Crédito"
              value={form.watch("name") || categoryName || ""}
              onChange={(e) => form.setValue("name", e.target.value)}
            />
          </AsideContent>
        }
        footer={
          <AsideFooter>
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
                label="Atualizar"
                onClick={() => atualizar(categoryId)}
              />
              <Button
                size="md"
                variant="secondary"
                label="Cancelar"
                onClick={() => editingAside(categoryId)}
              />
            </div>
          </AsideFooter>
        }
        title="Editar forma de pagamento"
        description="Edite a forma de pagamento para os seus ganhos."
      />
      <ButtonIcon
        size="sm"
        type="default"
        typeIcon="delete"
        variant="warning"
        onClick={() => toggleModal(categoryId)}
      />
      <Modal
        hideModal={() => toggleModal(categoryId)}
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
                variant="warning"
                label="Excluir"
                onClick={() => excluir(categoryId)}
              />
              <Button
                size="md"
                variant="secondary"
                label="Cancelar"
                onClick={() => toggleModal(categoryId)}
              />
            </div>
          </FooterModal>
        }
        title="Excluir forma de pagamento"
        description="Você tem certeza que deseja excluir essa forma de pagamento?"
        isOpen={modalOpen[categoryId] || false}
        dismissible={true}
      />
    </div>
  );

  const userDataIsValid = userData && userData.user;

  const data: { [key: string]: any; id: string }[] = userData?.user
    ?.formaDePagamento
    ? userData?.user.formaDePagamento.map(
        (formaDePagamento: any, index: number) => {
          const formattedDate = new Date(
            formaDePagamento.createdAt,
          ).toLocaleDateString("pt-BR");

          return {
            id: formaDePagamento.id,
            Data: formattedDate,
            Forma: formaDePagamento.name,
            Ações: renderCategoryActions(
              formaDePagamento.id,
              formaDePagamento.name,
            ),
          };
        },
      )
    : [
        {
          id: "1",
          Data: <Skeleton height="32" width="100" />,
          Forma: <Skeleton height="32" width="100" />,
          Ações: (
            <div className="actions">
              <Skeleton height="32" width="65" />
              <Skeleton height="32" width="32" />
            </div>
          ),
        },
        {
          id: "2",
          Data: <Skeleton height="32" width="100" />,
          Forma: <Skeleton height="32" width="100" />,

          Ações: (
            <div className="actions">
              <Skeleton height="32" width="65" />
              <Skeleton height="32" width="32" />
            </div>
          ),
        },
        {
          id: "3",
          Data: <Skeleton height="32" width="100" />,
          Forma: <Skeleton height="32" width="100" />,

          Ações: (
            <div className="actions">
              <Skeleton height="32" width="65" />
              <Skeleton height="32" width="32" />
            </div>
          ),
        },
        {
          id: "4",
          Data: <Skeleton height="32" width="100" />,
          Forma: <Skeleton height="32" width="100" />,

          Ações: (
            <div className="actions">
              <Skeleton height="32" width="65" />
              <Skeleton height="32" width="32" />
            </div>
          ),
        },
      ];

  const expandedData: { [key: string]: any; id: string }[] = [];

  return (
    <>
      <Page
        namePage="Formas de pagamento"
        withActionPrimary={
          userDataIsValid
            ? userData.user.formaDePagamento.length > 0
            : undefined
        }
        buttonContentPrimary="Adicionar"
        onClickActionPrimary={toggleAside}
      >
        <AuthProgress loading={loading} error={loadingError} />

        {(
          userDataIsValid
            ? userData.user.formaDePagamento.length < 1
            : undefined
        ) ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                maxWidth: "700px",
              }}
            >
              <EmptyState
                title="Adicione as formas de pagamentos das suas despesas!"
                description="Indique a forma de pagamento utilizada nos seus pagamentos, seja em dinheiro, cartão ou transferência, para manter um registro detalhado e preciso das suas movimentações financeiras."
                icon="local_atm"
                buttonContentPrimary="Adicionar forma de pagamento"
                onClickActionPrimary={toggleAside}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "fit-content",
              overflow: "auto",
            }}
          >
            <DataTable
              labelSecondButton=""
              titleNoDataMessage="Não há dados"
              descriptionNoDataMessage="Não há dados ainda..."
              itemPerPage={10}
              pagesText="Página"
              columns={columns}
              data={data}
              expandedData={expandedData}
              selectable={false}
              expandable={false}
              inputPlaceholder="Procurar"
              typeIconSecondButton="filter_alt"
              selectableLabelSecondButton="Delete"
              selectableIconSecondButton="delete"
              asideTitle="Filters"
              firstButtonLabelAside="Aplicar"
              secondButtonLabelAside="Cancel"
              descriptionNoDataFilteredMessage="This option does not exist in your store, remove the filter and try again."
              labelButtonNoDataFilteredMessage="Remove filters"
              titleNoDataFilteredMessage="Your filter did not return any results."
            />
          </div>
        )}
        <Aside
          isOpen={isAsideOpen}
          toggleAside={toggleAside}
          title="Adicionar forma de pagamento"
          description="Crie uma forma de pagamento para suas despesas."
          content={
            <AsideContent>
              <Input
                value={form.watch("name") || ""}
                onChange={(e) => form.setValue("name", e.target.value)}
                label="Nome"
                placeholder="Ex: Cartão de Crédito"
              />
            </AsideContent>
          }
          footer={
            <AsideFooter>
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
                  label="Adicionar"
                  onClick={() => criar(form.getValues())}
                />
                <Button
                  size="md"
                  variant="secondary"
                  label="Cancelar"
                  onClick={toggleAside}
                />
              </div>
            </AsideFooter>
          }
        />
        {success && (
          <Notification
            icon="check_circle"
            title={success}
            variant="success"
            type="float"
            isOpen={notificationOpen}
          />
        )}
        {error && (
          <Notification
            icon="warning"
            title={error}
            variant="warning"
            type="float"
            isOpen={notificationOpen}
          />
        )}
      </Page>
    </>
  );
}
