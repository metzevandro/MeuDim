import React from "react";
import {
  Aside,
  AsideContent,
  AsideFooter,
  Button,
  DatePicker,
  InputSelect,
} from "design-system-zeroz";
import IntlCurrencyInput from "react-currency-input-field";
import { EXPENSE_TEXTS } from "../_utils/const";

interface ExpenseFormProps {
  isOpen: boolean;
  isEditMode?: boolean;
  amount: string;
  date: string;
  paymentMethodName: string;
  paymentMethodOptions: string[];
  categoryName: string;
  categoryOptions: string[];
  subcategoryName: string;
  subcategoryOptions: string[];
  isFormValid: boolean;
  onAmountChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
  onToggleAside: () => void;
  onSubmit: () => void | Promise<void>;
  isLoading?: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  isEditMode = false,
  amount,
  date,
  paymentMethodName,
  paymentMethodOptions,
  categoryName,
  categoryOptions,
  subcategoryName,
  subcategoryOptions,
  isFormValid,
  onAmountChange,
  onDateChange,
  onPaymentMethodChange,
  onCategoryChange,
  onSubcategoryChange,
  onToggleAside,
  onSubmit,
  isLoading = false,
}) => {
  const texts = isEditMode
    ? EXPENSE_TEXTS.ASIDE_EDIT
    : EXPENSE_TEXTS.ASIDE_CREATE;
  const buttonLabel = isEditMode
    ? EXPENSE_TEXTS.BUTTON_UPDATE
    : EXPENSE_TEXTS.BUTTON_ADD;

  return (
    <Aside
      isOpen={isOpen}
      toggleAside={onToggleAside}
      title={texts.TITLE}
      description={texts.DESCRIPTION}
      content={
        <AsideContent>
          <DatePicker
            label={EXPENSE_TEXTS.ASIDE_CREATE.LABEL_DATE}
            value={date}
            onChange={(value: string) => onDateChange(value)}
            disabled={isLoading}
          />
          <div className="input-root">
            <div className="input-header">
              <label>Valor</label>
            </div>
            <div>
              <div className="input-content">
                <IntlCurrencyInput
                  placeholder={EXPENSE_TEXTS.ASIDE_CREATE.PLACEHOLDER_AMOUNT}
                  decimalsLimit={2}
                  value={amount}
                  onValueChange={(value) => onAmountChange(value || "0")}
                  intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                  decimalSeparator=","
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <InputSelect
            label={EXPENSE_TEXTS.ASIDE_CREATE.LABEL_PAYMENT_METHOD}
            value={paymentMethodName}
            options={paymentMethodOptions}
            onChange={(value: string) => onPaymentMethodChange(value)}
            disabled={isLoading}
          />
          <InputSelect
            label={EXPENSE_TEXTS.ASIDE_CREATE.LABEL_CATEGORY}
            value={categoryName}
            options={categoryOptions}
            onChange={(value: string) => onCategoryChange(value)}
            disabled={isLoading}
          />
          <InputSelect
            label={EXPENSE_TEXTS.ASIDE_CREATE.LABEL_SUBCATEGORY}
            value={subcategoryName}
            options={subcategoryOptions}
            onChange={(value: string) => onSubcategoryChange(value)}
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
              {EXPENSE_TEXTS.BUTTON_CANCEL}
            </Button>
          </div>
        </AsideFooter>
      }
    />
  );
};
