"use client";
import LayoutPage from "@/app/(protected)/_components/layout";
import { useCurrentUser } from "@/hooks/user-current-user";
import { NovaCategoriaSchema } from "@/schemas";
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
  Tag,
} from "design-system-zeroz";
import React, { startTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import "./categorias.scss";
import {
  AtualizarCategoria,
  CriarCategoria,
  ExcluirCategoria,
} from "@/actions/categoria";

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

  const form = useForm<z.infer<typeof NovaCategoriaSchema>>({
    resolver: zodResolver(NovaCategoriaSchema),
    defaultValues: {
      name: "",
      date: new Date(),
      subcategoria: "",
    },
  });

  const [subcategoriasMap, setSubcategoriasMap] = useState<{
    [categoryId: string]: string[];
  }>({});

  useEffect(() => {
    if (user?.categoria) {
      const initialSubcategoriasMap = user.categoria.reduce(
        (acc: { [categoryId: string]: string[] }, categoria: any) => {
          acc[categoria.id] =
            categoria.Subcategorias?.map((sub: any) => sub.name) || [];
          return acc;
        },
        {},
      );
      setSubcategoriasMap(initialSubcategoriasMap);
    }
  }, [user]);

  const toggleAside = () => {
    setIsAsideOpen(!isAsideOpen);
  };

  const toggleModal = (categoryId: string) => {
    setModalOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const editingAside = (categoryId: string, categoryName?: string) => {
    if (categoryName) {
      form.setValue("name", categoryName);
    }
    setEditAsideOpen((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const adicionarSubcategoria = (categoryId: string) => {
    const subcategoria = form.watch("subcategoria");
    if (subcategoria && !subcategoriasMap[categoryId]?.includes(subcategoria)) {
      setSubcategoriasMap((prev) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), subcategoria],
      }));
      form.setValue("subcategoria", "");
    }
  };

  const removerSubcategoria = (categoryId: string, subcategoria: string) => {
    setSubcategoriasMap((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId]?.filter((item) => item !== subcategoria),
    }));
  };

  const criar = async (values: z.infer<typeof NovaCategoriaSchema>) => {
    toggleAside();
    startTransition(() => {
      const categoriaValues = {
        name: form.getValues().name,
        date: form.getValues().date,
        subcategoria: subcategoriasMap["new"] || [],
      };
      CriarCategoria(categoriaValues).then((data) => {
        if (data.error) {
          setError(data.error);
          setSuccess("");
          setNotificationOpen(true);
        } else {
          setError("");
          setSuccess("Categoria criada com sucesso");
          setNotificationOpen(true);
          window.location.reload();
        }
      });
    });
  };

  const atualizar = (categoryId: string) => {
    editingAside(categoryId);
    startTransition(() => {
      const categoriaValues = {
        name: form.getValues().name,
        date: form.getValues().date,
        subcategoria: subcategoriasMap[categoryId] || [],
      };
      AtualizarCategoria(categoriaValues, categoryId).then((data) => {
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

  const excluir = (categoryId: string) => {
    toggleModal(categoryId);
    startTransition(() => {
      ExcluirCategoria(categoryId).then((data) => {
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

  const columns: string[] = ["Data", "Categoria", "Subcategorias", "Ações"];

  const renderCategoryActions = (
    categoryId: string,
    categoryName: string,
    existingSubcategorias: string[],
  ) => (
    <div className="actions">
      <Button
        size="sm"
        variant="secondary"
        label="Editar"
        onClick={() => editingAside(categoryId, categoryName)}
      />
      <Aside
        isOpen={editAsideOpen[categoryId] || false}
        toggleAside={() => editingAside(categoryId)}
        content={
          <AsideContent>
            <Input
              label="Nome"
              placeholder="Ex: Investimentos"
              value={form.watch("name") || ""}
              onChange={(e) => form.setValue("name", e.target.value)}
            />
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "end",
                flex: "1",
              }}
            >
              <Input
                label="Subcategoria"
                placeholder="Ex: Ifood"
                value={form.watch("subcategoria") || ""}
                onChange={(e) => form.setValue("subcategoria", e.target.value)}
              />
              <Button
                style={{ width: "fit-content" }}
                label="Adicionar"
                size="md"
                variant="primary"
                onClick={() => adicionarSubcategoria(categoryId)}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "var(--s-spacing-xx-small)",
                flexWrap: "wrap",
              }}
            >
              {(subcategoriasMap[categoryId] || existingSubcategorias).map(
                (subcategoria, index) => (
                  <Tag
                    key={subcategoria}
                    content={subcategoria}
                    onClose={() =>
                      removerSubcategoria(categoryId, subcategoria)
                    }
                    variant="secondary"
                  />
                ),
              )}
            </div>
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
        title="Editar categoria"
        description="Edite a categoria para os seus ganhos."
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
        title="Excluir categoria"
        description="Você tem certeza que deseja excluir essa categoria?"
        isOpen={modalOpen[categoryId] || false}
        dismissible={true}
      />
    </div>
  );

  const data: { [key: string]: any; id: string }[] = user?.categoria
    ? user.categoria.map((categoria: any) => {
        const formattedDate = new Date(categoria.createdAt).toLocaleDateString(
          "pt-BR",
        );

        return {
          Data: formattedDate,
          Categoria: categoria.name,
          Subcategorias: categoria.Subcategorias?.length,
          Ações: renderCategoryActions(
            categoria.id,
            categoria.name,
            categoria.Subcategorias?.map((sub: any) => sub.name) || [],
          ),
        };
      })
    : [];

  const expandedData: { [key: string]: any; id: string }[] = [];

  return (
    <>
      <Page
        namePage="Categorias"
        columnLayout="1"
        withActionPrimary={user?.categoria.length > 0}
        buttonContentPrimary="Adicionar"
        onClickActionPrimary={toggleAside}
      >
        {user?.categoria.length < 1 ? (
          <div
            style={{ display: "flex", alignItems: "center", height: "200%" }}
          >
            <EmptyState
              title="Você não possui nenhuma categoria ainda"
              description="Classifique cada despesa, em uma categoria apropriada para facilitar a organização e análise do seu controle financeiro."
              icon="car_tag"
              buttonContentPrimary="Adicionar categoria"
              onClickActionPrimary={toggleAside}
            />
          </div>
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
          content={
            <AsideContent>
              <Input
                label="Nome"
                placeholder="Ex: Investimentos"
                value={form.watch("name")}
                onChange={(e) => form.setValue("name", e.target.value)}
              />
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "end",
                  flex: "1",
                }}
              >
                <Input
                  label="Subcategoria"
                  placeholder="Ex: Ifood"
                  value={form.watch("subcategoria") || ""}
                  onChange={(e) =>
                    form.setValue("subcategoria", e.target.value)
                  }
                />
                <Button
                  style={{ width: "fit-content" }}
                  label="Adicionar"
                  size="md"
                  variant="primary"
                  onClick={() => adicionarSubcategoria("new")}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "var(--s-spacing-xx-small)",
                  flexWrap: "wrap",
                }}
              >
                {(subcategoriasMap["new"] || []).map((subcategoria, index) => (
                  <Tag
                    key={subcategoria}
                    content={subcategoria}
                    onClose={() => removerSubcategoria("new", subcategoria)}
                    variant="secondary"
                  />
                ))}
              </div>
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
                  onClick={form.handleSubmit(criar)}
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
          title="Adicionar categoria"
          description="Adicione uma categoria para os seus ganhos."
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
            variant="warning"
            type="float"
            isOpen={notificationOpen}
          />
        )}
      </Page>
    </>
  );
}
