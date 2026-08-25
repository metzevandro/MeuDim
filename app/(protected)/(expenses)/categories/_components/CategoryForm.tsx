import React from "react";
import {
  Aside,
  AsideContent,
  AsideFooter,
  Button,
  Input,
  Tag,
} from "design-system-zeroz";
import { CATEGORY_TEXTS } from "../_utils/const";

interface CategoryFormProps {
  isOpen: boolean;
  isEditMode?: boolean;
  name: string;
  subcategoryDraft: string;
  subcategories: string[];
  isFormValid?: boolean;
  onNameChange: (value: string) => void;
  onSubcategoryDraftChange: (value: string) => void;
  onAddSubcategory: () => void;
  onRemoveSubcategory: (subcategory: string) => void;
  onToggleAside: () => void;
  onSubmit: () => void | Promise<void>;
}

/**
 * Aside de criação/edição de categoria (nome + subcategorias).
 * O mesmo componente atende os dois modos, alternando textos e rótulo do botão.
 */
export const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  isEditMode = false,
  name,
  subcategoryDraft,
  subcategories,
  isFormValid = true,
  onNameChange,
  onSubcategoryDraftChange,
  onAddSubcategory,
  onRemoveSubcategory,
  onToggleAside,
  onSubmit,
}) => {
  const texts = isEditMode
    ? CATEGORY_TEXTS.ASIDE_EDIT
    : CATEGORY_TEXTS.ASIDE_CREATE;
  const buttonLabel = isEditMode
    ? CATEGORY_TEXTS.BUTTON_UPDATE
    : CATEGORY_TEXTS.BUTTON_ADD;

  return (
    <Aside
      isOpen={isOpen}
      toggleAside={onToggleAside}
      title={texts.TITLE}
      description={texts.DESCRIPTION}
      content={
        <AsideContent>
          <Input
            label={CATEGORY_TEXTS.ASIDE_CREATE.LABEL_NAME}
            placeholder={CATEGORY_TEXTS.ASIDE_CREATE.PLACEHOLDER_NAME}
            value={name}
            onChange={(e: any) => onNameChange(e.target.value)}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "end" }}>
            <Input
              label={CATEGORY_TEXTS.ASIDE_CREATE.LABEL_SUBCATEGORY}
              placeholder={CATEGORY_TEXTS.ASIDE_CREATE.PLACEHOLDER_SUBCATEGORY}
              value={subcategoryDraft}
              onChange={(e: any) => onSubcategoryDraftChange(e.target.value)}
            />
            <div style={{ width: "min-content" }}>
              <Button size="md" variant="primary" onClick={onAddSubcategory}>
                {CATEGORY_TEXTS.BUTTON_ADD_SUBCATEGORY}
              </Button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {subcategories.map((subcategory) => (
              <Tag
                key={subcategory}
                content={subcategory}
                onClose={() => onRemoveSubcategory(subcategory)}
                variant="secondary"
              />
            ))}
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
              disabled={!isFormValid}
            >
              {buttonLabel}
            </Button>
            <Button size="md" variant="secondary" onClick={onToggleAside}>
              {CATEGORY_TEXTS.BUTTON_CANCEL}
            </Button>
          </div>
        </AsideFooter>
      }
    />
  );
};
