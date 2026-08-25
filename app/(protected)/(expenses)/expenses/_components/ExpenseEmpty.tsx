import React from "react";
import { Button, EmptyState } from "design-system-zeroz";
import { EXPENSE_TEXTS } from "../_utils/const";

interface ExpenseEmptyProps {
  onAddClick: () => void;
}

/**
 * Estado vazio quando não há despesas
 */
export const ExpenseEmpty: React.FC<ExpenseEmptyProps> = ({ onAddClick }) => {
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
          title={EXPENSE_TEXTS.EMPTY_STATE.TITLE}
          description={EXPENSE_TEXTS.EMPTY_STATE.DESCRIPTION}
          icon="savings"
          actions={[
            <Button
              key="primary"
              content={EXPENSE_TEXTS.EMPTY_STATE.BUTTON}
              onClick={onAddClick}
            >
              {EXPENSE_TEXTS.EMPTY_STATE.BUTTON}
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};
