"use client";
import React, { useState } from "react";
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
} from "design-system-zeroz";
import { useCurrentUser } from "@/hooks/user-current-user";
import {
  AtualizarFonteDeRenda,
  CriarFonteDeRenda,
  ExcluirFonteDeRenda,
} from "@/actions/fonte-de-dinheiro";
import LayoutPage from "@/app/(protected)/_components/layout";
import { NewCategorySchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition } from "react";
import { z } from "zod";

import "./fonte-de-renda.scss";

export default function Categorias() {
  const user = useCurrentUser();

  const [isOpenAside, setIsOpenAside] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState<{ [key: string]: boolean }>({});
  const [editAsideOpen, setEditAsideOpen] = useState<{
    [key: string]: boolean;
  }>({});
  const form = useForm<z.infer<typeof NewCategorySchema>>({
    resolver: zodResolver(NewCategorySchema),
    defaultValues: {
      name: "",
      date: new Date(),
    },
  });

  const toggleAside = () => {
    setIsOpenAside(!isOpenAside);
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

  const onSubmit = (values: z.infer<typeof NewCategorySchema>) => {
    setError("");
    setSuccess("");
    toggleAside();

    startTransition(() => {
      CriarFonteDeRenda(values).then((data) => {
        if (data.error) {
          setError(data.error);
          setSuccess("");
          setNotificationOpen(true);
        } else {
          setError("");
          setSuccess("Criado com sucesso");
          setNotificationOpen(true);
          window.location.reload();
        }
      });
    });
  };

  const atualizarCategoria = (categoryId: string) => {
    editingAside(categoryId);
    startTransition(() => {
      AtualizarFonteDeRenda(form.getValues(), categoryId).then((data) => {
        if (data.error) {
          setError(data.error);
          setSuccess("");
          setNotificationOpen(true);
        } else {
          setError("");
          setSuccess("Categoria atualizada com sucesso");
          setNotificationOpen(true);
          window.location.reload();
        }
      });
    });
  };

  const onDeleteCategory = (categoryId: string) => {
    toggleModal(categoryId);
    startTransition(() => {
      ExcluirFonteDeRenda(categoryId).then((data) => {
        if (data.error) {
          setError(data.error);
          setSuccess("");
          setNotificationOpen(true);
        } else {
          setError("");
          setSuccess("Categoria excluída com sucesso");
          setNotificationOpen(true);
          window.location.reload();
        }
      });
    });
  };

  const { errors } = form.formState;

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
                  onClick={() => atualizarCategoria(categoryId)}
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
          title="Editar fonte de renda"
          description="Edite a fonte de renda para os seus ganhos."
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

  const data: { [key: string]: any; id: string }[] = user?.categories
    ? user.categories.map((category: any, index: number) => {
        const formattedDate = new Date(category.createdAt).toLocaleDateString(
          "pt-BR",
        );

        return {
          Data: formattedDate,
          Fonte: category.name,
          Ações: renderCategoryActions(category.id, category.name),
        };
      })
    : [];

  const expandedData: { [key: string]: any; id: string }[] = [];

  return (
    <>
      <Page
        buttonContentPrimary="Adicionar"
        columnLayout="1"
        namePage="Fonte de Renda"
        withActionPrimary={user?.categories.length > 0}
        onClickActionPrimary={toggleAside}
      >
        {user?.categories.length < 1 ? (
          <>
            <div
              style={{ display: "flex", alignItems: "center", height: "200%" }}
            >
              <EmptyState
                title="Você não possui nenhuma fonte de renda ainda"
                description="Registre uma nova fonte de renda para classificar os pagamentos ou valores que receber, garantindo que seu controle financeiro esteja sempre atualizado."
                icon="savings"
                buttonContentPrimary="Adicionar fonte de renda"
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                  value={form.watch("name")}
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
                    type="submit"
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
        </form>
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
          description="A fonte de renda está sendo utilizada."
          variant="warning"
          type="float"
          isOpen={notificationOpen}
        />
      )}
    </>
  );
}
