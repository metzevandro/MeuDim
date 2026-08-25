import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incomeSourceSchema } from "@/schemas";
import { z } from "zod";
import { useCallback } from "react";

/**
 * Hook que gerencia a validação e estado do formulário de Fonte de Renda
 *
 * Uso:
 * const form = useIncomeSourceForm();
 * <Input value={form.name} onChange={form.setName} />
 * const isValid = form.isValid;
 */
export function useIncomeSourceForm() {
  const form = useForm<z.infer<typeof incomeSourceSchema>>({
    resolver: zodResolver(incomeSourceSchema),
    defaultValues: {
      name: "",
    },
  });

  const name = form.watch("name");
  const isValid = !!name?.trim();

  const setName = useCallback(
    (value: string) => {
      form.setValue("name", value);
    },
    [form],
  );

  const reset = useCallback(() => {
    form.reset({ name: "" });
  }, [form]);

  const populate = useCallback(
    (data: { name: string }) => {
      form.setValue("name", data.name || "");
    },
    [form],
  );

  const getValues = () => form.getValues();

  return {
    watch: form.watch,
    setValue: form.setValue,
    reset,
    populate,
    getValues,
    name,
    isValid,
    form,
  };
}
