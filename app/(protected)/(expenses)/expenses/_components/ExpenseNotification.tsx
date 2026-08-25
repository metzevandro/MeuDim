import React from "react";
import { NotificationContainer } from "design-system-zeroz";

type NotificationEntry = React.ComponentProps<
  typeof NotificationContainer
>["notifications"][number];

interface ExpenseNotificationProps {
  isOpen: boolean;
  message?: string;
  isError?: boolean;
  onClose?: () => void;
}

export const ExpenseNotification: React.FC<ExpenseNotificationProps> = ({
  isOpen,
  message,
  isError = false,
  onClose,
}) => {
  const notifications: NotificationEntry[] = isOpen
    ? [
        {
          id: "expense-notification",
          title: message || "",
          variant: isError ? "warning" : "success",
          icon: isError ? "warning" : "check_circle",
          onClose,
        },
      ]
    : [];

  return <NotificationContainer notifications={notifications} />;
};
