"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  AtualizarFonteDeRenda,
  CriarFonteDeRenda,
  ExcluirFonteDeRenda,
} from "@/actions/fonte-de-dinheiro";
import { NewCategorySchema } from "@/schemas";
import { z } from "zod";
import {
  Aside,
  AsideContent,
  AsideFooter,
  Button,
  ContentModal,
  DataTable,
  EmptyState,
  FooterModal,
  Input,
  Modal,
  Notification,
  Page,
} from "design-system-zeroz";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthProgress from "@/components/auth/Progress/progress";
import { useUser } from "@/data/provider";

const API = process.env.NEXT_PUBLIC_APP_URL;

export default function FonteDeRendaPage() {
  const { userData, skeleton, setUserData } = useUser();
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIdsForModal, setSelectedIdsForModal] = useState<string[]>([]);
  const [editAsideOpen, setEditAsideOpen] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [updateSelectedRows, setUpdateSelectedRows] = useState<
    ((ids: string[]) => void) | null
  >(null);
  const [loading, setLoading] = useState(0);
  const [loadingError, setLoadingError] = useState(false);

  async function fetchUserData() {
    try {
      const response = await fetch(`${API}/api/auth/session`);
      if (!response.ok) throw new Error("Failed to fetch user data");
      const userData = await response.json();
      setUserData(userData);
      setLoadingError(!userData?.user?.categories);
      setLoading(0);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoadingError(true);
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  const toggleAside = () => {
    setIsAsideOpen(!isAsideOpen);
    form.reset({ name: "" });
  };

  const toggleModal = (selectedIds: string[]) => {
    setSelectedIdsForModal(selectedIds);
    setModalOpen(!modalOpen);
  };

  const editingAside = (categoryId: string, category: any) => {
    setCurrentCategory(category);
    setEditAsideOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
    if (category) form.setValue("name", category.name || "");
  };

  const form = useForm<z.infer<typeof NewCategorySchema>>({
    resolver: zodResolver(NewCategorySchema),
  });

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
    if (success) {
      setTimeout(() => {
        setLoading(0);
      }, 500);
    }
  };

  const criar = async (values: z.infer<typeof NewCategorySchema>) => {
    setError("");
    setSuccess("");
    setLoadingError(false);

    const loadingInterval = startLoading();
    toggleAside();

    try {
      const data = await CriarFonteDeRenda({
        ...values,
        date: new Date(),
      });

      if (data.error) {
        setError(data.error);
        setSuccess("");
        setLoadingError(true);
        setNotificationOpen(true);
      } else {
        setError("");
        setSuccess(data.success);
        setNotificationOpen(true);
        await fetchUserData();
      }
    } catch (error) {
      console.error("Error creating income source:", error);
      setError("Ocorreu um erro ao criar a fonte de renda.");
      setLoadingError(true);
      setNotificationOpen(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };

  const atualizar = async (categoryId: string) => {
    setEditAsideOpen((prev) => ({ ...prev, [categoryId]: false }));
    setError("");
    setSuccess("");
    setLoadingError(false);

    const loadingInterval = startLoading();

    try {
      const data = await AtualizarFonteDeRenda(
        {
          ...form.getValues(),
          date: new Date(),
        },
        categoryId,
      );

      if (data.error) {
        setError(data.error);
        setSuccess("");
        setLoadingError(true);
        setNotificationOpen(true);
      } else {
        setError("");
        setSuccess(data.success);
        setNotificationOpen(true);
        await fetchUserData();
        setSelectedRows([]);
        if (updateSelectedRows) updateSelectedRows([]);
      }
    } catch (error) {
      console.error("Error updating income source:", error);
      setError("Ocorreu um erro ao atualizar a fonte de renda.");
      setLoadingError(true);
      setNotificationOpen(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };

  const excluir = async (categoryIds: string[]) => {
    setModalOpen(false);
    setError("");
    setSuccess("");
    setLoadingError(false);
    const loadingInterval = startLoading();

    try {
      const data = await ExcluirFonteDeRenda(categoryIds);

      if (data.error) {
        setError(data.error);
        setSuccess("");
        setLoadingError(true);
        setNotificationOpen(true);
      } else {
        setError("");
        setSuccess(data.success);
        setNotificationOpen(true);
        fetchUserData();
        setSelectedRows([]);
        if (updateSelectedRows) updateSelectedRows([]);
      }
    } catch (error) {
      setError("Ocorreu um erro ao excluir as fontes de renda.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };

  const columns: string[] = ["Data", "Fonte de Renda"];

  const data = userData?.user?.categories
    ? userData.user.categories.map((category: any) => ({
        id: category.id,
        Data: new Date(category.createdAt).toLocaleDateString("pt-BR"),
        "Fonte de Renda": category.name || "Sem nome",
      }))
    : [];

  const name = form.watch("name");
  const isFormValid = name;

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const userDataIsValid = userData && userData.user;

  const handleSelectedRowsChange = useCallback((rows: string[]) => {
    setSelectedRows(rows);
  }, []);

  const handleUpdateSelectedRows = useCallback(
    (updateSelectedRows: (ids: string[]) => void) => {
      setUpdateSelectedRows(() => updateSelectedRows);
    },
    [],
  );

  const renderEditAside = (categoryId: string) => (
    <Aside
      isOpen={editAsideOpen[categoryId] || false}
      toggleAside={() => {
        setEditAsideOpen((prev) => ({
          ...prev,
          [categoryId]: !prev[categoryId],
        }));
      }}
      content={
        <AsideContent>
          <Input
            value={form.watch("name") || ""}
            onChange={(e) => form.setValue("name", e.target.value)}
            label="Nome"
            placeholder="Ex: Investimentos"
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
              onClick={() => {
                setEditAsideOpen((prev) => ({
                  ...prev,
                  [categoryId]: false,
                }));
              }}
            />
          </div>
        </AsideFooter>
      }
      title="Editar fonte de renda"
      description="Edite a fonte de renda."
    />
  );

  return (
    <>
      <Page
        namePage="Fontes de renda"
        buttonContentPrimary="Adicionar"
        onClickActionPrimary={toggleAside}
        withActionPrimary={
          userDataIsValid ? userData.user.categories.length > 0 : undefined
        }
      >
        <AuthProgress loading={loading} error={loadingError} />
        {(userDataIsValid ? userData.user.categories.length < 1 : undefined) ? (
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
                title="Adicione as fontes de renda dos seus ganhos!"
                description="Indique a origem dos seus ganhos, como salário, investimentos ou outros, para manter um registro detalhado e preciso das suas entradas financeiras."
                icon="savings"
                buttonContentPrimary="Adicionar fonte de renda"
                onClickActionPrimary={toggleAside}
              />
            </div>
          </div>
        ) : (
          <DataTable
            skeleton={skeleton}
            rowsPerPage={5}
            columns={columns}
            data={data}
            withCheckbox={true}
            onSelectedRowsChange={handleSelectedRowsChange}
            onUpdateSelectedRows={handleUpdateSelectedRows}
            headerSelectedChildren={
              <>
                <Button
                  label="Excluir"
                  size="md"
                  variant="secondary"
                  typeIcon="delete"
                  onClick={() => toggleModal(selectedRows)}
                  disabled={selectedRows.length === 0}
                />
                {selectedRows.length === 1 && (
                  <Button
                    label="Editar"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      const selectedCategory = data.find(
                        (row) => row.id === selectedRows[0],
                      );
                      if (selectedCategory) {
                        editingAside(selectedRows[0], {
                          name: selectedCategory["Fonte de Renda"],
                        });
                      }
                    }}
                  />
                )}
              </>
            }
            textRowsSelected={`fonte${selectedRows.length > 1 ? "s" : ""} de renda selecionada${selectedRows.length > 1 ? "s" : ""}`}
          />
        )}
        <Aside
          isOpen={isAsideOpen}
          toggleAside={toggleAside}
          title="Adicionar fonte de renda"
          description="Crie uma fonte de renda para suas entradas financeiras."
          content={
            <AsideContent>
              <Input
                value={form.watch("name") || ""}
                onChange={(e) => form.setValue("name", e.target.value)}
                label="Nome"
                placeholder="Ex: Investimentos"
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
                  disabled={!isFormValid}
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
        <Modal
          hideModal={() => setModalOpen(false)}
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
                  onClick={() => {
                    excluir(selectedIdsForModal);
                    setModalOpen(false);
                  }}
                />
                <Button
                  size="md"
                  variant="secondary"
                  label="Cancelar"
                  onClick={() => setModalOpen(false)}
                />
              </div>
            </FooterModal>
          }
          content={
            <ContentModal>
              <p
                style={{
                  font: "var(--s-typography-paragraph-regular)",
                  color: "var(--s-color-content-light)",
                  whiteSpace: "normal",
                }}
              >
                {`Você está prestes a excluir ${selectedIdsForModal.length} fonte${selectedIdsForModal.length > 1 ? "s" : ""} de renda. Esta ação é irreversível.`}
              </p>
            </ContentModal>
          }
          title="Excluir fontes de renda"
          description={`Tem certeza de que deseja excluir ${selectedIdsForModal.length} fonte${selectedIdsForModal.length > 1 ? "s" : ""} de renda?`}
          isOpen={modalOpen}
          dismissible={true}
        />
        {renderEditAside(selectedRows[0])}
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
