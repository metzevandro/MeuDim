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
