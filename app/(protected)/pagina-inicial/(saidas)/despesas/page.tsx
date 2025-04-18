"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Atualizar, Criar, Deletar } from "@/actions/expense";
import { ExpenseSchema } from "@/schemas/index";
import { z } from "zod";
import {
  Aside,
  AsideContent,
  AsideFooter,
  Button,
  ButtonIcon,
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

import "./despesas.scss";
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

  const [subcategorias, setSubcategorias] = useState<string[]>([]);
  const [currentexpense, setCurrentexpense] = useState<any>(null);
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

  const editingAside = (categoryId: string, expense: any) => {
    setCurrentexpense(expense);
    setEditAsideOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

    if (expense) {
      const formattedAmount =
        typeof expense.amount === "string"
          ? parseFloat(expense.amount).toFixed(2).replace(".", ",")
          : expense.amount?.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0,00";

      form.setValue("data", expense.date || "");
      form.setValue("valor", formattedAmount);
      form.setValue("categoria", expense.category || "");
      form.setValue(
        "formaDePagamento",
        expense.FormaDePagamento ||
          expense.formaDePagamento ||
          userData?.user.formaDePagamento[0]?.name ||
          "",
      );
      form.setValue(
        "subcategoria",
        expense.Subcategoria || expense.subcategoria || "",
      );
    }
  };

  const today = new Date().toLocaleDateString("pt-BR");

  const toggleAside = () => {
    setIsOpenAside(!isOpenAside);
    form.reset({
      data: today,
      valor: "",
      formaDePagamento: userData?.user.formaDePagamento[0]?.name || "",
      categoria: userData?.user.categoria[0]?.name || "",
      subcategoria: userData?.user.categoria[0]?.subcategorias?.[0]?.name || "",
    });
  };

  const form = useForm<z.infer<typeof ExpenseSchema>>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      data: today,
      valor: "",
      formaDePagamento: userData?.user.formaDePagamento[0]?.name,
      categoria: userData?.user.categoria[0]?.name,
      subcategoria: subcategorias[0] || "",
    },
  });

  useEffect(() => {
    const categoriaSelecionada = userData?.user?.categoria.find(
      (categoria: any) => categoria.name === form.getValues("categoria"), // Use form.getValues instead of form.watch
    );

    if (categoriaSelecionada) {
      const novasSubcategorias = categoriaSelecionada.subcategorias.map(
        (subcategoria: any) => subcategoria.name,
      );

      if (
        JSON.stringify(novasSubcategorias) !== JSON.stringify(subcategorias)
      ) {
        setSubcategorias(novasSubcategorias);
        if (form.getValues("subcategoria") !== novasSubcategorias[0]) {
          form.setValue("subcategoria", novasSubcategorias[0] || "");
        }
      }
    } else if (subcategorias.length > 0) {
      setSubcategorias([]);
      if (form.getValues("subcategoria") !== "") {
        form.setValue("subcategoria", "");
      }
    }
  }, [userData?.user?.categoria, form, subcategorias]); // Adjust dependencies to avoid unnecessary re-renders

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

  const CriarDespesa = async (values: z.infer<typeof ExpenseSchema>) => {
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
      setError("Ocorreu um erro ao criar a despesa");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const AtualizarDespesa = async (categoryId: string) => {
    const loadingInterval = startLoading();
    setError("");
    setSuccess("");
    editingAside(categoryId, null);

    try {
      const data = await Atualizar(form.getValues(), categoryId);
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
        setSelectedRows([]); // Limpa as checkboxes
        if (updateSelectedRows) updateSelectedRows([]);
      }
    } catch (error) {
      setError("Ocorreu um erro ao atualizar a despesa");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };

  const DeletarDespesas = async (expenseIds: string[]) => {
    setError("");
    setSuccess("");
    const loadingInterval = startLoading();

    try {
      const result = await Deletar(expenseIds);

      if (result.error) {
        setNotificationOpen(true);
        setError(result.error);
        setSuccess("");
        setLoadingError(true);
      } else {
        setError("");
        setSuccess(result.success);
        setNotificationOpen(true);
        fetchUserData();
        setSelectedRows([]); // Limpa as checkboxes
        if (updateSelectedRows) updateSelectedRows([]);
      }
    } catch (error) {
      setError("Ocorreu um erro ao deletar as despesas");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };

  const renderCategoryActions = (categoriaId: string) => (
    <Aside
      isOpen={editAsideOpen[categoriaId] || false}
      toggleAside={() => editingAside(categoriaId, currentexpense)}
      content={
        <AsideContent>
          <DataPicker
            onChange={(date) => form.setValue("data", date)}
            value={form.watch("data")}
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
                  value={form.watch("valor")}
                  onValueChange={(value) =>
                    form.setValue("valor", value || "0")
                  }
                  intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                  decimalSeparator=","
                />
              </div>
            </div>
          </div>
          <InputSelect
            value={form.watch("formaDePagamento") || ""}
            onChange={(value: string) =>
              form.setValue("formaDePagamento", value || "")
            }
            options={
              userData?.user.formaDePagamento.map(
                (formaDePagamento: any) => formaDePagamento.name,
              ) || []
            }
            label="Forma de Pagamento"
          />
          <InputSelect
            value={form.watch("categoria") || ""}
            onChange={(value: string) => {
              form.setValue("categoria", value || "");
              const categoriaSelecionada = userData?.user?.categoria.find(
                (categoria: any) => categoria.name === value
              );
              const novasSubcategorias = categoriaSelecionada?.subcategorias.map(
                (subcategoria: any) => subcategoria.name
              ) || [];
              setSubcategorias(novasSubcategorias);
              form.setValue("subcategoria", novasSubcategorias[0] || "");
            }}
            options={
              userData?.user.categoria.map(
                (categoria: any) => categoria.name,
              ) || []
            }
            label="Categoria"
          />
          <InputSelect
            value={form.watch("subcategoria") || ""}
            onChange={(value: string) =>
              form.setValue("subcategoria", value || "")
            }
            options={subcategorias}
            label="Subcategoria"
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
              onClick={() => AtualizarDespesa(categoriaId)}
            />
            <Button
              size="md"
              variant="secondary"
              label="Cancelar"
              onClick={() => editingAside(categoriaId, currentexpense)}
            />
          </div>
        </AsideFooter>
      }
      title="Editar despesa"
      description="Edite a despesa."
    />
  );

  const columns: string[] = [
    "Data",
    "Valor",
    "Categoria",
    "Subcategoria",
    "Forma de pagamento",
  ];

  const getSubcategoriaName = (categoriaId: string, subcategoriaId: string) => {
    const categoria = userData?.user?.categoria.find(
      (cat: any) => cat.id === categoriaId,
    );
    if (categoria && categoria.subcategorias) {
      const subcategoria = categoria.subcategorias.find(
        (subcat: any) => subcat.id === subcategoriaId,
      );
      if (subcategoria) {
        return subcategoria.name;
      }
    }
    return "Subcategoria Desconhecida";
  };

  const userDataIsValid = userData && userData.user;

  const data: { [key: string]: any; id: string }[] = userData?.user?.expense
    ? userData?.user.expense
        .slice()
        .reverse()
        .map((expense: any) => {
          const amount =
            typeof expense.amount === "number"
              ? expense.amount.toFixed(2).replace(".", ",")
              : expense.amount.toString();
          const formattedAmount = parseFloat(
            amount.replace(",", "."),
          ).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          const formattedDate = new Date(expense.createdAt).toLocaleDateString(
            "pt-BR",
          );
          const categoriaId = expense.categoriaId;
          const category = userData?.user.categoria.find(
            (cat: any) => cat.id === categoriaId,
          );
          const categoryName = category
            ? category.name
            : "Categoria Desconhecida";

          const subcategoriaName = getSubcategoriaName(
            categoriaId,
            expense.subcategoriaId,
          );

          const formaDePagamentoId = expense.formaDePagamentoId;
          const formaDePagamento = userData?.user.formaDePagamento.find(
            (cat: any) => cat.id === formaDePagamentoId,
          );
          const formaDePagamentoName = formaDePagamento
            ? formaDePagamento.name
            : "Forma de Pagamento Desconhecida";

          return {
            id: expense.id,
            Data: formattedDate,
            Categoria: categoryName,
            Subcategoria: subcategoriaName,
            Valor: "R$ " + formattedAmount,
            "Forma de pagamento": formaDePagamentoName,
          };
        })
    : [];

  const date = form.watch("data");
  const valor = form.watch("valor");
  const formaDePagamento = form.watch("formaDePagamento");
  const name = form.watch("categoria");
  const subcategoria = form.watch("subcategoria");

  const isFormValid = date && valor && formaDePagamento && name && subcategoria;

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleUpdateSelectedRows = useCallback((updateSelectedRows: any) => {
    setUpdateSelectedRows(() => updateSelectedRows);
  }, []);

  return (
    <>
      <Page
        onClickActionPrimary={toggleAside}
        withActionPrimary={
          userDataIsValid ? userData.user.expense.length > 0 : undefined
        }
        buttonContentPrimary="Adicionar"
        namePage="Suas despesas"
      >
        <AuthProgress loading={loading} error={loadingError} />
        {(userDataIsValid ? userData.user.expense.length < 1 : undefined) ? (
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
                title="Não deixe de registrar as suas despesas!"
                description="Adicione uma despesa sempre que fizer um pagamento ou tiver algum gasto para manter seu controle financeiro em dia."
                icon="local_mall"
                buttonContentPrimary="Adicionar despesa"
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
              textRowsSelected={`despesa${selectedRows.length > 1 ? "s" : ""} selecionada${selectedRows.length > 1 ? "s" : ""}`}
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
                        const selectedExpense = data.find(
                          (row) => row.id === selectedRows[0],
                        );
                        if (selectedExpense) {
                          editingAside(selectedRows[0], {
                            date: selectedExpense.Data,
                            amount: selectedExpense.Valor.replace("R$ ", "")
                              .replace(".", "")
                              .replace(",", "."),
                            category: selectedExpense.Categoria,
                            Subcategoria: selectedExpense.Subcategoria,
                            FormaDePagamento:
                              selectedExpense["Forma de pagamento"],
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
          title="Adicionar despesa"
          description="Preencha detalhadamente a sua despesa."
          content={
            <AsideContent>
              <DataPicker
                onChange={(date) => form.setValue("data", date)}
                value={form.watch("data")}
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
                      value={form.watch("valor")}
                      onValueChange={(value) =>
                        form.setValue("valor", value || "0")
                      }
                      intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                      decimalSeparator=","
                    />
                  </div>
                </div>
              </div>
              <InputSelect
                value={form.watch("formaDePagamento") || ""}
                onChange={(value: string) =>
                  form.setValue("formaDePagamento", value || "")
                }
                options={
                  userData?.user.formaDePagamento.map(
                    (formaDePagamento: any) => formaDePagamento.name,
                  ) || []
                }
                label="Forma de Pagamento"
              />
              <InputSelect
                value={form.watch("categoria") || ""}
                onChange={(value: string) => {
                  form.setValue("categoria", value || "");
                  const categoriaSelecionada = userData?.user?.categoria.find(
                    (categoria: any) => categoria.name === value
                  );
                  const novasSubcategorias = categoriaSelecionada?.subcategorias.map(
                    (subcategoria: any) => subcategoria.name
                  ) || [];
                  setSubcategorias(novasSubcategorias);
                  form.setValue("subcategoria", novasSubcategorias[0] || "");
                }}
                options={
                  userData?.user.categoria.map(
                    (categoria: any) => categoria.name,
                  ) || []
                }
                label="Categoria"
              />
              <InputSelect
                value={form.watch("subcategoria") || ""}
                onChange={(value: string) =>
                  form.setValue("subcategoria", value || "")
                }
                options={subcategorias}
                label="Subcategoria"
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
                  onClick={() => CriarDespesa(form.getValues())}
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
                  DeletarDespesas(selectedIdsForModal);
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
              {`Você está prestes a excluir ${selectedIdsForModal.length} despesa${selectedIdsForModal.length > 1 ? "s" : ""}. Esta ação é irreversível e você perderá todo o histórico das despesas selecionadas.`}
            </p>
          </ContentModal>
        }
        title="Excluir despesas"
        description={`Tem certeza de que deseja excluir ${selectedIdsForModal.length} despesa${selectedIdsForModal.length > 1 ? "s" : ""}?`}
        isOpen={modalOpen}
        dismissible={true}
      />
      {renderCategoryActions(selectedRows[0])}
    </>
  );
};

export default HomePage;
