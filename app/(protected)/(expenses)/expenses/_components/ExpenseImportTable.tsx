"use client";

import { useState } from "react";
import { Badge, DataTable, InputSelect } from "design-system-zeroz";
import { CreditCardTransaction, isRowReady } from "../_utils/bank-credit-card";
import { CategoryOption, PaymentMethodOption } from "../_utils/import-api";

const ROWS_PER_PAGE = 5;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export type RowPatch = {
  categoryId?: string | null;
  subcategoryId?: string | null;
  paymentMethodId?: string | null;
};

interface Props {
  transactions: CreditCardTransaction[];
  categories: CategoryOption[];
  paymentMethods: PaymentMethodOption[];
  perRowPaymentMethod: boolean;
  onChange: (id: string, patch: RowPatch) => void;
}

const StatusBadge = ({
  t,
  perRowPaymentMethod,
}: {
  t: CreditCardTransaction;
  perRowPaymentMethod: boolean;
}) => {
  if (t.status === "IGNORED") {
    return <Badge label="Ignorado" type="light" variant="warning" />;
  }
  if (t.origin === "RULE") {
    return <Badge label="Sugerido" type="light" variant="primary" />;
  }
  if (isRowReady(t, perRowPaymentMethod)) {
    return <Badge label="Pronto" type="light" variant="success" />;
  }
  return <Badge label="Pendente" type="light" variant="default" />;
};

const ExpenseImportTable = ({
  transactions,
  categories,
  paymentMethods,
  perRowPaymentMethod,
  onChange,
}: Props) => {
  const categoryNames = categories.map((c) => c.name);
  const paymentMethodNames = paymentMethods.map((p) => p.name);

  const [page, setPage] = useState(1);
  const pageTransactions = transactions.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  const previewRows = pageTransactions.map((t) => {
    const ignored = t.status === "IGNORED";
    const category = categories.find((c) => c.id === t.categoryId);
    const subcategory = category?.subcategories.find(
      (s) => s.id === t.subcategoryId,
    );
    const subNames = category?.subcategories.map((s) => s.name) ?? [];
    const paymentMethod = paymentMethods.find(
      (p) => p.id === t.paymentMethodId,
    );

    return {
      id: t.id,
      date: t.date.toLocaleDateString("pt-BR"),
      title: t.title,
      amount: currencyFormatter.format(t.amount),
      status: <StatusBadge t={t} perRowPaymentMethod={perRowPaymentMethod} />,
      categoria: ignored ? (
        <span>—</span>
      ) : (
        <InputSelect
          value={category?.name ?? ""}
          onChange={(name: string) => {
            const picked = categories.find((c) => c.name === name);
            onChange(t.id, {
              categoryId: picked?.id ?? null,
              subcategoryId: null,
            });
          }}
          options={categoryNames}
        />
      ),
      subcategoria: ignored ? (
        <span>—</span>
      ) : (
        <InputSelect
          value={subcategory?.name ?? ""}
          onChange={(name: string) => {
            const picked = category?.subcategories.find((s) => s.name === name);
            onChange(t.id, { subcategoryId: picked?.id ?? null });
          }}
          options={subNames.length ? subNames : [""]}
        />
      ),
      pagamento: ignored ? (
        <span>—</span>
      ) : (
        <InputSelect
          value={paymentMethod?.name ?? ""}
          onChange={(name: string) => {
            const picked = paymentMethods.find((p) => p.name === name);
            onChange(t.id, { paymentMethodId: picked?.id ?? null });
          }}
          options={paymentMethodNames.length ? paymentMethodNames : [""]}
        />
      ),
    };
  });

  return (
    <DataTable
      columns={[
        { key: "date", label: "Data", minWidth: 150 },
        { key: "title", label: "Descrição", minWidth: 150 },
        { key: "amount", label: "Valor", minWidth: 150 },
        { key: "status", label: "Status", minWidth: 150 },
        { key: "categoria", label: "Categoria", minWidth: 150 },
        { key: "subcategoria", label: "Subcategoria", minWidth: 150 },
        ...(perRowPaymentMethod
          ? [{ key: "pagamento", label: "Forma de pagamento", minWidth: 180 }]
          : []),
      ]}
      data={previewRows}
      skeleton={false}
      rowsPerPage={ROWS_PER_PAGE}
      totalItems={transactions.length}
      page={page}
      onPageChange={setPage}
    />
  );
};

export default ExpenseImportTable;
