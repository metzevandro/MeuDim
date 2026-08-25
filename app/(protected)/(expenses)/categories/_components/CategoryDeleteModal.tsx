import React from "react";
import { Modal, ContentModal, FooterModal, Button } from "design-system-zeroz";
import { CATEGORY_TEXTS } from "../_utils/const";

interface CategoryDeleteModalProps {
  isOpen: boolean;
  selectedCount: number;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Modal de confirmação para deletar categorias
 * Adapta o texto baseado na quantidade selecionada
 */
export const CategoryDeleteModal: React.FC<CategoryDeleteModalProps> = ({
  isOpen,
  selectedCount,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      hideModal={onCancel}
      isOpen={isOpen}
      dismissible={true}
      title={CATEGORY_TEXTS.DELETE_MODAL.TITLE}
      description={CATEGORY_TEXTS.DELETE_MODAL.DESCRIPTION}
      content={
        <ContentModal>
          <p
            style={{
              font: "var(--s-typography-paragraph-regular)",
              color: "var(--s-color-content-light)",
              whiteSpace: "normal",
            }}
          >
            {CATEGORY_TEXTS.DELETE_MODAL.GET_CONTENT(selectedCount)}
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
            <Button size="md" variant="warning" onClick={onConfirm}>
              {CATEGORY_TEXTS.BUTTON_DELETE}
            </Button>
            <Button size="md" variant="secondary" onClick={onCancel}>
              {CATEGORY_TEXTS.BUTTON_CANCEL}
            </Button>
          </div>
        </FooterModal>
      }
    />
  );
};
