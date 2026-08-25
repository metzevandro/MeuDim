"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button, Page } from "design-system-zeroz";
import AuthProgress from "@/components/auth/progress/progress";
import { useUser } from "@/data/provider";
import { useLoadingManager } from "./_hooks/useLoadingManager";
import { useExpenseData } from "./_hooks/useExpenseData";
import { useExpenseForm } from "./_hooks/useExpenseForm";
import { ExpenseTable } from "./_components/ExpenseTable";
import { ExpenseEmpty } from "./_components/ExpenseEmpty";
import { ExpenseForm } from "./_components/ExpenseForm";
import { ExpenseDeleteModal } from "./_components/ExpenseDeleteModal";
import { AppNotification } from "@/components/notification/AppNotification";
import { EXPENSE_TEXTS } from "./_utils/const";
import { transformExpensesForTable } from "./_utils/transformers";

export default function DespesasPage() {
  const { userData } = useUser();
  const {
    loading: loadingProgress,
    startLoading,
    stopLoading,
  } = useLoadingManager();
  const {
    expenses,
    loading: loadingData,
    notification,
    closeNotification,
    create,
    update,
    delete: removeExpense,
    handleSearch,
    handleSort,
    page,
    totalItems,
    onPageChange,
  } = useExpenseData();
  const form = useExpenseForm();

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
      const raw = expenses.find((e) => e.id === id);
      if (!raw) return;

      setEditingId(id);
      setIsEditMode(true);
      setIsAsideOpen(true);
      form.populate({
        amount: raw.amount,
        paymentMethodId: raw.paymentMethod?.id ?? "",
        categoryId: raw.category?.id ?? "",
        subcategoryId: raw.subcategory?.id ?? "",
        date: raw.createdAt as string,
      });
    },
    [form, expenses],
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
    const success = await removeExpense(selectedRows);
    stopLoading(interval, success);

    if (success) {
      setSelectedRows([]);
      clearSelectionRef.current?.([]);
    }
  }, [selectedRows, removeExpense, startLoading, stopLoading]);

  const tableData = useMemo(
    () => transformExpensesForTable(expenses),
    [expenses],
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
        namePage={EXPENSE_TEXTS.PAGE_TITLE}
        actions={
          <>
            <Button onClick={handleToggleAddAside}>
              {EXPENSE_TEXTS.BUTTON_ADD}
            </Button>
            ,
          </>
        }
      >
        <AuthProgress loading={loadingProgress} error={false} />

        {userIsValid && !hasData && !loadingData ? (
          <ExpenseEmpty onAddClick={handleToggleAddAside} />
        ) : (
          <ExpenseTable
            data={tableData}
            skeleton={isTableLoading}
            selectedRows={selectedRows}
            onSelectedRowsChange={setSelectedRows}
            onUpdateSelectedRows={handleUpdateSelectedRows}
            onEdit={handleOpenEditAside}
            onDelete={handleOpenDeleteModal}
            onSearch={handleSearch}
            onSort={handleSort}
            page={page}
            onPageChange={onPageChange}
            totalItems={totalItems}
          />
        )}

        <ExpenseForm
          isOpen={isAsideOpen}
          isEditMode={isEditMode}
          amount={form.amount}
          date={form.date}
          paymentMethodName={form.paymentMethodName}
          paymentMethodOptions={form.paymentMethodOptions}
          categoryName={form.categoryName}
          categoryOptions={form.categoryOptions}
          subcategoryName={form.subcategoryName}
          subcategoryOptions={form.subcategoryOptions}
          isFormValid={form.isValid}
          onAmountChange={(value) => form.setValue("amount", value)}
          onDateChange={form.setDate}
          onPaymentMethodChange={form.handlePaymentMethodChange}
          onCategoryChange={form.handleCategoryChange}
          onSubcategoryChange={form.handleSubcategoryChange}
          onToggleAside={handleToggleAddAside}
          onSubmit={handleSubmitForm}
          isLoading={loadingProgress > 0}
        />

        <ExpenseDeleteModal
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
