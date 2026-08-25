import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback, useState } from "react";
import { categorySchema } from "@/schemas";

/**
 * Hook que gerencia a validação e estado do formulário de Categoria.
 *
 * O campo `subcategoria` do schema é um array de strings — a lista de
 * subcategorias já adicionadas (pode ser vazia, categoria não é obrigada
 * a ter subcategoria). O texto que o usuário está digitando antes de
 * clicar em "Adicionar" fica em `subcategoryDraft`, um estado separado
 * que nunca é, sozinho, o valor do campo do formulário.
 *
 * Uso:
 * const form = useCategoryForm();
 * <Input value={form.name} onChange={(e) => form.setName(e.target.value)} />
 * <Input value={form.subcategoryDraft} onChange={(e) => form.setSubcategoryDraft(e.target.value)} />
 * <Button onClick={form.addSubcategory}>Adicionar</Button>
 */
export function useCategoryForm() {
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      subcategoria: [],
    },
  });

  const [subcategoryDraft, setSubcategoryDraft] = useState("");

  const name = form.watch("name");
  const subcategories = form.watch("subcategoria") || [];
  const isValid = !!name;

  const reset = useCallback(() => {
    form.reset({ name: "", subcategoria: [] });
    setSubcategoryDraft("");
  }, [form]);

  const populate = useCallback(
    (data: { name: string; subcategorias?: string[] }) => {
      form.setValue("name", data.name || "");
      form.setValue("subcategoria", data.subcategorias || []);
      setSubcategoryDraft("");
    },
    [form],
  );

  const setName = useCallback(
    (value: string) => form.setValue("name", value),
    [form],
  );

  const addSubcategory = useCallback(() => {
    const value = subcategoryDraft.trim();
    if (!value) return;

    const current = form.getValues("subcategoria") || [];
    if (current.includes(value)) {
      setSubcategoryDraft("");
      return;
    }

    form.setValue("subcategoria", [...current, value]);
    setSubcategoryDraft("");
  }, [subcategoryDraft, form]);

  const removeSubcategory = useCallback(
    (value: string) => {
      const current = form.getValues("subcategoria") || [];
      form.setValue(
        "subcategoria",
        current.filter((item) => item !== value),
      );
    },
    [form],
  );

  const getValues = () => form.getValues();

  return {
    handleSubmit: form.handleSubmit,
    reset,
    populate,
    setName,
    subcategoryDraft,
    setSubcategoryDraft,
    addSubcategory,
    removeSubcategory,
    getValues,
    name,
    subcategories,
    isValid,
    form,
  };
}
