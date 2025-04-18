-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_formaDePagamentoId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_subcategoriaId_fkey";

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_subcategoriaId_fkey" FOREIGN KEY ("subcategoriaId") REFERENCES "Subcategoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_formaDePagamentoId_fkey" FOREIGN KEY ("formaDePagamentoId") REFERENCES "FormaDePagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
