import React from "react";
import { NotificationContainer } from "design-system-zeroz";

type NotificationEntry = React.ComponentProps<
  typeof NotificationContainer
>["notifications"][number];

export interface AppNotificationProps {
  isOpen: boolean;
  message?: string;
  isError?: boolean;
  onClose?: () => void;
  id?: string;
}

/**
 * Notificação padrão do app (toast flutuante).
 *
 * Uso (junto com o hook useNotification):
 *   const { notification, showNotification, closeNotification } = useNotification();
 *   ...
 *   <AppNotification
 *     isOpen={notification.open}
 *     message={notification.message}
 *     isError={notification.isError}
 *     onClose={closeNotification}
 *   />
 */
export const AppNotification: React.FC<AppNotificationProps> = ({
  isOpen,
  message,
  isError = false,
  onClose,
  id = "app-notification",
}) => {
  const notifications: NotificationEntry[] = isOpen
    ? [
        {
          id,
          title: message || "",
          variant: isError ? "warning" : "success",
          icon: isError ? "warning" : "check_circle",
          onClose,
        },
      ]
    : [];

  return <NotificationContainer notifications={notifications} />;
};
