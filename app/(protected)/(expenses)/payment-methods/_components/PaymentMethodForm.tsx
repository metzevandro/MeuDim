import React from "react";
import { Aside, AsideContent, AsideFooter, Button } from "design-system-zeroz";
import { PAYMENT_METHOD_TEXTS } from "../_utils/const";

interface PaymentMethodFormProps {
  isOpen: boolean;
  isEditMode?: boolean;
  name: string;
  isFormValid: boolean;
  onNameChange: (value: string) => void;
  onToggleAside: () => void;
  onSubmit: () => void | Promise<void>;
  isLoading?: boolean;
}

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  isOpen,
  isEditMode = false,
  name,
  isFormValid,
  onNameChange,
  onToggleAside,
  onSubmit,
  isLoading = false,
}) => {
  const texts = isEditMode
    ? PAYMENT_METHOD_TEXTS.ASIDE_EDIT
    : PAYMENT_METHOD_TEXTS.ASIDE_CREATE;
  const buttonLabel = isEditMode
    ? PAYMENT_METHOD_TEXTS.BUTTON_UPDATE
    : PAYMENT_METHOD_TEXTS.BUTTON_ADD;

  return (
    <Aside
      isOpen={isOpen}
      toggleAside={onToggleAside}
      title={texts.TITLE}
      description={texts.DESCRIPTION}
      content={
        <AsideContent>
          <div className="input-root">
            <div className="input-header">
              <label>
                {PAYMENT_METHOD_TEXTS.ASIDE_CREATE.LABEL_PAYMENT_METHOD}
              </label>
            </div>
            <div>
              <div className="input-content">
                <input
                  type="text"
                  placeholder={
                    PAYMENT_METHOD_TEXTS.ASIDE_CREATE.PLACEHOLDER_PAYMENT_METHOD
                  }
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </AsideContent>
      }
      footer={
        <AsideFooter>
          <div
            style={{
              width: "min-content",
              display: "flex",
              gap: "var(--s-spacing-x-small)",
            }}
          >
            <Button
              size="md"
              variant="primary"
              onClick={onSubmit}
              disabled={!isFormValid || isLoading}
            >
              {buttonLabel}
            </Button>
            <Button
              size="md"
              variant="secondary"
              onClick={onToggleAside}
              disabled={isLoading}
            >
              {PAYMENT_METHOD_TEXTS.BUTTON_CANCEL}
            </Button>
          </div>
        </AsideFooter>
      }
    />
  );
};
