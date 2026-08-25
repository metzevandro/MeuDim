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
import { EARNING_TEXTS } from "../_utils/const";

interface EarningFormProps {
  isOpen: boolean;
  isEditMode?: boolean;
  amount: string;
  date: string;
  incomeSourceName: string;
  incomeSourceOptions: string[];
  isFormValid: boolean;
  onAmountChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onIncomeSourceChange: (value: string) => void;
  onToggleAside: () => void;
  onSubmit: () => void | Promise<void>;
  isLoading?: boolean;
}

export const EarningForm: React.FC<EarningFormProps> = ({
  isOpen,
  isEditMode = false,
  amount,
  date,
  incomeSourceName,
  incomeSourceOptions,
  isFormValid,
  onAmountChange,
  onDateChange,
  onIncomeSourceChange,
  onToggleAside,
  onSubmit,
  isLoading = false,
}) => {
  const texts = isEditMode
    ? EARNING_TEXTS.ASIDE_EDIT
    : EARNING_TEXTS.ASIDE_CREATE;
  const buttonLabel = isEditMode
    ? EARNING_TEXTS.BUTTON_UPDATE
    : EARNING_TEXTS.BUTTON_ADD;

  return (
    <Aside
      isOpen={isOpen}
      toggleAside={onToggleAside}
      title={texts.TITLE}
      description={texts.DESCRIPTION}
      content={
        <AsideContent>
          <DatePicker
            label={EARNING_TEXTS.ASIDE_CREATE.LABEL_DATE}
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
                  placeholder={EARNING_TEXTS.ASIDE_CREATE.PLACEHOLDER_AMOUNT}
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
            label={EARNING_TEXTS.ASIDE_CREATE.LABEL_INCOME_SOURCE}
            value={incomeSourceName}
            options={incomeSourceOptions}
            onChange={(value: string) => onIncomeSourceChange(value)}
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
              {EARNING_TEXTS.BUTTON_CANCEL}
            </Button>
          </div>
        </AsideFooter>
      }
    />
  );
};
