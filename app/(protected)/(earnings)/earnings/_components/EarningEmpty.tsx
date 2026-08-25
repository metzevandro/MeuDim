import React from "react";
import { Button, EmptyState } from "design-system-zeroz";
import { EARNING_TEXTS } from "../_utils/const";

interface IncomeSourceEmptyProps {
  onAddClick: () => void;
}

/**
 * Estado vazio quando não há fontes de renda
 */
export const EarningEmpty: React.FC<IncomeSourceEmptyProps> = ({
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
          title={EARNING_TEXTS.EMPTY_STATE.TITLE}
          description={EARNING_TEXTS.EMPTY_STATE.DESCRIPTION}
          icon="savings"
          actions={[
            <Button
              key="primary"
              content={EARNING_TEXTS.EMPTY_STATE.BUTTON}
              onClick={onAddClick}
            >
              {EARNING_TEXTS.EMPTY_STATE.BUTTON}
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};
