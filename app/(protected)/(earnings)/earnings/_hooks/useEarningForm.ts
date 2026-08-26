import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { earningSchema } from "@/schemas";
import { z } from "zod";
import { useCallback, useEffect, useState } from "react";

type EarningFormValues = z.infer<typeof earningSchema>;

interface IncomeSource {
  id: string;
  name: string;
}

interface PopulateData {
  amount?: string;
  incomeSourceId?: string;
  incomeSourceName?: string;
  date?: string;
}

export function useEarningForm() {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);

  useEffect(() => {
    fetch("/api/income-sources")
      .then((res) => res.json())
      .then((data) => setIncomeSources(Array.isArray(data?.items) ? data?.items : []))
      .catch(() => setIncomeSources([]));
  }, []);

  const form = useForm<EarningFormValues>({
    resolver: zodResolver(earningSchema),
    defaultValues: {
      amount: "",
      incomeSourceId: "",
      date: new Date().toLocaleDateString("pt-BR"),
    },
  });

  const amount = form.watch("amount");
  const incomeSourceId = form.watch("incomeSourceId");
  const [date, setDate] = useState(new Date().toLocaleDateString("pt-BR"));

  const isValid = amount.trim() !== "" && !!incomeSourceId?.trim();

  const incomeSourceOptions = incomeSources.map((s) => s.name);

  const handleIncomeSourceChange = useCallback(
    (name: string) => {
      const source = incomeSources.find((s) => s.name === name);
      if (source) form.setValue("incomeSourceId", source.id);
    },
    [incomeSources, form],
  );

  const reset = useCallback(() => {
    form.reset({ amount: "", incomeSourceId: "" });
    setDate(new Date().toLocaleDateString("pt-BR"));
  }, [form]);

  const populate = useCallback(
    (data: PopulateData) => {
      if (data.amount !== undefined) form.setValue("amount", data.amount);
      if (data.incomeSourceId !== undefined)
        form.setValue("incomeSourceId", data.incomeSourceId);
      if (data.date !== undefined)
        setDate(new Date(data.date).toLocaleDateString("pt-BR"));
    },
    [form],
  );

  const getValues = useCallback(
    () => ({ ...form.getValues(), date }),
    [form, date],
  );

  const incomeSourceName =
    incomeSources.find((s) => s.id === incomeSourceId)?.name ?? "";

  return {
    watch: form.watch,
    setValue: form.setValue,
    reset,
    populate,
    getValues,
    amount,
    date,
    setDate,
    incomeSourceId,
    incomeSourceOptions,
    incomeSources,
    incomeSourceName,
    handleIncomeSourceChange,
    isValid,
    form,
  };
}
