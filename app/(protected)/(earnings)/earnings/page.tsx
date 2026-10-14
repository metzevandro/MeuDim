"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button, Page } from "design-system-zeroz";
import AuthProgress from "@/components/auth/progress/progress";
import { useUser } from "@/data/provider";
import { useLoadingManager } from "./_hooks/useLoadingManager";
import { useEarningData } from "./_hooks/useEarningData";
import { useEarningForm } from "./_hooks/useEarningForm";
import { EarningTable } from "./_components/EarningTable";
import { EarningEmpty } from "./_components/EarningEmpty";
import { EarningForm } from "./_components/EarningForm";
import { EarningDeleteModal } from "./_components/EarningDeleteModal";
import { EarningImportModal } from "./_components/EarningImportModal";
import { AppNotification } from "@/components/notification/AppNotification";
import { EARNING_TEXTS } from "./_utils/const";
import { transformEarningsForTable } from "./_utils/transformers";

import "./styles.scss";

export default function FonteDeRendaPage() {
  const { userData } = useUser();
  const {
    loading: loadingProgress,
    startLoading,
    stopLoading,
  } = useLoadingManager();
  const {
    earnings,
    loading: loadingData,
    notification,
    closeNotification,
    create,
    update,
    delete: deleteIncomeSource,
    handleSearch,
    handleSort,
    onPageChange,
    refetch,
    search,
    sort,
    page,
    totalItems,
  } = useEarningData();
  const form = useEarningForm();

  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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
      const raw = earnings.find((e) => e.id === id);
      if (!raw) return;

      setEditingId(id);
      setIsEditMode(true);
      setIsAsideOpen(true);
      form.populate({
        amount: raw.amount,
        incomeSourceId: raw.incomeSource?.id ?? "",
        date: raw.createdAt as string,
      });
    },
    [form, earnings],
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
      setSelectedRows([]);
      clearSelectionRef.current?.([]);
    }
  }, [selectedRows, deleteIncomeSource, startLoading, stopLoading]);

  const handleImported = useCallback(() => {
    setSelectedRows([]);
    clearSelectionRef.current?.([]);
    onPageChange(1);
    refetch(search, sort, 1);
  }, [onPageChange, refetch, search, sort]);

  const tableData = useMemo(
    () => transformEarningsForTable(earnings),
    [earnings],
  );
  const isTableLoading = loadingData || loadingProgress > 0;
  const hasData = tableData.length > 0;
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
        namePage={EARNING_TEXTS.PAGE_TITLE}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsImportModalOpen(true)}
              disabled={loadingData}
            >
              {EARNING_TEXTS.BUTTON_IMPORT}
            </Button>
            <Button onClick={handleToggleAddAside} disabled={loadingData}>
              {EARNING_TEXTS.BUTTON_ADD}
            </Button>
          </>
        }
      >
        <AuthProgress loading={loadingProgress} error={false} />

        {userIsValid && !hasData && !loadingData ? (
          <EarningEmpty onAddClick={handleToggleAddAside} />
        ) : (
          <EarningTable
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

        <EarningForm
          isOpen={isAsideOpen}
          isEditMode={isEditMode}
          amount={form.amount}
          date={form.date}
          incomeSourceName={form.incomeSourceName}
          incomeSourceOptions={form.incomeSourceOptions}
          isFormValid={form.isValid}
          onAmountChange={(value) => form.setValue("amount", value)}
          onDateChange={form.setDate}
          onIncomeSourceChange={form.handleIncomeSourceChange}
          onToggleAside={handleToggleAddAside}
          onSubmit={handleSubmitForm}
          isLoading={loadingProgress > 0}
        />

        <EarningDeleteModal
          isOpen={isDeleteModalOpen}
          selectedCount={selectedRows.length}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
          isLoading={loadingProgress > 0}
        />

        <EarningImportModal
          modalOpen={isImportModalOpen}
          setModalOpen={setIsImportModalOpen}
          onImported={handleImported}
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
