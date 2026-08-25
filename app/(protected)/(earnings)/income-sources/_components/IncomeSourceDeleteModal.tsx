import React from "react";
import { Modal, ContentModal, FooterModal, Button } from "design-system-zeroz";
import { INCOME_SOURCE_TEXTS } from "../_utils/const";

interface IncomeSourceDeleteModalProps {
  isOpen: boolean;
  selectedCount: number;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Modal de confirmação para deletar fontes de renda
 * Adapta o texto baseado na quantidade selecionada
 */
export const IncomeSourceDeleteModal: React.FC<
  IncomeSourceDeleteModalProps
> = ({ isOpen, selectedCount, onConfirm, onCancel, isLoading = false }) => {
  return (
    <Modal
      hideModal={onCancel}
      isOpen={isOpen}
      dismissible={!isLoading}
      title={INCOME_SOURCE_TEXTS.DELETE_MODAL.TITLE}
      description={INCOME_SOURCE_TEXTS.DELETE_MODAL.GET_DESCRIPTION(
        selectedCount,
      )}
      content={
        <ContentModal>
          <p
            style={{
              font: "var(--s-typography-paragraph-regular)",
              color: "var(--s-color-content-light)",
              whiteSpace: "normal",
            }}
          >
            {INCOME_SOURCE_TEXTS.DELETE_MODAL.GET_CONTENT(selectedCount)}
          </p>
        </ContentModal>
      }
      footer={
        <FooterModal>
          <div
            style={{
              width: "min-content",
              display: "flex",
              gap: "var(--s-spacing-x-small)",
            }}
          >
            <Button
              size="md"
              variant="warning"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {INCOME_SOURCE_TEXTS.BUTTON_DELETE}
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              {INCOME_SOURCE_TEXTS.BUTTON_CANCEL}
            </Button>
          </div>
        </FooterModal>
      }
    />
  );
};
