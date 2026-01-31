/*
  Warnings:

  - You are about to drop the column `categoriaId` on the `Subcategory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,categoryId]` on the table `Subcategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `Subcategory` table without a default value. This is not possible if the table is not empty.

*/

-- Drop FK antiga
ALTER TABLE "Subcategory"
DROP CONSTRAINT IF EXISTS "Subcategoria_categoriaId_fkey";

-- Drop index antigo
DROP INDEX IF EXISTS "Subcategoria_name_categoriaId_key";

-- Rename PKs
ALTER TABLE "Category"
RENAME CONSTRAINT "Categoria_pkey" TO "Category_pkey";

ALTER TABLE "IncomeSource"
RENAME CONSTRAINT "FonteDeRenda_pkey" TO "IncomeSource_pkey";

ALTER TABLE "PaymentMethod"
RENAME CONSTRAINT "FormaDePagamento_pkey" TO "PaymentMethod_pkey";

ALTER TABLE "Subcategory"
RENAME CONSTRAINT "Subcategoria_pkey" TO "Subcategory_pkey";

-- 🔥 ALTER TABLE CORRETO
ALTER TABLE "Subcategory"
DROP COLUMN IF EXISTS "categoriaId",
ADD COLUMN "categoryId" TEXT NOT NULL;

-- Create new unique index
CREATE UNIQUE INDEX "Subcategory_name_categoryId_key"
ON "Subcategory" ("name", "categoryId");

-- Rename FKs
ALTER TABLE "Expense"
RENAME CONSTRAINT "Expense_categoriaId_fkey" TO "Expense_categoryId_fkey";

ALTER TABLE "Expense"
RENAME CONSTRAINT "Expense_formaDePagamentoId_fkey" TO "Expense_paymentMethodId_fkey";

ALTER TABLE "Expense"
RENAME CONSTRAINT "Expense_subcategoriaId_fkey" TO "Expense_subcategoryId_fkey";

ALTER TABLE "Transaction"
RENAME CONSTRAINT "Transaction_categoryId_fkey" TO "Transaction_incomeSourceId_fkey";

-- Add FK nova
ALTER TABLE "Subcategory"
ADD CONSTRAINT "Subcategory_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename indexes
ALTER INDEX "Categoria_name_userId_key"
RENAME TO "Category_name_userId_key";

ALTER INDEX "FonteDeRenda_name_userId_key"
RENAME TO "IncomeSource_name_userId_key";

ALTER INDEX "FormaDePagamento_name_userId_key"
RENAME TO "PaymentMethod_name_userId_key";
