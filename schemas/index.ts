import * as z from "zod";

export const SettingsSchema = z
  .object({
    username: z.optional(z.string()),
    name: z.optional(z.string()),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }
      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }
      return true;
    },
    {
      message: "Password is required!",
      path: ["password"],
    },
  );

export const NovaSenhaSchema = z.object({
  password: z.string().min(8, "É necessário no mínimo 8 caracteres!"),
});

export const ResetSchema = z.object({
  email: z.string().email("É necessário um email!"),
});

export const LoginSchema = z.object({
  email: z.string().email("É necessário um email!"),
  password: z.string().min(1, "É necessário senha!"),
});

export const RegisterSchema = z.object({
  email: z.string().email("É necessário um email!"),
  password: z.string().min(8, "É necessário no mínimo 8 caracteres!"),
  name: z.string().min(1, "É necessário seu nome!"),
});

export const TransactionSchema = z.object({
  amount: z.string(),
  date: z.string(),
  category: z.string(),
});

export const ExpenseSchema = z.object({
  valor: z.string().min(0, "O valor deve ser maior ou igual a 0"),
  data: z.string().nonempty("A data é obrigatória"),
  categoria: z.string().nonempty("A categoria é obrigatória"),
  formaDePagamento: z.string().nonempty("A forma de pagamento é obrigatória"),
  subcategoria: z.string().nonempty("A subcategoria é obrigatória"),
});

export const NewCategorySchema = z.object({
  name: z.string().min(1, "É necessário um nome para a fonte de renda!"),
  date: z.date(),
});

export const NovaCategoriaSchema = z.object({
  name: z.string().min(1, "É necessário um nome para a fonte de renda!"),
  date: z.date(),
  subcategoria: z.string(),
});

export const FormaDePagamentoSchema = z.object({
  name: z.string().min(1, "O nome da forma de pagamento é obrigatório."),
  date: z.date(),
});
