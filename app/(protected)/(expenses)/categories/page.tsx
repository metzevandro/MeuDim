"use client";

import React, { useCallback, useState, useMemo } from "react";
import { Button, Page } from "design-system-zeroz";
import AuthProgress from "@/components/auth/progress/progress";
import { useUser } from "@/data/provider";
import { useLoadingManager } from "./_hooks/useLoadingManager";
import { useCategoryData } from "./_hooks/useCategoryData";
import { useCategoryForm } from "./_hooks/useCategoryForm";
import {
  CategoryForm,
  CategoryTable,
  CategoryEmpty,
  CategoryDeleteModal,
} from "./_components";
import { AppNotification } from "@/components/notification/AppNotification";
import { CATEGORY_TEXTS } from "./_utils/const";
import { transformCategoryForTable } from "./_utils/transformers";
import "./styles.scss";

export default function CategoryPage() {
  const { userData } = useUser();
  const {
    categories,
    loading: loadingData,
    notification,
    closeNotification,
    create,
    update,
    delete: deleteCategories,
    handleSearch,
    handleSort,
    onPageChange,
    page,
    totalItems,
  } = useCategoryData();
  const {
    loading: loadingProgress,
    error: loadingError,
    startLoading,
    stopLoading,
  } = useLoadingManager();
  const form = useCategoryForm();

  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const clearSelectionRef = React.useRef<((ids: string[]) => void) | null>(
    null,
  );

  const handleToggleAddAside = useCallback(() => {
    setIsAsideOpen((prev) => !prev);
    setIsEditMode(false);
    setEditingId(null);
    form.reset();
  }, [form]);

  const handleOpenEditAside = useCallback(
    (id: string) => {
      const category = categories.find((c: any) => c.id === id);
      if (!category) return;

      setEditingId(id);
      setIsEditMode(true);
      setIsAsideOpen(true);
      form.populate({
        name: category.name || "",
        subcategorias: Array.isArray(category.subcategories)
          ? category.subcategories.map((sub: any) => sub.name)
          : [],
      });
    },
    [form, categories],
  );

  const handleOpenDeleteModal = useCallback((ids: string[]) => {
    setSelectedRows(ids);
    setIsDeleteModalOpen(true);
  }, []);

  const handleUpdateSelectedRows = useCallback(
    (updater: (ids: string[]) => void) => {
      clearSelectionRef.current = updater;
    },
    [],
  );

  const handleSubmitForm = useCallback(async () => {
    const values = form.getValues();

    if (isEditMode && editingId) {
      const interval = startLoading();
      setIsAsideOpen(false);
      const success = await update(editingId, values);
      stopLoading(interval, success);

      if (success) {
        form.reset();
        setEditingId(null);
        setIsEditMode(false);
        setSelectedRows([]);
        clearSelectionRef.current?.([]);
      }
    } else {
      const interval = startLoading();
      setIsAsideOpen(false);
      const success = await create(values);
      stopLoading(interval, success);

      if (success) {
        form.reset();
        setSelectedRows([]);
        clearSelectionRef.current?.([]);
      }
    }
  }, [form, isEditMode, editingId, create, update, startLoading, stopLoading]);

  const handleConfirmDelete = useCallback(async () => {
    const interval = startLoading();
    setIsDeleteModalOpen(false);
    const success = await deleteCategories(selectedRows);
    stopLoading(interval, success);

    if (success) {
      setSelectedRows([]);
      clearSelectionRef.current?.([]);
    }
  }, [selectedRows, deleteCategories, startLoading, stopLoading]);

  const tableData = useMemo(
    () => transformCategoryForTable(categories),
    [categories],
  );
  const isTableLoading = loadingData || loadingProgress > 0;
  const hasData = tableData.length > 0;
  const userIsValid = !!userData?.user;

  return (
    <>
      <Page
        namePage={CATEGORY_TEXTS.PAGE_TITLE}
        actions={
          <>
            <Button onClick={handleToggleAddAside}>
              {CATEGORY_TEXTS.BUTTON_ADD}
            </Button>
            ,
          </>
        }
      >
        <AuthProgress loading={loadingProgress} error={loadingError} />

        {userIsValid && !hasData && !loadingData ? (
          <CategoryEmpty onAddClick={handleToggleAddAside} />
        ) : (
          <CategoryTable
            data={tableData}
            skeleton={isTableLoading}
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
            onUpdateSelectedRows={handleUpdateSelectedRows}
            onEdit={handleOpenEditAside}
            onDelete={handleOpenDeleteModal}
            onSearch={handleSearch}
            onSort={handleSort}
            onPageChange={onPageChange}
            totalItems={totalItems}
            page={page}
          />
        )}

        <CategoryForm
          isOpen={isAsideOpen}
          isEditMode={isEditMode}
          name={form.name}
          subcategoryDraft={form.subcategoryDraft}
          subcategories={form.subcategories}
          isFormValid={form.isValid}
          onNameChange={form.setName}
          onSubcategoryDraftChange={form.setSubcategoryDraft}
          onAddSubcategory={form.addSubcategory}
          onRemoveSubcategory={form.removeSubcategory}
          onToggleAside={handleToggleAddAside}
          onSubmit={handleSubmitForm}
        />

        <CategoryDeleteModal
          isOpen={isDeleteModalOpen}
          selectedCount={selectedRows.length}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      </Page>

      <AppNotification
        isOpen={notification.open}
        message={notification.message}
        isError={notification.isError}
        onClose={closeNotification}
      />
    </>
  );
}
