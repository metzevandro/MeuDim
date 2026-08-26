import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema } from "@/schemas";
import { z } from "zod";
import { useCallback, useEffect, useMemo, useState } from "react";

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface PaymentMethod {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface PopulateData {
  amount?: string;
  paymentMethodId?: string;
  paymentMethodName?: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  date?: string;
}

export function useExpenseForm() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/payment-methods")
      .then((res) => res.json())
      .then((data) => setPaymentMethods(Array.isArray(data?.items) ? data?.items : []))
      .catch(() => setPaymentMethods([]));

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data?.items) ? data?.items : []))
      .catch(() => setCategories([]));
  }, []);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      paymentMethodId: "",
      categoryId: "",
      subcategoryId: "",
      date: new Date().toLocaleDateString("pt-BR"),
    },
  });

  const amount = form.watch("amount");
  const paymentMethodId = form.watch("paymentMethodId");
  const categoryId = form.watch("categoryId");
  const subcategoryId = form.watch("subcategoryId");
  const [date, setDate] = useState(new Date().toLocaleDateString("pt-BR"));

  const subcategories = useMemo(() => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.subcategories ?? [];
  }, [categories, categoryId]);

  const isValid =
    amount.trim() !== "" &&
    !!paymentMethodId?.trim() &&
    !!categoryId?.trim() &&
    !!subcategoryId?.trim();

  const paymentMethodOptions = paymentMethods.map((s) => s.name);
  const categoryOptions = categories.map((s) => s.name);
  const subcategoryOptions = subcategories.map((s) => s.name);

  const handlePaymentMethodChange = useCallback(
    (name: string) => {
      const method = paymentMethods.find((s) => s.name === name);
      if (method) form.setValue("paymentMethodId", method.id);
    },
    [paymentMethods, form],
  );

  const handleCategoryChange = useCallback(
    (name: string) => {
      const category = categories.find((s) => s.name === name);
      if (category) {
        form.setValue("categoryId", category.id);
        form.setValue("subcategoryId", "");
      }
    },
    [categories, form],
  );

  const handleSubcategoryChange = useCallback(
    (name: string) => {
      const subcategory = subcategories.find((s) => s.name === name);
      if (subcategory) form.setValue("subcategoryId", subcategory.id);
    },
    [subcategories, form],
  );

  const reset = useCallback(() => {
    form.reset({
      amount: "",
      paymentMethodId: "",
      categoryId: "",
      subcategoryId: "",
    });
    setDate(new Date().toLocaleDateString("pt-BR"));
  }, [form]);

  const populate = useCallback(
    (data: PopulateData) => {
      if (data.amount !== undefined) form.setValue("amount", data.amount);
      if (data.paymentMethodId !== undefined)
        form.setValue("paymentMethodId", data.paymentMethodId);
      if (data.categoryId !== undefined)
        form.setValue("categoryId", data.categoryId);
      if (data.subcategoryId !== undefined)
        form.setValue("subcategoryId", data.subcategoryId);
      if (data.date !== undefined)
        setDate(new Date(data.date).toLocaleDateString("pt-BR"));
    },
    [form],
  );

  const getValues = useCallback(
    () => ({ ...form.getValues(), date }),
    [form, date],
  );

  const paymentMethodName =
    paymentMethods.find((s) => s.id === paymentMethodId)?.name ?? "";
  const categoryName = categories.find((s) => s.id === categoryId)?.name ?? "";
  const subcategoryName =
    subcategories.find((s) => s.id === subcategoryId)?.name ?? "";

  return {
    watch: form.watch,
    setValue: form.setValue,
    reset,
    populate,
    getValues,
    amount,
    date,
    setDate,
    paymentMethodId,
    paymentMethodOptions,
    paymentMethods,
    paymentMethodName,
    handlePaymentMethodChange,
    categoryId,
    categoryOptions,
    categories,
    categoryName,
    handleCategoryChange,
    subcategoryId,
    subcategoryOptions,
    subcategories,
    subcategoryName,
    handleSubcategoryChange,
    isValid,
    form,
  };
}
