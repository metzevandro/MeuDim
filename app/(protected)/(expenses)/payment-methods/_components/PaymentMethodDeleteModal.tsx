import React from "react";
import { Modal, ContentModal, FooterModal, Button } from "design-system-zeroz";
import { PAYMENT_METHOD_TEXTS } from "../_utils/const";

interface PaymentMethodDeleteModalProps {
  isOpen: boolean;
  selectedCount: number;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Modal de confirmação para deletar formas de pagamento
 * Adapta o texto baseado na quantidade selecionada
 */
export const PaymentMethodDeleteModal: React.FC<
  PaymentMethodDeleteModalProps
> = ({ isOpen, selectedCount, onConfirm, onCancel, isLoading = false }) => {
  return (
    <Modal
      hideModal={onCancel}
      isOpen={isOpen}
      dismissible={!isLoading}
      title={PAYMENT_METHOD_TEXTS.DELETE_MODAL.TITLE}
      description={PAYMENT_METHOD_TEXTS.DELETE_MODAL.GET_DESCRIPTION(
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
            {PAYMENT_METHOD_TEXTS.DELETE_MODAL.GET_CONTENT(selectedCount)}
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
              {PAYMENT_METHOD_TEXTS.BUTTON_DELETE}
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              {PAYMENT_METHOD_TEXTS.BUTTON_CANCEL}
            </Button>
          </div>
        </FooterModal>
      }
    />
  );
};
