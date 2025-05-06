"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Atualizar, Criar, Deletar } from "@/actions/transaction";
import { TransactionSchema } from "@/schemas/index";
import { z } from "zod";
import {
  Aside,
  AsideContent,
  AsideFooter,
  Button,
  ContentModal,
  DataPicker,
  DataTable,
  EmptyState,
  FooterModal,
  InputSelect,
  Modal,
  Notification,
  Page,
  Skeleton,
} from "design-system-zeroz";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import IntlCurrencyInput from "react-currency-input-field";
import AuthProgress from "@/components/auth/Progress/progress";
import { useUser } from "@/data/provider";

const API = process.env.NEXT_PUBLIC_APP_URL;

const HomePage = () => {
  const { userData, setUserData, skeleton } = useUser();
  const [isOpenAside, setIsOpenAside] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIdsForModal, setSelectedIdsForModal] = useState<string[]>([]);
  const [editAsideOpen, setEditAsideOpen] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
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

  const toggleModal = (selectedIds: string[]) => {
    setSelectedIdsForModal(selectedIds);
    setModalOpen(!modalOpen);
  };

  const editingAside = (transactionId: string, transaction: any) => {
    setCurrentTransaction(transaction);
    setEditAsideOpen((prev) => ({
      ...prev,
      [transactionId]: !prev[transactionId],
    }));

    if (transaction) {
      form.setValue("date", transaction.date || "");
      form.setValue("amount", transaction.amount || "");
      form.setValue(
        "category",
        transaction.category || userData?.user.categories[0]?.name || "",
      );
    }
  };

  const today = new Date().toLocaleDateString("pt-BR");

  const toggleAside = () => {
    setIsOpenAside(!isOpenAside);
    form.reset({
      date: today,
      amount: "",
      category: userData?.user.categories[0]?.name || "",
    });
  };

  const form = useForm<z.infer<typeof TransactionSchema>>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      date: today,
      amount: "",
      category: userData?.user.categories[0]?.name,
    },
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
  };

  const CriarGanho = async (values: z.infer<typeof TransactionSchema>) => {
    setError("");
    setSuccess("");
    setLoadingError(false);

    const loadingInterval = startLoading();
    toggleAside();

    try {
      const data = await Criar(values);

      if (data.error) {
        setNotificationOpen(true);
        setError(data.error);
        setSuccess("");
        setLoadingError(true);
        setLoading(100);
      } else {
        setError("");
        setLoading(100);
        setNotificationOpen(true);
        setSuccess(data.success);
        fetchUserData();
      }
    } catch (error) {
      setError("Ocorreu um erro ao criar o ganho");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const AtualizarGanho = async (transactionId: string) => {
    const loadingInterval = startLoading();
    setError("");
    setSuccess("");
    editingAside(transactionId, null);

    try {
      const data = await Atualizar(form.getValues(), transactionId);
      if (data.error) {
        setNotificationOpen(true);
        setError(data.error);
        setSuccess("");
        setLoadingError(true);
      } else {
        setError("");
        setSuccess(data.success);
        setNotificationOpen(true);
        fetchUserData();
        setSelectedRows([]);
        if (updateSelectedRows) updateSelectedRows([]);
      }
    } catch (error) {
      setError("Ocorreu um erro ao atualizar o ganho");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };

  const DeletarGanhos = async (transactionIds: string[]) => {
    setError("");
    setSuccess("");
    setLoadingError(false);
    const loadingInterval = startLoading();

    try {
      const data = await Deletar(transactionIds);

      if (data.error) {
        setNotificationOpen(true);
        setError(data.error);
        setSuccess("");
        setLoadingError(true);
      } else {
        setError("");
        setSuccess(data.success);
        setNotificationOpen(true);
        fetchUserData();
        setSelectedRows([]); // Clear checkboxes
        if (updateSelectedRows) updateSelectedRows([]);
      }
    } catch (error) {
      setError("Ocorreu um erro ao deletar os ganhos");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };

  const renderCategoryActions = (transactionId: string) => (
    <Aside
      isOpen={editAsideOpen[transactionId] || false}
      toggleAside={() => editingAside(transactionId, currentTransaction)}
      content={
        <AsideContent>
          <DataPicker
            onChange={(date) => form.setValue("date", date)}
            value={form.watch("date")}
            label="Data"
          />
          <div className="input-root">
            <div className="input-header">
              <label>Valor</label>
            </div>
            <div>
              <div className="input-content">
                <IntlCurrencyInput
                  placeholder="Ex: 100,00"
                  decimalsLimit={2}
                  value={form.watch("amount")}
                  onValueChange={(value) =>
                    form.setValue("amount", value || "0")
                  }
                  intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                  decimalSeparator=","
                />
              </div>
            </div>
          </div>
          <InputSelect
            value={form.watch("category") || ""}
            onChange={(value: string) => form.setValue("category", value || "")}
            options={
              userData?.user.categories.map((category: any) => category.name) ||
              []
            }
            label="Fonte de Renda"
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
              onClick={() => AtualizarGanho(transactionId)}
            />
            <Button
              size="md"
              variant="secondary"
              label="Cancelar"
              onClick={() => editingAside(transactionId, currentTransaction)}
            />
          </div>
        </AsideFooter>
      }
      title="Editar ganho"
      description="Edite o ganho."
    />
  );

  const columns: string[] = ["Data", "Valor", "Fonte de Renda"];

  const userDataIsValid = userData && userData.user;

  const data: { [key: string]: any; id: string }[] = userData?.user
    ?.transactions
    ? userData?.user.transactions
        .slice()
        .reverse()
        .map((transaction: any) => {
          const formattedAmount = parseFloat(transaction.amount).toLocaleString(
            "pt-BR",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          );
          const formattedDate = new Date(
            transaction.createdAt,
          ).toLocaleDateString("pt-BR");
          const category = userData?.user.categories.find(
            (cat: any) => cat.id === transaction.categoryId,
          );
          const categoryName = category ? category.name : "Fonte Desconhecida";

          return {
            id: transaction.id,
            Data: formattedDate,
            Valor: "R$ " + formattedAmount,
            "Fonte de Renda": categoryName,
          };
        })
    : [];

  const date = form.watch("date");
  const amount = form.watch("amount");
  const category = form.watch("category");

  const isFormValid = date && amount && category;

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleUpdateSelectedRows = useCallback((updateSelectedRows: any) => {
    setUpdateSelectedRows(() => updateSelectedRows);
  }, []);

  return (
    <>
      <Page
        onClickActionPrimary={toggleAside}
        withActionPrimary={
          userDataIsValid ? userData.user.transactions.length > 0 : undefined
        }
        buttonContentPrimary="Adicionar"
        namePage="Seus ganhos"
      >
        <AuthProgress loading={loading} error={loadingError} />
        {(
          userDataIsValid ? userData.user.transactions.length < 1 : undefined
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
                maxWidth: "500px",
              }}
            >
              <EmptyState
                title="Adicione todos os seus ganhos!"
                description="Quando receber seu salário ou qualquer outro dinheiro, adicione-o como um ganho para manter suas finanças organizadas."
                icon="trending_up"
                buttonContentPrimary="Adicionar ganho"
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
            }}
          >
            <DataTable
              textRowsSelected={`ganho${selectedRows.length > 1 ? "s" : ""} selecionado${selectedRows.length > 1 ? "s" : ""}`}
              rowsPerPage={5}
              columns={columns}
              data={data}
              withCheckbox={true}
              skeleton={skeleton}
              onUpdateSelectedRows={handleUpdateSelectedRows}
              onSelectedRowsChange={(rows: string[]) => setSelectedRows(rows)}
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
                        const selectedTransaction = data.find(
                          (row) => row.id === selectedRows[0],
                        );
                        if (selectedTransaction) {
                          editingAside(selectedRows[0], {
                            date: selectedTransaction.Data,
                            amount: selectedTransaction.Valor.replace("R$ ", "")
                              .replace(".", "")
                              .replace(",", "."),
                            category: selectedTransaction["Fonte de Renda"],
                          });
                        }
                      }}
                    />
                  )}
                </>
              }
            />
          </div>
        )}
        <Aside
          isOpen={isOpenAside}
          toggleAside={toggleAside}
          title="Adicionar ganho"
          description="Preencha detalhadamente o seu ganho."
          content={
            <AsideContent>
              <DataPicker
                onChange={(date) => form.setValue("date", date)}
                value={form.watch("date")}
                label="Data"
              />
              <div className="input-root">
                <div className="input-header">
                  <label>Valor</label>
                </div>
                <div>
                  <div className="input-content">
                    <IntlCurrencyInput
                      placeholder="Ex: 100,00"
                      decimalsLimit={2}
                      value={form.watch("amount")}
                      onValueChange={(value) =>
                        form.setValue("amount", value || "0")
                      }
                      intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                      decimalSeparator=","
                    />
                  </div>
                </div>
              </div>
              <InputSelect
                value={form.watch("category") || ""}
                onChange={(value: string) =>
                  form.setValue("category", value || "")
                }
                options={
                  userData?.user.categories.map(
                    (category: any) => category.name,
                  ) || []
                }
                label="Fonte de Renda"
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
                  onClick={() => CriarGanho(form.getValues())}
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
                  DeletarGanhos(selectedIdsForModal);
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
              {`Você está prestes a excluir ${selectedIdsForModal.length} ganho${selectedIdsForModal.length > 1 ? "s" : ""}. Esta ação é irreversível e você perderá todo o histórico dos ganhos selecionados.`}
            </p>
          </ContentModal>
        }
        title="Excluir ganhos"
        description={`Tem certeza de que deseja excluir ${selectedIdsForModal.length} ganho${selectedIdsForModal.length > 1 ? "s" : ""}?`}
        isOpen={modalOpen}
        dismissible={true}
      />
      {renderCategoryActions(selectedRows[0])}
    </>
  );
};

export default HomePage;
