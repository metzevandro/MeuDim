"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button, Page } from "design-system-zeroz";
import AuthProgress from "@/components/auth/progress/progress";
import { useUser } from "@/data/provider";

import {
  useLoadingManager,
  useIncomeSourceForm,
  useIncomeSourceData,
} from "./_hooks";

import {
  IncomeSourceForm,
  IncomeSourceTable,
  IncomeSourceEmpty,
  IncomeSourceDeleteModal,
} from "./_components";
import { AppNotification } from "@/components/notification/AppNotification";

import { transformIncomeSourcesForTable } from "./_utils/transformers";
import { INCOME_SOURCE_TEXTS } from "./_utils/const";

export default function IncomeSourcePage() {
  const { userData } = useUser();
  const {
    loading: loadingProgress,
    startLoading,
    stopLoading,
  } = useLoadingManager();
  const {
    incomeSources,
    loading: loadingData,
    notification,
    closeNotification,
    create,
    update,
    delete: deleteIncomeSource,
    handleSearch,
    handleSort,
    onPageChange,
    page,
    totalItems,
  } = useIncomeSourceData();
  const form = useIncomeSourceForm();

  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const clearSelectionRef = React.useRef<((ids: string[]) => void) | null>(
    null,
  );

  const tableData = useMemo(
    () => transformIncomeSourcesForTable(incomeSources),
    [incomeSources],
  );

  const handleToggleAddAside = useCallback(() => {
    setIsAsideOpen((prev) => !prev);
    setIsEditMode(false);
    setEditingId(null);
    form.reset();
  }, [form]);

  const handleOpenEditAside = useCallback(
    (id: string, name: string) => {
      setEditingId(id);
      setIsEditMode(true);
      setIsAsideOpen(true);
      form.populate({ name });
    },
    [form],
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
        clearSelectionRef.current?.([]);
      }
    } else {
      const interval = startLoading();
      setIsAsideOpen(false);
      const success = await create(values);
      stopLoading(interval, success);

      if (success) {
        form.reset();
        clearSelectionRef.current?.([]);
      }
    }
  }, [form, isEditMode, editingId, create, update, startLoading, stopLoading]);

  const handleOpenDeleteModal = useCallback((ids: string[]) => {
    setSelectedRows(ids);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const interval = startLoading();
    setIsDeleteModalOpen(false);

    const success = await deleteIncomeSource(selectedRows);

    stopLoading(interval, success);

    if (success) {
      clearSelectionRef.current?.([]);
      setSelectedRows([]);
    }
  }, [selectedRows, deleteIncomeSource, startLoading, stopLoading]);

  const isTableLoading = loadingData || loadingProgress > 0;
  const hasData = incomeSources.length > 0;
  const userIsValid = !!userData?.user;

  const handleUpdateSelectedRows = useCallback(
    (updater: (ids: string[]) => void) => {
      clearSelectionRef.current = updater;
    },
    [],
  );

  return (
    <>
      <Page
        namePage={INCOME_SOURCE_TEXTS.PAGE_TITLE}
        actions={
          <>
            <Button onClick={handleToggleAddAside}>
              {INCOME_SOURCE_TEXTS.BUTTON_ADD}
            </Button>
            ,
          </>
        }
      >
        <AuthProgress loading={loadingProgress} error={false} />

        {userIsValid && !hasData && !loadingData ? (
          <IncomeSourceEmpty onAddClick={handleToggleAddAside} />
        ) : (
          <IncomeSourceTable
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
            page={page}
            totalItems={totalItems}
          />
        )}

        <IncomeSourceForm
          isOpen={isAsideOpen}
          isEditMode={isEditMode}
          formValue={form.name}
          isFormValid={form.isValid}
          onNameChange={(value: string) => form.setValue("name", value)}
          onToggleAside={handleToggleAddAside}
          onSubmit={handleSubmitForm}
          isLoading={loadingProgress > 0}
        />

        <IncomeSourceDeleteModal
          isOpen={isDeleteModalOpen}
          selectedCount={selectedRows.length}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
          isLoading={loadingProgress > 0}
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
