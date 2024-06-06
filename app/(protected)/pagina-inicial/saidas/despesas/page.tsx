"use client";
import React, { startTransition, useEffect, useState } from "react";
import { Atualizar, Criar, Deletar } from "@/actions/expense";
import { ExpenseSchema } from "@/schemas/index";
import { z } from "zod";
import { useCurrentUser } from "@/hooks/user-current-user";
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
} from "design-system-zeroz";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import IntlCurrencyInput from "react-currency-input-field";

import "./despesas.scss";
import AuthProgress from "@/components/auth/Progress/progress";
import Skeleton from "@/components/auth/Skeleton/Skeleton";

interface UserData {
  user: User;
  expires: string;
}

interface User {
  name: string;
  email: string;
  image: string | null;
  id: string;
  role: string;
  expense: Expense[];
  categoria: Categoria[];
  formaDePagamento: FormaDePagamento[];
}

interface Expense {
  id: string;
  amount: string;
  accountId: string;
  createdAt: string;
  categoriaId: string;
  subcategoriaId: string;
  formaDePagamentoId: string;
}

interface Categoria {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  Subcategorias: Subcategoria[];
}

interface Subcategoria {
  id: string;
  name: string;
  categoriaId: string;
}

interface FormaDePagamento {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_APP_URL;

const HomePage = () => {
  const [isOpenAside, setIsOpenAside] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState<{ [key: string]: boolean }>({});
  const [editAsideOpen, setEditAsideOpen] = useState<{
    [key: string]: boolean;
  }>({});

  const [subcategorias, setSubcategorias] = useState<string[]>([]);
  const [currentexpense, setCurrentexpense] = useState<any>(null);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

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

  const toggleModal = (categoryId: string) => {
    setModalOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const editingAside = (categoryId: string, expense: any) => {
    setCurrentexpense(expense);
    setEditAsideOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

    if (expense) {
      form.setValue("data", expense.date);
      form.setValue(
        "valor",
        expense.amount.replace(/\./g, "").replace(",", "."),
      );
      form.setValue("categoria", expense.category);
      form.setValue("formaDePagamento", expense.FormaDePagamento);
      form.setValue("subcategoria", expense.Subcategoria);
    }
  };

  const toggleAside = () => {
    setIsOpenAside(!isOpenAside);
    form.reset({
      data: "",
      valor: "",
      formaDePagamento: userData?.user.formaDePagamento[0]?.name,
      categoria: userData?.user.categoria[0]?.name,
      subcategoria: userData?.user.categoria[0]?.Subcategorias?.[0]?.name,
    });
  };

  const form = useForm<z.infer<typeof ExpenseSchema>>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      data: "",
      valor: "",
      formaDePagamento: userData?.user.formaDePagamento[0]?.name,
      categoria: userData?.user.categoria[0]?.name,
      subcategoria: subcategorias[0] || "",
    },
  });

  useEffect(() => {
    const categoriaSelecionada = userData?.user?.categoria.find(
      (categoria: any) => categoria.name === form.watch("categoria"),
    );
    if (categoriaSelecionada) {
      setSubcategorias(
        categoriaSelecionada.Subcategorias.map(
          (subcategoria: any) => subcategoria.name,
        ),
      );
    } else {
      setSubcategorias([]);
    }
  }, [form.watch("categoria"), userData?.user?.categoria]);

  useEffect(() => {
    if (isOpenAside) {
      form.setValue("data", "");
      form.setValue("valor", "");
      form.setValue("categoria", userData?.user?.categoria[0]?.name || "");
      setCurrentexpense(null);
    }
  }, [isOpenAside, form, userData?.user?.categoria]);

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
        setLoading(100);
      } else {
        setError("");
        setLoading(100);
        setNotificationOpen(true);
        setSuccess(data.success);
        fetchUserData();
      }
    } catch (error) {
      setError("Ocorreu um erro ao atualizar a despesa");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const DeletarDespesa = async (categoriaId: string) => {
    setError("");
    setSuccess("");
    toggleModal(categoriaId);
    const loadingInterval = startLoading();

    try {
      const data: any = await Deletar(categoriaId);
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
      setError("Ocorreu um erro ao deletar o ganho");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const renderCategoryActions = (
    categoriaId: string,
    expenseAmount: string,
    expenseDate: string,
    expenseCategory: string,
    subcategoriaName: string,
    formaDePagamentoName: string,
  ) => (
    <div className="actions">
      <Button
        size="sm"
        variant="secondary"
        label="Editar"
        onClick={() =>
          editingAside(categoriaId, {
            date: expenseDate,
            amount: expenseAmount,
            category: expenseCategory,
            Subcategoria: subcategoriaName,
            FormaDePagamento: formaDePagamentoName,
          })
        }
      />
      <Aside
        isOpen={editAsideOpen[categoriaId] || false}
        toggleAside={() => editingAside(categoriaId, currentexpense)}
        content={
          <AsideContent>
            <DataPicker
              onDateChange={(date) => form.setValue("data", date.toISOString())}
              date={form.watch("data")}
              placeholder="Ex: 14/02/2023"
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
              onChange={(value: string) =>
                form.setValue("categoria", value || "")
              }
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
      <ButtonIcon
        size="sm"
        type="default"
        typeIcon="delete"
        variant="warning"
        onClick={() => toggleModal(categoriaId)}
      />
      <Modal
        hideModal={() => toggleModal(categoriaId)}
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
                onClick={() => DeletarDespesa(categoriaId)}
              />
              <Button
                size="md"
                variant="secondary"
                label="Cancelar"
                onClick={() => toggleModal(categoriaId)}
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
                wordBreak: "break-all",
                whiteSpace: "normal",
              }}
            >
              Esta ação é irreversível e você perderá todo o histórico desta
              despesa até o momento.
            </p>
          </ContentModal>
        }
        title="Excluir despesa"
        description={`Tem certeza de que deseja excluir a despesa de R$ ${expenseAmount}`}
        isOpen={modalOpen[categoriaId] || false}
        dismissible={true}
      />
    </div>
  );

  const columns: string[] = [
    "Data",
    "Valor",
    "Categoria",
    "Subcategoria",
    "Forma",
    "Ações",
  ];

  const getSubcategoriaName = (categoriaId: string, subcategoriaId: string) => {
    const categoria = userData?.user?.categoria.find(
      (cat: any) => cat.id === categoriaId,
    );
    if (categoria && categoria.Subcategorias) {
      const subcategoria = categoria.Subcategorias.find(
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
    ? userData?.user.expense.map((expense: any) => {
        const amountString =
          typeof expense.amount === "string" ? expense.amount.toString() : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;
        const formattedAmount = amount.toLocaleString("pt-BR", {
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
          Forma: formaDePagamentoName,
          Ações: renderCategoryActions(
            expense.id,
            formattedAmount,
            formattedDate,
            categoryName,
            subcategoriaName,
            formaDePagamentoName,
          ),
        };
      })
    : [
        {
          id: "1",
          Data: <Skeleton height="32" width="100" />,
          Categoria: <Skeleton height="32" width="100" />,
          Subcategoria: <Skeleton height="32" width="100" />,
          Valor: <Skeleton height="32" width="100" />,
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
          Categoria: <Skeleton height="32" width="100" />,
          Subcategoria: <Skeleton height="32" width="100" />,
          Valor: <Skeleton height="32" width="100" />,
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
          Categoria: <Skeleton height="32" width="100" />,
          Subcategoria: <Skeleton height="32" width="100" />,
          Valor: <Skeleton height="32" width="100" />,
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
          Categoria: <Skeleton height="32" width="100" />,
          Subcategoria: <Skeleton height="32" width="100" />,
          Valor: <Skeleton height="32" width="100" />,
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

  const date = form.watch("data");
  const valor = form.watch("valor");

  const isFormValid = date && valor;

  return (
    <>
      <Page
        onClickActionPrimary={toggleAside}
        withActionPrimary={
          userDataIsValid ? userData.user.expense.length > 0 : undefined
        }
        buttonContentPrimary="Adicionar"
        columnLayout="1"
        namePage="Suas despesas"
      >
        <AuthProgress loading={loading} error={loadingError} />
        {(userDataIsValid ? userData.user.expense.length < 1 : undefined) ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
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
          title="Adicionar despesa"
          description="Preencha detalhadamente a sua despesa."
          content={
            <AsideContent>
              <DataPicker
                onDateChange={(date) =>
                  form.setValue("data", date.toISOString())
                }
                date={form.watch("data")}
                placeholder="Ex: 14/02/2023"
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
                onChange={(value: string) =>
                  form.setValue("categoria", value || "")
                }
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
    </>
  );
};

export default HomePage;
