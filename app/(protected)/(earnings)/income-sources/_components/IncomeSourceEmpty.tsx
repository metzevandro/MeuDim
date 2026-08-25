import React from "react";
import { Button, EmptyState } from "design-system-zeroz";
import { INCOME_SOURCE_TEXTS } from "../_utils/const";

interface IncomeSourceEmptyProps {
  onAddClick: () => void;
}

/**
 * Estado vazio quando não há fontes de renda
 */
export const IncomeSourceEmpty: React.FC<IncomeSourceEmptyProps> = ({
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
          title={INCOME_SOURCE_TEXTS.EMPTY_STATE.TITLE}
          description={INCOME_SOURCE_TEXTS.EMPTY_STATE.DESCRIPTION}
          icon="savings"
          actions={[
            <Button key="primary" onClick={onAddClick}>
              {INCOME_SOURCE_TEXTS.EMPTY_STATE.BUTTON}
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};
