-- Rename tables
ALTER TABLE "Categoria" RENAME TO "Category";
ALTER TABLE "Subcategoria" RENAME TO "Subcategory";
ALTER TABLE "FormaDePagamento" RENAME TO "PaymentMethod";
ALTER TABLE "FonteDeRenda" RENAME TO "IncomeSource";

-- Rename columns in Expense
ALTER TABLE "Expense" RENAME COLUMN "categoriaId" TO "categoryId";
ALTER TABLE "Expense" RENAME COLUMN "subcategoriaId" TO "subcategoryId";
ALTER TABLE "Expense" RENAME COLUMN "formaDePagamentoId" TO "paymentMethodId";

-- Rename Transaction column
ALTER TABLE "Transaction" RENAME COLUMN "categoryId" TO "incomeSourceId";

-- Rename Account columns
ALTER TABLE "Account" RENAME COLUMN "refresh_token" TO "refreshToken";
ALTER TABLE "Account" RENAME COLUMN "access_token" TO "accessToken";
ALTER TABLE "Account" RENAME COLUMN "expires_at" TO "expiresAt";
ALTER TABLE "Account" RENAME COLUMN "token_type" TO "tokenType";
ALTER TABLE "Account" RENAME COLUMN "id_token" TO "idToken";
ALTER TABLE "Account" RENAME COLUMN "session_state" TO "sessionState";
