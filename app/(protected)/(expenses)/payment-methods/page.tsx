"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button, Page } from "design-system-zeroz";
import AuthProgress from "@/components/auth/progress/progress";
import { useUser } from "@/data/provider";
import { useLoadingManager } from "./_hooks/useLoadingManager";
import { usePaymentMethodData } from "./_hooks/usePaymentMethodData";
import {
  PaymentMethodEmpty,
  PaymentMethodTable,
  PaymentMethodForm,
  PaymentMethodDeleteModal,
} from "./_components";
import { PAYMENT_METHOD_TEXTS } from "./_utils/const";
import { transformPaymentMethodForTable } from "./_utils/transformers";
import { AppNotification } from "@/components/notification/AppNotification";
import { usePaymentMethodForm } from "./_hooks/usePaymentMethodForm";

export default function PaymentMethodPage() {
  const { userData } = useUser();
  const {
    loading: loadingProgress,
    startLoading,
    stopLoading,
  } = useLoadingManager();
  const {
    paymentMethod,
    loading: loadingData,
    notification,
    closeNotification,
    create,
    update,
    delete: deletePaymentMethod,
    handleSearch,
    handleSort,
    page,
    totalItems,
    onPageChange,
  } = usePaymentMethodData();
  const form = usePaymentMethodForm();

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
      const raw = paymentMethod.find((e) => e.id === id);
      if (!raw) return;

      setEditingId(id);
      setIsEditMode(true);
      setIsAsideOpen(true);
      form.populate({
        name: raw.name as string,
      });
    },
    [form, paymentMethod],
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
    const success = await deletePaymentMethod(selectedRows);
    stopLoading(interval, success);

    if (success) {
      setSelectedRows([]);
      clearSelectionRef.current?.([]);
    }
  }, [selectedRows, deletePaymentMethod, startLoading, stopLoading]);

  const tableData = useMemo(
    () => transformPaymentMethodForTable(paymentMethod),
    [paymentMethod],
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
      <AuthProgress loading={loadingProgress} error={false} />

      <Page
        namePage={PAYMENT_METHOD_TEXTS.PAGE_TITLE}
        actions={
          <>
            <Button onClick={handleToggleAddAside}>
              {PAYMENT_METHOD_TEXTS.BUTTON_ADD}
            </Button>
            ,
          </>
        }
      >
        {userIsValid && !hasData && !loadingData ? (
          <PaymentMethodEmpty onAddClick={handleToggleAddAside} />
        ) : (
          <PaymentMethodTable
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

        <PaymentMethodForm
          isOpen={isAsideOpen}
          isEditMode={isEditMode}
          name={form.name}
          onNameChange={form.setName}
          isFormValid={form.isValid}
          onToggleAside={handleToggleAddAside}
          onSubmit={handleSubmitForm}
          isLoading={loadingProgress > 0}
        />

        <PaymentMethodDeleteModal
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
