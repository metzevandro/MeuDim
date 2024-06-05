"use client";
import React, { Suspense, useEffect, useState } from "react";
import { Criar, Deletar, Atualizar } from "@/actions/transaction";
import { TransactionSchema } from "@/schemas/index";
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
  Loading,
  Modal,
  Notification,
  Page,
} from "design-system-zeroz";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "./ganhos.scss";
import IntlCurrencyInput from "react-currency-input-field";
import AuthProgress from "@/components/auth/Progress/progress";
import Skeleton from "@/components/auth/Skeleton/Skeleton";

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
      category: {
        id: string;
        name: string;
        userId: string;
        createdAt: string;
      };
    }[];
  };
  expires: string;
}

const API = process.env.NEXT_PUBLIC_APP_URL;

const HomePage = () => {
  const [isOpenAside, setIsOpenAside] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState<{ [key: string]: boolean }>({});
  const [editFormStates, setEditFormStates] = useState<{ [key: string]: any }>(
    {},
  );
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

  const form = useForm<z.infer<typeof TransactionSchema>>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      date: "",
      amount: "",
      category: userData?.user.categories[0]?.name,
    },
  });

  const toggleAside = () => {
    setIsOpenAside(!isOpenAside);
    form.reset({
      date: "",
      amount: "",
      category: userData?.user.categories[0]?.name,
    });
  };

  const toggleModal = (categoryId: string) => {
    setModalOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const editingAside = (
    categoryId: string,
    transactionCategory: string,
    transactionAmount: string,
    transactionDate: string,
  ) => {
    setEditFormStates((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        isOpen: !prev[categoryId]?.isOpen,
        amount: prev[categoryId]?.isOpen
          ? prev[categoryId]?.amount
          : transactionAmount,
        date: prev[categoryId]?.isOpen
          ? prev[categoryId]?.date
          : transactionDate,
      },
    }));

    if (!editFormStates[categoryId]?.isOpen) {
      form.reset({
        date: transactionDate,
        amount: transactionAmount.replace(/\./g, "").replace(",", "."),
        category: transactionCategory,
      });
    }
  };

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const date = form.watch("date");
  const amount = form.watch("amount");
  const category = form.watch("category");

  const isFormValid = date && amount && category;

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const renderCategoryActions = (
    categoryId: string,
    transactionAmount: string,
    transactionDate: string,
    transactionCategory: string,
  ) => (
    <div className="actions">
      <Button
        size="sm"
        variant="secondary"
        label="Editar"
        onClick={() =>
          editingAside(
            categoryId,
            transactionCategory,
            transactionAmount,
            transactionDate,
          )
        }
      />
      <Aside
        isOpen={editFormStates[categoryId]?.isOpen || false}
        toggleAside={() =>
          editingAside(
            categoryId,
            transactionCategory,
            transactionAmount,
            transactionDate,
          )
        }
        content={
          <AsideContent>
            <DataPicker
              onDateChange={(date) => {
                setSelectedDate(date), console.log(date);
              }}
              date={form.watch("date")}
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
                    value={form.watch("amount")}
                    onValueChange={(value) =>
                      form.setValue("amount", value || "")
                    }
                    intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                    decimalSeparator=","
                  />
                </div>
              </div>
            </div>
            <InputSelect
              value={form.watch("category")}
              onChange={(value: string) =>
                form.setValue("category", value || "")
              }
              options={
                userData?.user.categories.map(
                  (category: any) => category.name,
                ) || []
              }
              label="Fonte de Renda"
              errorMessage={errors.category?.message}
              error={!!errors.category}
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
                onClick={() =>
                  AtualizarGanho(
                    categoryId,
                    transactionAmount,
                    transactionDate,
                    transactionCategory,
                    selectedDate,
                  )
                }
                disabled={!isFormValid}
              />
              <Button
                size="md"
                variant="secondary"
                label="Cancelar"
                onClick={() =>
                  editingAside(
                    categoryId,
                    transactionCategory,
                    transactionAmount,
                    transactionDate,
                  )
                }
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
              Esta ação é irreversível e você perderá todo o histórico deste
              ganho até o momento.
            </p>
          </ContentModal>
        }
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
                label="Sim, quero excluir"
                onClick={() => DeletarGanho(categoryId)}
              />
              <Button
                size="md"
                variant="secondary"
                label="Não, quero cancelar"
                onClick={() => toggleModal(categoryId)}
              />
            </div>
          </FooterModal>
        }
        title="Excluir ganho"
        description={`Tem certeza de que deseja excluir o ganho de R$ ${transactionAmount}?`}
        isOpen={modalOpen[categoryId] || false}
        dismissible={true}
      />
    </div>
  );

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

  const { errors } = form.formState;

  const DeletarGanho = async (categoryId: string) => {
    setError("");
    setSuccess("");
    toggleModal(categoryId);
    const loadingInterval = startLoading();

    try {
      const data: any = await Deletar(categoryId);
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
      setError("Ocorreu um erro ao criar a fonte de renda.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const AtualizarGanho = async (
    categoryId: string,
    transactionAmount: string,
    transactionDate: string,
    transactionCategory: string,
    selectdate: Date | null,
  ) => {
    setError("");
    setSuccess("");
    editingAside(
      categoryId,
      transactionCategory,
      transactionAmount,
      transactionDate,
    );
    const loadingInterval = startLoading();
    setError("");
    setSuccess("");

    try {
      if (selectdate !== null) {
        const data: any = await Atualizar(
          { ...form.getValues(), date: selectdate.toString() },
          categoryId,
        );
        if (data.error) {
          setNotificationOpen(true);
          setError(data.error);
          setSuccess("");
        } else {
          setError("");
          setNotificationOpen(true);
          setSuccess(data.success);
          fetchUserData();
        }
      }
    } catch (error) {
      setError("Ocorreu um erro ao criar a fonte de renda.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
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

  const columns: string[] = ["Data", "Valor", "Fonte", "Ações"];

  const userDataIsValid = userData && userData.user;

  const data =
    userDataIsValid && userData.user.transactions
      ? userData.user.transactions.map((transaction: any, index) => {
          const amountString =
            typeof transaction.amount === "string"
              ? transaction.amount.toString()
              : "";
          const amount = parseFloat(amountString.replace(",", ".")) || 0;

          const formattedAmount = amount.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          const formattedDate = new Date(
            transaction.createdAt,
          ).toLocaleDateString("pt-BR");

          const category = userData.user.categories.find(
            (cat: any) => cat.id === transaction.categoryId,
          );
          const categoryName = category
            ? category.name
            : "Categoria Desconhecida";

          return {
            id: transaction.id,
            Data: formattedDate,
            Fonte: categoryName,
            Valor: `R$ ${formattedAmount}`,
            Ações: renderCategoryActions(
              transaction.id,
              formattedAmount,
              formattedDate,
              categoryName,
            ),
          };
        })
      : [
          {
            id: "1",
            Valor: <Skeleton height="32" width="100"/>,
            Data: <Skeleton height="32" width="100"/>,
            Fonte: <Skeleton height="32" width="100"/>,
            Ações: <div className="actions"><Skeleton height="32" width="65"/><Skeleton height="32" width="32"/></div>,
          },
          {
            id: "2",
            Valor: <Skeleton height="32" width="100"/>,
            Data: <Skeleton height="32" width="100"/>,
            Fonte: <Skeleton height="32" width="100"/>,
            Ações: <div className="actions"><Skeleton height="32" width="65"/><Skeleton height="32" width="32"/></div>,
          },
          {
            id: "3",
            Valor: <Skeleton height="32" width="100"/>,
            Data: <Skeleton height="32" width="100"/>,
            Fonte: <Skeleton height="32" width="100"/>,
            Ações: <div className="actions"><Skeleton height="32" width="65"/><Skeleton height="32" width="32"/></div>,
          },
          {
            id: "4",
            Valor: <Skeleton height="32" width="100"/>,
            Data: <Skeleton height="32" width="100"/>,
            Fonte: <Skeleton height="32" width="100"/>,
            Ações: <div className="actions"><Skeleton height="32" width="65"/><Skeleton height="32" width="32"/></div>,
          },
        ];

  const expandedData: { [key: string]: any; id: string }[] = [];

  const userCurrent = useCurrentUser();

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Page
          onClickActionPrimary={toggleAside}
          withActionPrimary={
            userDataIsValid ? userData.user.transactions.length > 0 : undefined
          }          buttonContentPrimary="Adicionar"
          columnLayout="1"
          namePage="Seus ganhos"
        >
          <AuthProgress loading={loading} error={loadingError} />

          {(userDataIsValid ? userData.user.transactions.length < 1 : undefined) ? (
            <div
              style={{ display: "flex", alignItems: "center", height: "200%" }}
            >
              <EmptyState
                title="Você não possui nenhum ganho ainda"
                description="Quando receber seu salário ou qualquer outro dinheiro, adicione-o como um ganho para manter suas finanças organizadas."
                icon="trending_up"
                buttonContentPrimary="Adicionar ganho"
                onClickActionPrimary={toggleAside}
              />
            </div>
          ) : (
            <>
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
            </>
          )}
          <Aside
            isOpen={isOpenAside}
            toggleAside={toggleAside}
            title="Adicionar entrada"
            description="Preencha detalhadamente o seu ganho."
            content={
              <AsideContent>
                <DataPicker
                  onDateChange={(date) =>
                    form.setValue("date", date.toISOString())
                  }
                  date={form.watch("date")}
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
                  errorMessage={errors.category?.message}
                  error={!!errors.category}
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
      </div>
    </>
  );
};

export default HomePage;
