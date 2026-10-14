"use client";

import { useState } from "react";
import { Badge, DataTable, InputSelect } from "design-system-zeroz";
import {
  EarningImportTransaction,
  IncomeSourceOption,
} from "../_utils/import-api";

const ROWS_PER_PAGE = 5;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export type EarningRowPatch = {
  incomeSourceId?: string | null;
};

interface Props {
  transactions: EarningImportTransaction[];
  incomeSources: IncomeSourceOption[];
  onChange: (id: string, patch: EarningRowPatch) => void;
}

const StatusBadge = ({ t }: { t: EarningImportTransaction }) => {
  if (t.status === "IGNORED") {
    return <Badge label="Ignorado" type="light" variant="warning" />;
  }
  if (t.origin === "RULE") {
    return <Badge label="Sugerido" type="light" variant="primary" />;
  }
  if (t.incomeSourceId) {
    return <Badge label="Pronto" type="light" variant="success" />;
  }
  return <Badge label="Pendente" type="light" variant="default" />;
};

const EarningImportTable = ({
  transactions,
  incomeSources,
  onChange,
}: Props) => {
  const sourceNames = incomeSources.map((s) => s.name);

  const [page, setPage] = useState(1);
  const pageTransactions = transactions.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE,
  );

  const previewRows = pageTransactions.map((t) => {
    const ignored = t.status === "IGNORED";
    const source = incomeSources.find((s) => s.id === t.incomeSourceId);

    return {
      id: t.id,
      date: t.date.toLocaleDateString("pt-BR"),
      title: t.title,
      amount: currencyFormatter.format(t.amount),
      status: <StatusBadge t={t} />,
      incomeSource: ignored ? (
        <span>—</span>
      ) : (
        <InputSelect
          value={source?.name ?? ""}
          onChange={(name: string) => {
            const picked = incomeSources.find((s) => s.name === name);
            onChange(t.id, { incomeSourceId: picked?.id ?? null });
          }}
          options={sourceNames}
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
        { key: "incomeSource", label: "Fonte de renda", minWidth: 200 },
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

export default EarningImportTable;
