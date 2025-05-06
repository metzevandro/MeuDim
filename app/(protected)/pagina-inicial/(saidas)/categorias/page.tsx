"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  AtualizarCategoria,
  CriarCategoria,
  ExcluirCategoria,
} from "@/actions/categoria";
import { NovaCategoriaSchema } from "@/schemas";
import { z } from "zod";
import {
  Aside,
  AsideContent,
  AsideFooter,
  Badge,
  Button,
  ContentModal,
  DataTable,
  EmptyState,
  FooterModal,
  Input,
  Modal,
  Notification,
  Page,
  Tag,
} from "design-system-zeroz";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "./categorias.scss";
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
  const [subcategoriasMap, setSubcategoriasMap] = useState<{
    [categoryId: string]: string[];
  }>({});
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [loading, setLoading] = useState(0);
  const [loadingError, setLoadingError] = useState(false);

  const form = useForm<z.infer<typeof NovaCategoriaSchema>>({
    resolver: zodResolver(NovaCategoriaSchema),
    defaultValues: {
      name: "",
      date: new Date(),
      subcategoria: "",
    },
  });

  const fetchUserData = useCallback(async () => {
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
  }, [setUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (userData?.user?.categoria) {
      const initialSubcategoriasMap = userData.user.categoria.reduce(
        (acc: { [categoryId: string]: string[] }, categoria: any) => {
          acc[categoria.id] =
            categoria.Subcategorias?.map((sub: any) => sub.name) || [];
          return acc;
        },
        {},
      );
      setSubcategoriasMap(initialSubcategoriasMap);
    }
  }, [userData?.user]);

  const toggleAside = () => {
    setIsAsideOpen(!isAsideOpen);
    form.reset({
      name: "",
      date: new Date(),
      subcategoria: "",
    });
  };

  const toggleModal = (selectedIds: string[]) => {
    setSelectedIdsForModal(selectedIds);
    setModalOpen(!modalOpen);
  };

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

  const criarCategoria = async (
    values: z.infer<typeof NovaCategoriaSchema>,
  ) => {
    setError("");
    setSuccess("");
    setLoadingError(false);

    const loadingInterval = startLoading();
    toggleAside();

    try {
      const categoriaValues = {
        ...values,
        subcategoria: subcategoriasMap["new"] || [],
      };

      const data = await CriarCategoria(categoriaValues);

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
      }
    } catch (error) {
      setError("Ocorreu um erro ao criar a categoria");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };
  const [updateSelectedRows, setUpdateSelectedRows] = useState<
    ((ids: string[]) => void) | null
  >(null);

  const atualizarCategoria = async (categoryId: string) => {
    setEditAsideOpen((prev) => ({ ...prev, [categoryId]: false }));
    const loadingInterval = startLoading();
    setError("");
    setSuccess("");

    try {
      const categoriaValues = {
        ...form.getValues(),
        subcategoria: subcategoriasMap[categoryId] || [],
      };

      const data = await AtualizarCategoria(categoriaValues, categoryId);
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
        setSelectedIdsForModal([]); // Limpa as checkboxes
        if (updateSelectedRows) updateSelectedRows([]); // Verifique se updateSelectedRows está definido
      }
    } catch (error) {
      setError("Ocorreu um erro ao atualizar a categoria");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };

  const excluirCategorias = async (categoryIds: string[]) => {
    setModalOpen(false);
    setError("");
    setSuccess("");
    setLoadingError(false);
    const loadingInterval = startLoading();

    try {
      const data = await ExcluirCategoria(categoryIds);

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
        setSelectedIdsForModal([]); // Clear checkboxes
        if (updateSelectedRows) updateSelectedRows([]);
      }
    } catch (error) {
      setError("Ocorreu um erro ao excluir as categorias");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
    }
  };

  const editingAside = (categoryId: string, category: any) => {
    if (category) {
      form.setValue("name", category.name || "");
      form.setValue("subcategoria", "");

      const subcategories = Array.isArray(category.subcategorias)
        ? category.subcategorias.map((sub: any) => sub.name)
        : [];

      setSubcategoriasMap((prev) => ({
        ...prev,
        [categoryId]: subcategories,
      }));
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

  const renderCategoryActions = (categoryId: string) => {
    const selectedCategory = userData?.user?.categoria.find(
      (cat: any) => cat.id === categoryId,
    );

    return (
      <Aside
        isOpen={editAsideOpen[categoryId] || false}
        toggleAside={() => editingAside(categoryId, selectedCategory)}
        content={
          <AsideContent>
            <Input
              label="Nome"
              placeholder="Ex: Comida"
              value={form.watch("name")}
              onChange={(e) => form.setValue("name", e.target.value)}
            />
            <div style={{ display: "flex", gap: "8px", alignItems: "end" }}>
              <Input
                label="Subcategoria"
                placeholder="Ex: Ifood"
                value={form.watch("subcategoria") || ""}
                onChange={(e) => form.setValue("subcategoria", e.target.value)}
              />
              <div style={{ width: "min-content" }}>
                <Button
                  label="Adicionar"
                  size="md"
                  variant="primary"
                  onClick={() => adicionarSubcategoria(categoryId)}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(subcategoriasMap[categoryId] || []).map((subcategoria) => (
                <Tag
                  key={subcategoria}
                  content={subcategoria}
                  onClose={() => removerSubcategoria(categoryId, subcategoria)}
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
                label="Atualizar"
                onClick={() => atualizarCategoria(categoryId)}
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
        title="Editar categoria"
        description="Edite a categoria e suas subcategorias."
      />
    );
  };

  const columns: string[] = ["Data", "Categoria", "Subcategorias"];

  const data = userData?.user?.categoria
    ? [...userData.user.categoria].reverse().map((categoria: any) => {
        const subcategorias = categoria.subcategorias || [];
        let totalWidth = 0;
        const maxWidth = 400;
        const displayedSubcategorias: any[] = [];
        let remainingCount = 0;

        subcategorias.forEach((sub: any) => {
          const subWidth = sub.name.length * 8 + 32;
          if (totalWidth + subWidth <= maxWidth) {
            displayedSubcategorias.push(sub);
            totalWidth += subWidth;
          } else {
            remainingCount++;
          }
        });

        return {
          id: categoria.id,
          Data: new Date(categoria.createdAt).toLocaleDateString("pt-BR"),
          Categoria: categoria.name,
          Subcategorias: (
            <div style={{ display: "flex", gap: "4px", flexWrap: "nowrap" }}>
              {displayedSubcategorias.map((sub: any) => (
                <Badge
                  type="light"
                  variant="primary"
                  key={sub.id}
                  label={sub.name}
                />
              ))}
              {remainingCount > 0 && (
                <Badge
                  type="light"
                  variant="primary"
                  label={`+${remainingCount}`}
                />
              )}
            </div>
          ),
        };
      })
    : [];

  const isFormValid = form.watch("name") && form.watch("date");
  const userDataIsValid = userData && userData.user;

  const handleUpdateSelectedRows = useCallback((updateSelectedRows: any) => {
    setUpdateSelectedRows(() => updateSelectedRows);
  }, []);

  return (
    <>
      <Page
        namePage="Categorias"
        withActionPrimary={
          userDataIsValid ? userData.user.categoria.length > 0 : undefined
        }
        buttonContentPrimary="Adicionar"
        onClickActionPrimary={toggleAside}
      >
        <AuthProgress loading={loading} error={loadingError} />
        {(userDataIsValid ? userData.user.categoria.length < 1 : undefined) ? (
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
                title="Crie categorias para organizar as suas despesas!"
                description="Classifique cada despesa em uma categoria apropriada para facilitar a organização e análise do seu controle financeiro."
                icon="car_tag"
                buttonContentPrimary="Adicionar categoria"
                onClickActionPrimary={toggleAside}
              />
            </div>
          </div>
        ) : (
          <DataTable
            minColumnWidths={[0, 0, 420]}
            textRowsSelected={`categoria${selectedIdsForModal.length > 1 ? "s" : ""} selecionada${selectedIdsForModal.length > 1 ? "s" : ""}`}
            skeleton={skeleton}
            rowsPerPage={5}
            columns={columns}
            data={data}
            withCheckbox={true}
            onUpdateSelectedRows={handleUpdateSelectedRows}
            onSelectedRowsChange={(selectedRows) =>
              setSelectedIdsForModal(selectedRows)
            }
            headerSelectedChildren={
              <>
                <Button
                  size="md"
                  variant="secondary"
                  typeIcon="delete"
                  label="Excluir"
                  onClick={() => toggleModal(selectedIdsForModal)}
                  disabled={selectedIdsForModal.length === 0}
                />
                {selectedIdsForModal.length === 1 && (
                  <Button
                    size="md"
                    variant="secondary"
                    label="Editar"
                    onClick={() => {
                      const selectedCategory = userData?.user?.categoria.find(
                        (cat: any) => cat.id === selectedIdsForModal[0],
                      );
                      if (selectedCategory) {
                        editingAside(selectedIdsForModal[0], selectedCategory);
                      }
                    }}
                  />
                )}
              </>
            }
          />
        )}
        <Aside
          isOpen={isAsideOpen}
          toggleAside={toggleAside}
          title="Adicionar categoria"
          description="Adicione uma categoria e suas subcategorias."
          content={
            <AsideContent>
              <Input
                label="Nome"
                placeholder="Ex: Comida"
                value={form.watch("name")}
                onChange={(e) => form.setValue("name", e.target.value)}
              />
              <div style={{ display: "flex", gap: "8px", alignItems: "end" }}>
                <Input
                  label="Subcategoria"
                  placeholder="Ex: Ifood"
                  value={form.watch("subcategoria") || ""}
                  onChange={(e) =>
                    form.setValue("subcategoria", e.target.value)
                  }
                />
                <div style={{ width: "min-content" }}>
                  <Button
                    label="Adicionar"
                    size="md"
                    variant="primary"
                    onClick={() => adicionarSubcategoria("new")}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(subcategoriasMap["new"] || []).map((subcategoria) => (
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
                  onClick={form.handleSubmit(criarCategoria)}
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
                onClick={() => excluirCategorias(selectedIdsForModal)}
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
              Esta ação é irreversível. Todo o histórico dessas categorias será
              perdido. {selectedIdsForModal.length} categoria
              {selectedIdsForModal.length > 1 ? "s" : ""} ser
              {selectedIdsForModal.length > 1 ? "ão" : "á"} excluída
              {selectedIdsForModal.length > 1 ? "s" : ""}.
            </p>
          </ContentModal>
        }
        title="Excluir categorias"
        description={`Tem certeza de que deseja excluir as categorias selecionadas?`}
        isOpen={modalOpen}
        dismissible={true}
      />
      {renderCategoryActions(selectedIdsForModal[0])}
    </>
  );
}
