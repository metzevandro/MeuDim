"use client";
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
  Skeleton,
} from "design-system-zeroz";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import "./categorias.scss";
import {
  AtualizarCategoria,
  CriarCategoria,
  ExcluirCategoria,
} from "@/actions/categoria";
import AuthProgress from "@/components/auth/Progress/progress";
interface Subcategoria {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

interface Categoria {
  id: string;
  name: string;
  createdAt: string;
  userId: string;
  subcategoria: Subcategoria[];
}

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  subcategoria: Subcategoria[];
  categoria: Categoria[];
}

interface UserData {
  user: User;
  expires: string;
}

const API = process.env.NEXT_PUBLIC_APP_URL;

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

  const [subcategoriasMap, setSubcategoriasMap] = useState<{
    [categoryId: string]: string[];
  }>({});

  useEffect(() => {
    if (userData?.user?.categoria) {
      const initialSubcategoriasMap = userData?.user.categoria.reduce(
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

  const criar = async () => {
    setError("");
    setSuccess("");
    toggleAside();
    setLoadingError(false);

    const loadingInterval = startLoading();

    const categoriaValues = {
      name: form.getValues().name,
      date: form.getValues().date,
      subcategoria: subcategoriasMap["new"] || [],
    };

    try {
      const data = await CriarCategoria(categoriaValues);
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
      setError("Ocorreu um erro ao criar a categoria.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const atualizar = async (categoryId: string) => {
    editingAside(categoryId);
    const categoriaValues = {
      name: form.getValues().name,
      date: form.getValues().date,
      subcategoria: subcategoriasMap[categoryId] || [],
    };
    const loadingInterval = startLoading();

    try {
      const data = await AtualizarCategoria(categoriaValues, categoryId);
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
      setError("Ocorreu um erro ao atualizar a categoria");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
  };

  const excluir = async (categoryId: string) => {
    toggleModal(categoryId);
    const loadingInterval = startLoading();

    try {
      const data = await ExcluirCategoria(categoryId);
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
      setError("Ocorreu um erro ao excluir a fonte de renda.");
      setLoadingError(true);
    } finally {
      stopLoading(loadingInterval, !loadingError);
      fetchUserData();
    }
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
        buttonType="default"
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

  const userDataIsValid = userData && userData.user;

  const data: { [key: string]: any; id: string }[] = userData?.user?.categoria
    ? userData?.user.categoria.map((categoria: any) => {
        const formattedDate = new Date(categoria.createdAt).toLocaleDateString(
          "pt-BR",
        );

        return {
          id: categoria.id,
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
    : [
        {
          id: "1",
          Data: <Skeleton height="32" width="100" />,
          Categoria: <Skeleton height="32" width="100" />,
          Subcategorias: <Skeleton height="32" width="100" />,
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
          Subcategorias: <Skeleton height="32" width="100" />,
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
          Subcategorias: <Skeleton height="32" width="100" />,
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
          Subcategorias: <Skeleton height="32" width="100" />,
          Ações: (
            <div className="actions">
              <Skeleton height="32" width="65" />
              <Skeleton height="32" width="32" />
            </div>
          ),
        },
      ];

  const expandedData: { [key: string]: any; id: string }[] = [];

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
                description="Classifique cada despesa, em uma categoria apropriada para facilitar a organização e análise do seu controle financeiro."
                icon="car_tag"
                buttonContentPrimary="Adicionar categoria"
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
