import * as z from "zod";

export const accountSchema = z
  .object({
    username: z.optional(z.string()),
    name: z.optional(z.string()),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine((data) => !(data.password && !data.newPassword), {
    message: "New password is required!",
    path: ["newPassword"],
  })
  .refine((data) => !(data.newPassword && !data.password), {
    message: "Password is required!",
    path: ["password"],
  });

export const newPasswordSchema = z.object({
  password: z.string().min(8, "É necessário no mínimo 8 caracteres!"),
});

export const resetSchema = z.object({
  email: z.string().email("É necessário um email!"),
});

export const loginSchema = z.object({
  email: z.string().email("É necessário um email!"),
  password: z.string().min(1, "É necessário senha!"),
});

export const registerSchema = z.object({
  email: z.string().email("É necessário um email!"),
  password: z.string().min(8, "É necessário no mínimo 8 caracteres!"),
  name: z.string().min(1, "É necessário seu nome!"),
});

export const earningSchema = z.object({
  amount: z
    .string()
    .min(1, "Valor é obrigatório")
    .refine((v) => {
      const parsed = parseFloat(v.replace(",", "."));
      return !isNaN(parsed) && parsed > 0;
    }, "Valor deve ser maior que R$ 0,00")
    .refine((v) => {
      const parsed = parseFloat(v.replace(",", "."));
      return parsed <= 999999999.99;
    }, "Valor excede o limite permitido"),
  incomeSourceId: z.string().min(1, "Fonte de renda é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
});

export const expenseSchema = z.object({
  amount: z
    .string()
    .min(1, "Valor é obrigatório")
    .refine((v) => {
      const parsed = parseFloat(v.replace(",", "."));
      return !isNaN(parsed) && parsed > 0;
    }, "Valor deve ser maior que R$ 0,00")
    .refine((v) => {
      const parsed = parseFloat(v.replace(",", "."));
      return parsed <= 999999999.99;
    }, "Valor excede o limite permitido"),
  categoryId: z.string().cuid("Categoria inválida"),
  subcategoryId: z.string().cuid("Subcategoria inválida"),
  paymentMethodId: z.string().cuid("Forma de pagamento inválida"),
  date: z.string().min(1, "Data é obrigatória"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "É necessário um nome para a categoria!"),

  subcategoria: z
    .array(z.string().min(1, "O nome da subcategoria não pode estar vazio!"))
    .default([]),
});

export const subcategorySchema = z.object({
  name: z.string().min(1, "É necessário um nome para a subcategoria!"),
  categoryId: z.string().cuid("Categoria inválida"),
});

export const paymentMethodSchema = z.object({
  name: z.string().min(1, "O nome da forma de pagamento é obrigatório."),
});

export const incomeSourceSchema = z.object({
  name: z.string().min(1, "É necessário um nome para a fonte de renda!"),
  date: z.date(),
});

export const importTransactionsSchema = z.object({
  items: z
    .array(
      z.object({
        importKey: z.string().min(1).max(300),
        date: z.string().refine((v) => !isNaN(Date.parse(v)), "Data inválida"),
        title: z.string().min(1).max(300),
        amount: z.number().positive("Valor deve ser maior que R$ 0,00"),
        categoryId: z.string().cuid("Categoria inválida"),
        subcategoryId: z.string().cuid("Subcategoria inválida"),
        paymentMethodId: z.string().cuid("Forma de pagamento inválida"),
        learn: z.boolean(),
      }),
    )
    .min(1, "Nenhuma transação para importar")
    .max(2000, "Limite de 2000 transações por importação"),
});

export const importEarningsSchema = z.object({
  items: z
    .array(
      z.object({
        importKey: z.string().min(1).max(300),
        date: z.string().refine((v) => !isNaN(Date.parse(v)), "Data inválida"),
        title: z.string().min(1).max(300),
        amount: z.number().positive("Valor deve ser maior que R$ 0,00"),
        incomeSourceId: z.string().cuid("Fonte de renda inválida"),
        learn: z.boolean(),
      }),
    )
    .min(1, "Nenhuma transação para importar")
    .max(2000, "Limite de 2000 transações por importação"),
});
