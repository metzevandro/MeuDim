import React from "react";
import { Button, EmptyState } from "design-system-zeroz";
import { PAYMENT_METHOD_TEXTS } from "../_utils/const";

interface PaymentMethodEmptyProps {
  onAddClick: () => void;
}

/**
 * Estado vazio quando não há formas de pagamento cadastradas
 */
export const PaymentMethodEmpty: React.FC<PaymentMethodEmptyProps> = ({
  onAddClick,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          maxWidth: "700px",
        }}
      >
        <EmptyState
          title={PAYMENT_METHOD_TEXTS.EMPTY_STATE.TITLE}
          description={PAYMENT_METHOD_TEXTS.EMPTY_STATE.DESCRIPTION}
          icon="savings"
          actions={[
            <Button
              key="primary"
              content={PAYMENT_METHOD_TEXTS.EMPTY_STATE.BUTTON}
              onClick={onAddClick}
            >
              {PAYMENT_METHOD_TEXTS.EMPTY_STATE.BUTTON}
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};
