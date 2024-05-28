"use client";
import React, { startTransition, useState } from "react";
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
  Modal,
  Notification,
  Page,
  Progress,
} from "design-system-zeroz";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "./ganhos.scss";
import IntlCurrencyInput from "react-currency-input-field";
import { useRouter } from "next/navigation";
import { auth } from "@/auth";

const HomePage = () => {
  const router = useRouter();
  const user = useCurrentUser();
  const [isOpenAside, setIsOpenAside] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState<{ [key: string]: boolean }>({});
  const [editAsideOpen, setEditAsideOpen] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);

  /* const [progressValue, setProgressValue] = useState(0);
  const [progressError, setProgressError] = useState(false); */

  /*  const incrementProgress = () => {
    setProgressValue(0);
    setProgressError(false);
    let progress = 0.2;
    const interval = setInterval(() => {
      setProgressValue((prev) => {
        const newValue = Math.min(prev + progress, 100);
        if (newValue >= 100) {
          clearInterval(interval);
        }
        return newValue;
      });
      progress *= 2;
    }, 100);
  }; */

  const handleActionCompletion = (data: any) => {
    if (data.error) {
      setError(data.error);
      setSuccess("");
      router.refresh();
      /*  setProgressError(true); */
    } else {
      setError("");
      router.refresh();
      setSuccess("Operação realizada com sucesso");
      /* setProgressValue(100); */
    }
    setNotificationOpen(true);
  };

  const toggleModal = (categoryId: string) => {
    setModalOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const editingAside = (categoryId: string, transaction: any) => {
    setCurrentTransaction(transaction);
    setEditAsideOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

    if (transaction) {
      form.setValue("date", transaction.date);
      form.setValue(
        "amount",
        transaction.amount.replace(/\./g, "").replace(",", "."),
      );
      form.setValue("category", transaction.category);
    }
  };

  const toggleAside = () => {
    setIsOpenAside(!isOpenAside);
  };

  const form = useForm<z.infer<typeof TransactionSchema>>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      date: "",
      amount: "",
      category: user.categories[0]?.name,
    },
  });

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const date = form.watch("date");
  const amount = form.watch("amount");
  const category = form.watch("category");

  const isFormValid = date && amount && category;

  const renderCategoryActions = (
    categoryId: string,
    transactionAmount: string,
    transactionDate: string,
    transactionCategory: string,
  ) => (
    <div className="actions" key={categoryId}>
      <Button
        size="sm"
        variant="secondary"
        label="Editar"
        onClick={() =>
          editingAside(categoryId, {
            date: transactionDate,
            amount: transactionAmount,
            category: transactionCategory,
          })
        }
      />
      <Aside
        isOpen={editAsideOpen[categoryId] || false}
        toggleAside={() => editingAside(categoryId, null)}
        content={
          <AsideContent>
            <DataPicker
              onDateChange={(date) => form.setValue("date", date.toISOString())}
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
                user?.categories.map((category: any) => category.name) || []
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
                onClick={() => AtualizarGanho(categoryId)}
                disabled={!isFormValid}
              />
              <Button
                size="md"
                variant="secondary"
                label="Cancelar"
                onClick={() => editingAside(categoryId, null)}
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

  const { errors } = form.formState;

  const DeletarGanho = (categoryId: string) => {
    /* incrementProgress(); */
    setError("");
    setSuccess("");
    toggleModal(categoryId);
    startTransition(() => {
      Deletar(categoryId).then((data) => {
        handleActionCompletion(data);
      });
    });
  };

  const AtualizarGanho = (categoryId: string) => {
    /* incrementProgress(); */
    setError("");
    setSuccess("");
    editingAside(categoryId, null);
    startTransition(() => {
      Atualizar(form.getValues(), categoryId).then((data) => {
        handleActionCompletion(data);
      });
    });
  };

  const CriarGanho = (values: z.infer<typeof TransactionSchema>) => {
    /*  incrementProgress(); */
    setError("");
    setSuccess("");
    toggleAside();
    startTransition(() => {
      Criar(values)
        .then((data) => {
          console.log(data);
          handleActionCompletion(data);
        })
        .finally(() => {
          router.refresh();
        });
    });
  };

  const columns: string[] = ["id","Data", "Valor", "Fonte", "Ações"];

  const data: { [key: string]: any; id: string }[] = user?.transactions
    ? user.transactions.map((transaction: any) => {
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
        const categoryId = transaction.categoryId;
        const category = user.categories.find(
          (cat: any) => cat.id === categoryId,
        );
        const categoryName = category
          ? category.name
          : "Categoria Desconhecida";
        return {
          id: transaction.id,
          Data: formattedDate,
          Fonte: categoryName,
          Valor: "R$ " + formattedAmount,
          Ações: renderCategoryActions(
            transaction.id,
            formattedAmount,
            formattedDate,
            categoryName,
          ),
        };
      })
    : [];

  const expandedData: { [key: string]: any; id: string }[] = [];

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "0",
          zIndex: "999",
          left: "0",
          width: "100%",
        }}
      >
        {/* 
        {progressValue > 0 && (
          <Progress value={progressValue} error={progressError}></Progress>
        )} */}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Page
          onClickActionPrimary={toggleAside}
          withActionPrimary={user?.transactions.length > 0}
          buttonContentPrimary="Adicionar"
          columnLayout="1"
          namePage="Seus ganhos"
        >
          {user?.transactions.length < 1 ? (
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
                    user?.categories.map((category: any) => category.name) || []
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
      </div>
    </>
  );
};

export default HomePage;
