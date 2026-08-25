import { useCallback, useEffect, useState } from "react";

export interface NotificationState {
  open: boolean;
  message?: string;
  isError: boolean;
  timeStamp: number;
}

const INITIAL_STATE: NotificationState = {
  open: false,
  message: "",
  isError: false,
  timeStamp: 0,
};

const AUTO_CLOSE_MS = 4000;

/**
 * Hook genérico de notificação "toast".
 *
 * Centraliza o estado de open/message/isError e o auto-close de 4s
 * que antes estava duplicado em useCategoryData, useExpenseData,
 * usePaymentMethodData, useIncomeSourceData, useEarningData, etc.
 *
 * Uso:
 *   const { notification, showNotification, closeNotification } = useNotification();
 *   showNotification("Criado com sucesso!", false);
 *   showNotification("Erro ao salvar", true);
 */
export function useNotification() {
  const [notification, setNotification] =
    useState<NotificationState>(INITIAL_STATE);

  const showNotification = useCallback((message: string, isError: boolean) => {
    setNotification({ open: true, message, isError, timeStamp: Date.now() });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(INITIAL_STATE);
  }, []);

  useEffect(() => {
    if (!notification.open) return;
    const timer = setTimeout(closeNotification, AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [notification.timeStamp, notification.open, closeNotification]);

  return {
    notification,
    showNotification,
    closeNotification,
  };
}
