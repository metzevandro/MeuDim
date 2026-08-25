import React from "react";
import { NotificationContainer } from "design-system-zeroz";

type NotificationEntry = React.ComponentProps<
  typeof NotificationContainer
>["notifications"][number];

interface IncomeSourceNotificationNotificationProps {
  isOpen: boolean;
  message?: string;
  isError: boolean;
  onClose?: () => void;
}

export const IncomeSourceNotification: React.FC<
  IncomeSourceNotificationNotificationProps
> = ({ isOpen, message, isError = false, onClose }) => {
  const notifications: NotificationEntry[] = isOpen
    ? [
        {
          id: "earning-notification",
          title: message || "",
          variant: isError ? "warning" : "success",
          icon: isError ? "warning" : "check_circle",
          onClose,
        },
      ]
    : [];

  return <NotificationContainer notifications={notifications} />;
};
