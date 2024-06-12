"use client";
import React, { useEffect, useState } from "react";
import {
  Aside,
  AsideContent,
  AsideFooter,
  Button,
  ButtonIcon,
  DataTable,
  EmptyState,
  FooterModal,
  Input,
  Modal,
  Notification,
  Page,
  Skeleton,
} from "design-system-zeroz";
import {
  AtualizarFonteDeRenda,
  CriarFonteDeRenda,
  ExcluirFonteDeRenda,
} from "@/actions/fonte-de-dinheiro";
import { NewCategorySchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import "./fonte-de-renda.scss";
import AuthProgress from "@/components/auth/Progress/progress";

interface UserData {
  user: {
    name: string;
    email: string;
    image: string | null;
    id: string;
    role: string;
    categories: {
      id: string;
      name: string;
      userId: string;
      createdAt: string;
    }[];
    transactions: {
      id: string;
      name: string;
      createdAt: string;
      userId: string;
      categories: {
        id: string;
        name: string;
        userId: string;
        createdAt: string;
      };
    };
  };
  expires: string;
}

const API = process.env.NEXT_PUBLIC_APP_URL;

export default function Categorias() {
  const [isOpenAside, setIsOpenAside] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState<{ [key: string]: boolean }>({});
  const [editFormStates, setEditFormStates] = useState<{ [key: string]: any }>(
    {},
  );
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
    setIsOpenAside(!isOpenAside);
    form.reset({ name: "", date: new Date() });
  };

  const toggleModal = (categoryId: string) => {
    setModalOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const editingAside = (categoryId: string, categoryName: string) => {
    setEditFormStates((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        isOpen: !prev[categoryId]?.isOpen,
        name: prev[categoryId]?.isOpen ? prev[categoryId]?.name : categoryName,
      },
    }));

    if (!editFormStates[categoryId]?.isOpen) {
      form.reset({ name: categoryName, date: new Date() });
    }
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

  const onSubmit = async (values: z.infer<typeof NewCategorySchema>) => {
    setError("");
    setSuccess("");
    toggleAside();
    setLoadingError(false);

    const loadingInterval = startLoading();

    try {
      const data = await CriarFonteDeRenda(values);
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
      setError("Ocorreu um erro ao criar a fonte de renda.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const atualizarCategoria = async (
    categoryId: string,
    categoryName: string,
  ) => {
    setError("");
    setSuccess("");
    setLoadingError(false);
    editingAside(categoryId, categoryName);

    const loadingInterval = startLoading();

    try {
      const values = form.getValues();
      const data = await AtualizarFonteDeRenda(values, categoryId);
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
      setError("Ocorreu um erro ao atualizar a fonte de renda.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const onDeleteCategory = async (categoryId: string) => {
    setError("");
    setSuccess("");
    toggleModal(categoryId);
    setLoadingError(false);

    const loadingInterval = startLoading();

    try {
      const data = await ExcluirFonteDeRenda(categoryId);
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

  const { errors } = form.formState;

  const renderCategoryActions = (categoryId: string, categoryName: string) => (
    <div className="actions">
      <Button
        size="sm"
        variant="secondary"
        label="Editar"
        onClick={() => editingAside(categoryId, categoryName)}
      />
      <Aside
        isOpen={editFormStates[categoryId]?.isOpen || false}
        toggleAside={() => editingAside(categoryId, categoryName)}
        content={
          <AsideContent>
            <Input
              label="Nome"
              placeholder="Ex: Investimentos"
              value={form.watch("name") || ""}
              onChange={(e) => form.setValue("name", e.target.value)}
              error={!!errors.name}
              textError={errors.name?.message}
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
                onClick={() => atualizarCategoria(categoryId, categoryName)}
              />
              <Button
                size="md"
                variant="secondary"
                label="Cancelar"
                onClick={() => editingAside(categoryId, categoryName)}
              />
            </div>
          </AsideFooter>
        }
        title="Editar fonte de renda"
        description="Edite a fonte de renda para os seus ganhos."
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
                onClick={() => onDeleteCategory(categoryId)}
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
        title="Excluir fonte de renda"
        description="Você tem certeza que deseja excluir essa fonte de renda?"
        isOpen={modalOpen[categoryId] || false}
        dismissible={true}
      />
    </div>
  );

  const columns: string[] = ["Data", "Fonte", "Ações"];

  const userDataIsValid = userData && userData.user;

  const data =
    userDataIsValid && userData.user.categories
      ? userData.user.categories.map((category, index) => {
          const formattedDate = new Date(
            category?.createdAt,
          ).toLocaleDateString("pt-BR");

          return {
            id: category.id,
            Data: formattedDate,
            Fonte: category?.name,
            Ações: renderCategoryActions(category.id, category.name),
          };
        })
      : [
          {
            id: "1",
            Data: <Skeleton height="32" width="100" />,
            Fonte: <Skeleton height="32" width="100" />,
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
            Fonte: <Skeleton height="32" width="100" />,
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
            Fonte: <Skeleton height="32" width="100" />,
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
            Fonte: <Skeleton height="32" width="100" />,
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
        buttonContentPrimary="Adicionar"
        columnLayout="1"
        namePage="Fonte de renda"
        withActionPrimary={
          userDataIsValid ? userData.user.categories.length > 0 : undefined
        }
        onClickActionPrimary={toggleAside}
      >
        <AuthProgress loading={loading} error={loadingError} />
        {(userDataIsValid ? userData.user.categories.length < 1 : undefined) ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                maxWidth: "600px",
                overflow: "auto",
              }}
            >
              <EmptyState
                title="Informe a fonte de renda dos seus ganhos!"
                description="Registre uma nova fonte de renda para classificar os pagamentos ou valores que receber, garantindo que seu controle financeiro esteja sempre atualizado."
                icon="savings"
                buttonContentPrimary="Adicionar fonte de renda"
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
            overflow: 'auto'
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
          isOpen={isOpenAside}
          toggleAside={toggleAside}
          title="Adicionar fonte de renda"
          description="Crie uma fonte de renda para os seus ganhos."
          content={
            <AsideContent>
              <Input
                label="Nome"
                placeholder="Ex: Investimentos"
                value={form.watch("name") || ""}
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
                  label="Adicionar"
                  onClick={() => onSubmit(form.getValues())}
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
      </Page>
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
    </>
  );
}
