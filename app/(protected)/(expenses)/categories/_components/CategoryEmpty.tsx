import React from "react";
import { Button, EmptyState } from "design-system-zeroz";
import { CATEGORY_TEXTS } from "../_utils/const";

interface CategoryEmptyProps {
  onAddClick: () => void;
}

/**
 * Estado vazio quando não há categorias cadastradas
 */
export const CategoryEmpty: React.FC<CategoryEmptyProps> = ({ onAddClick }) => {
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
          maxWidth: "500px",
        }}
      >
        <EmptyState
          title={CATEGORY_TEXTS.EMPTY_STATE.TITLE}
          description={CATEGORY_TEXTS.EMPTY_STATE.DESCRIPTION}
          icon={CATEGORY_TEXTS.EMPTY_STATE.ICON}
          actions={
            <Button onClick={onAddClick}>
              {CATEGORY_TEXTS.EMPTY_STATE.BUTTON}
            </Button>
          }
        ></EmptyState>
      </div>
    </div>
  );
};
