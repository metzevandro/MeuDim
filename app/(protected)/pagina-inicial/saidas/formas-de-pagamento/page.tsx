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
} from "design-system-zeroz";
import React, { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import "./forma-de-pagamento.scss";

export default function CategoryPage() {
  const user = useCurrentUser();

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

  const criar = (values: z.infer<typeof NewCategorySchema>) => {
    setError("");
    setSuccess("");
    toggleAside();

    startTransition(() => {
      CriarFormaDePagamento(values).then((data) => {
        if (data.error) {
          setError(data.error);
          setSuccess("");
          setNotificationOpen(true);
        } else {
          setError("");
          setSuccess("Forma de pagamento criado com sucesso");
          setNotificationOpen(true);
          window.location.reload();
        }
      });
    });
  };

  const atualizar = (categoryId: string) => {
    editingAside(categoryId);
    startTransition(() => {
      AtualizarFormaDePagamento(form.getValues(), categoryId).then((data) => {
        if (data.error) {
          setError(data.error);
          setSuccess("");
          setNotificationOpen(true);
        } else {
          setError("");
          setSuccess("Forma de pagamento atualizado com sucesso");
          setNotificationOpen(true);
          window.location.reload();
        }
      });
    });
  };

  const excluir = (categoryId: string) => {
    toggleModal(categoryId);
    startTransition(() => {
      ExcluirFormaDePagamento(categoryId).then((data) => {
        if (data.error) {
          setError(data.error);
          setSuccess("");
          setNotificationOpen(true);
        } else {
          setError("");
          setSuccess("Forma de pagamento excluída com sucesso");
          setNotificationOpen(true);
          window.location.reload();
        }
      });
    });
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
      <form>
        <Aside
          isOpen={editAsideOpen[categoryId] || false}
          toggleAside={() => editingAside(categoryId)}
          content={
            <AsideContent>
              <Input
                label="Nome"
                placeholder="Ex: Investimentos"
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
      </form>
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

  const data: { [key: string]: any; id: string }[] = user?.formaDePagamento
    ? user.formaDePagamento.map((formaDePagamento: any, index: number) => {
        const formattedDate = new Date(
          formaDePagamento.createdAt,
        ).toLocaleDateString("pt-BR");

        return {
          Data: formattedDate,
          Forma: formaDePagamento.name,
          Ações: renderCategoryActions(
            formaDePagamento.id,
            formaDePagamento.name,
          ),
        };
      })
    : [];

  const expandedData: { [key: string]: any; id: string }[] = [];

  return (
    <>
      <Page
        namePage="Formas de Pagamento"
        columnLayout="1"
        withActionPrimary={user?.formaDePagamento.length > 0}
        buttonContentPrimary="Adicionar"
        onClickActionPrimary={toggleAside}
      >
        {user?.formaDePagamento.length < 1 ? (
          <>
            <div
              style={{ display: "flex", alignItems: "center", height: "200%" }}
            >
              <EmptyState
                title="Você não possui nenhuma forma de pagamento ainda"
                description="Indique a forma de pagamento utilizada nos seus pagamentos, seja em dinheiro, cartão ou transferência, para manter um registro detalhado e preciso das suas movimentações financeiras."
                icon="local_atm"
                buttonContentPrimary="Adicionar forma de pagamento"
                onClickActionPrimary={toggleAside}
              />
            </div>
          </>
        ) : (
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
            description="A fonte de renda está sendo utilizada."
            variant="warning"
            type="float"
            isOpen={notificationOpen}
          />
        )}
      </Page>
    </>
  );
}
