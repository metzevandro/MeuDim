import React from "react";
import {
  Aside,
  AsideContent,
  AsideFooter,
  Button,
  Input,
} from "design-system-zeroz";
import { INCOME_SOURCE_TEXTS } from "../_utils/const";

interface IncomeSourceFormProps {
  isOpen: boolean;
  isEditMode?: boolean;
  formValue: string;
  isFormValid: boolean;
  onNameChange: (value: string) => void;
  onToggleAside: () => void;
  onSubmit: () => void | Promise<void>;
  isLoading?: boolean;
}

/**
 * Componente reutilizável para formulário de Fonte de Renda
 * Usado tanto para criar quanto para editar
 */
export const IncomeSourceForm: React.FC<IncomeSourceFormProps> = ({
  isOpen,
  isEditMode = false,
  formValue,
  isFormValid,
  onNameChange,
  onToggleAside,
  onSubmit,
  isLoading = false,
}) => {
  const texts = isEditMode
    ? INCOME_SOURCE_TEXTS.ASIDE_EDIT
    : INCOME_SOURCE_TEXTS.ASIDE_CREATE;

  const buttonLabel = isEditMode
    ? INCOME_SOURCE_TEXTS.BUTTON_UPDATE
    : INCOME_SOURCE_TEXTS.BUTTON_ADD;

  return (
    <Aside
      isOpen={isOpen}
      toggleAside={onToggleAside}
      title={texts.TITLE}
      description={texts.DESCRIPTION}
      content={
        <AsideContent>
          <Input
            value={formValue}
            onChange={(e: any) => onNameChange(e.target.value)}
            label={INCOME_SOURCE_TEXTS.ASIDE_CREATE.LABEL_NAME}
            placeholder={INCOME_SOURCE_TEXTS.ASIDE_CREATE.PLACEHOLDER_NAME}
            disabled={isLoading}
          />
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
              {INCOME_SOURCE_TEXTS.BUTTON_CANCEL}
            </Button>
          </div>
        </AsideFooter>
      }
    />
  );
};
