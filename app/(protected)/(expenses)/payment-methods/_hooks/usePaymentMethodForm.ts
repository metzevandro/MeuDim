import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentMethodSchema } from "@/schemas";
import { z } from "zod";
import { useCallback } from "react";

/**
 * Hook que gerencia a validação e estado do formulário de Forma de Pagamento
 *
 * Uso:
 * const form = usePaymentMethodForm();
 * <Input value={form.name} onChange={form.setName} />
 * const isValid = form.isValid;
 */
export function usePaymentMethodForm() {
  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: "",
    },
  });

  const name = form.watch("name");
  const isValid = !!name?.trim();

  const reset = useCallback(() => {
    form.reset({ name: "" });
  }, [form]);

  const populate = useCallback(
    (data: { name: string }) => {
      form.setValue("name", data.name || "");
    },
    [form],
  );

  const setName = useCallback(
    (value: string) => {
      form.setValue("name", value);
    },
    [form],
  );

  const getValues = () => form.getValues();

  return {
    watch: form.watch,
    setValue: form.setValue,
    setName,
    reset,
    populate,
    getValues,
    name,
    isValid,
    form,
  };
}
