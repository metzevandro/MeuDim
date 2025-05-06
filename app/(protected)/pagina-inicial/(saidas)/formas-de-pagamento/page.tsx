"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  AtualizarFormaDePagamento,
  CriarFormaDePagamento,
  ExcluirFormaDePagamento,
} from "@/actions/forma-de-pagamento";
import { FormaDePagamentoSchema } from "@/schemas";
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
  Skeleton,
} from "design-system-zeroz";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthProgress from "@/components/auth/Progress/progress";
import { useUser } from "@/data/provider";

const API = process.env.NEXT_PUBLIC_APP_URL;

export default function CategoryPage() {
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
      setLoadingError(!userData?.user?.formaDePagamento);
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

  const form = useForm<z.infer<typeof FormaDePagamentoSchema>>({
    resolver: zodResolver(FormaDePagamentoSchema),
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

  const criar = async (values: z.infer<typeof FormaDePagamentoSchema>) => {
    setError("");
    setSuccess("");
    setLoadingError(false);

    const loadingInterval = startLoading();
    toggleAside();

    try {
      const data = await CriarFormaDePagamento({
        ...values,
        date: new Date(),
      });

      if (data.error) {
        setError(data.error);
        setSuccess("");
        setLoadingError(true);
      } else {
        setError("");
        setSuccess(data.success);
        await fetchUserData();
      }
    } catch (error) {
      console.error("Error creating payment method:", error);
      setError("Erro desconhecido ao criar a forma de pagamento.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };

  const atualizar = async (formaDePagamentoId: string) => {
    setEditAsideOpen((prev) => ({ ...prev, [formaDePagamentoId]: false }));
    setError("");
    setSuccess("");
    setLoadingError(false);

    const loadingInterval = startLoading();

    try {
      const data = await AtualizarFormaDePagamento(
        {
          ...form.getValues(),
          date: new Date(),
        },
        formaDePagamentoId,
      );

      if (data.error) {
        setError(data.error);
        setSuccess("");
        setLoadingError(true);
      } else {
        setError("");
        setSuccess(data.success);
        await fetchUserData();
        setSelectedRows([]);
        if (updateSelectedRows) updateSelectedRows([]);
      }
    } catch (error) {
      console.error("Error updating payment method:", error);
      setError("Erro desconhecido ao atualizar a forma de pagamento.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, true); // Ensure loading reaches 100%
    }
  };

  const excluir = async (formaDePagamentoIds: string[]) => {
    setModalOpen(false);
    setError("");
    setSuccess("");
    setLoadingError(false);
    const loadingInterval = startLoading();

    try {
      const data = await ExcluirFormaDePagamento(formaDePagamentoIds);

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
      setError("Erro desconhecido ao excluir as formas de pagamento.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };

  const columns: string[] = ["Data", "Forma de Pagamento"];

  const data = userData?.user?.formaDePagamento
    ? userData.user.formaDePagamento.map((formaDePagamento: any) => ({
        id: formaDePagamento.id,
        Data: new Date(formaDePagamento.createdAt).toLocaleDateString("pt-BR"),
        "Forma de Pagamento": formaDePagamento.name || "Sem nome",
      }))
    : [];

  const name = form.watch("name");
  const isFormValid = name;

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const userDataIsValid = userData && userData.user;

  const handleSelectedRowsChange = useCallback((rows: string[]) => {
    setSelectedRows(rows);
  }, []); // Memoized para evitar re-renderizações desnecessárias

  const handleUpdateSelectedRows = useCallback(
    (updateSelectedRows: (ids: string[]) => void) => {
      setUpdateSelectedRows(() => updateSelectedRows);
    },
    [], // Certifique-se de que o callback é memoizado
  );

  const renderEditAside = (formaDePagamentoId: string) => (
    <Aside
      isOpen={editAsideOpen[formaDePagamentoId] || false}
      toggleAside={() => {
        setEditAsideOpen((prev) => ({
          ...prev,
          [formaDePagamentoId]: !prev[formaDePagamentoId],
        }));
      }}
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
              label="Atualizar"
              onClick={() => atualizar(formaDePagamentoId)}
            />
            <Button
              size="md"
              variant="secondary"
              label="Cancelar"
              onClick={() => {
                setEditAsideOpen((prev) => ({
                  ...prev,
                  [formaDePagamentoId]: false,
                }));
              }}
            />
          </div>
        </AsideFooter>
      }
      title="Editar forma de pagamento"
      description="Edite a forma de pagamento."
    />
  );

  return (
    <>
      <Page
        namePage="Formas de pagamento"
        buttonContentPrimary="Adicionar"
        onClickActionPrimary={toggleAside}
        withActionPrimary={
          userDataIsValid
            ? userData.user.formaDePagamento.length > 0
            : undefined
        }
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
                          name: selectedCategory["Forma de Pagamento"],
                        });
                      }
                    }}
                  />
                )}
              </>
            }
            textRowsSelected={`forma${selectedRows.length > 1 ? "s" : ""} de pagamento selecionada${selectedRows.length > 1 ? "s" : ""}`}
          />
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
                {`Você está prestes a excluir ${selectedIdsForModal.length} forma${selectedIdsForModal.length > 1 ? "s" : ""} de pagamento. Esta ação é irreversível.`}
              </p>
            </ContentModal>
          }
          title="Excluir formas de pagamento"
          description={`Tem certeza de que deseja excluir ${selectedIdsForModal.length} forma${selectedIdsForModal.length > 1 ? "s" : ""} de pagamento?`}
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
